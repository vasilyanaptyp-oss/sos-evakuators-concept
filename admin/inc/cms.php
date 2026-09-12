<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

const CMS_PRIMARY_PHONE = '+371 22002700';
const CMS_PRIMARY_TEL = '+37122002700';
const CMS_SECONDARY_PHONE = '+371 20091762';
const CMS_SECONDARY_TEL = '+37120091762';
const CMS_EMAIL = 'tktrans@inbox.lv';
const CMS_ANALYTICS_VERSION = '20260912-bots';
const CMS_PUBLISHED_MARK = '<!-- cms:published -->';
// Prices as they are written in the built pages (the CMS rewrites every occurrence when they change).
const CMS_PRICE_DEFAULTS = ['auto' => '30', 'auto_km' => '0.80', 'kravas' => '150', 'kravas_km' => '1.50'];
// Additional services listed on «Citi pakalpojumi»: the admin can hide any of them without deleting pages.
const CMS_EXTRA_SERVICES = [
    'wells' => ['label' => 'Aku tīrīšana', 'pages' => ['lv' => 'aku-tirisana/index.html', 'ru' => 'ru/chistka-kolodtsev/index.html', 'en' => 'en/well-cleaning/index.html']],
    'waste' => ['label' => 'Atkritumu izvešana', 'pages' => ['lv' => 'atkritumu-izvesana/index.html', 'ru' => 'ru/vyvoz-musora/index.html', 'en' => 'en/waste-removal/index.html']],
    'fitness' => ['label' => 'EMS treniņi (EMS Fit Studio)', 'pages' => ['lv' => 'fitness/index.html', 'ru' => 'ru/fitnes/index.html', 'en' => 'en/fitness/index.html']],
];
const CMS_EXTRA_HUBS = ['lv' => 'citi-pakalpojumi/index.html', 'ru' => 'ru/drugie-uslugi/index.html', 'en' => 'en/other-services/index.html'];

function cms_strlen(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function cms_substr(string $value, int $start, int $length): string
{
    return function_exists('mb_substr') ? mb_substr($value, $start, $length, 'UTF-8') : substr($value, $start, $length);
}

function cms_default_state(): array
{
    return [
        'version' => 1,
        'global' => [
            'primary_phone' => CMS_PRIMARY_PHONE,
            'primary_tel' => CMS_PRIMARY_TEL,
            'secondary_phone' => CMS_SECONDARY_PHONE,
            'secondary_tel' => CMS_SECONDARY_TEL,
            'email' => CMS_EMAIL,
        ],
        'pages' => [],
        'meta' => [
            'updated_at' => date(DATE_ATOM),
            'published_at' => null,
        ],
    ];
}

function cms_state_path(string $kind): string
{
    if (!in_array($kind, ['draft', 'live'], true)) {
        throw new InvalidArgumentException('Nederīgs stāvoklis.');
    }
    return CMS_STORAGE . DIRECTORY_SEPARATOR . $kind . '.json';
}

function cms_get_state(string $kind): array
{
    $path = cms_state_path($kind);
    if (!is_file($path)) {
        if ($kind === 'draft' && is_file(cms_state_path('live'))) {
            $state = cms_read_json(cms_state_path('live'), cms_default_state());
        } else {
            $state = cms_default_state();
        }
        cms_write_json($path, $state);
        return $state;
    }
    $state = cms_read_json($path, cms_default_state());
    return array_replace_recursive(cms_default_state(), $state);
}

function cms_save_state(string $kind, array $state): void
{
    $state['version'] = 1;
    $state['meta']['updated_at'] = date(DATE_ATOM);
    cms_write_json(cms_state_path($kind), $state);
}

function cms_state_content(array $state): array
{
    return [
        'global' => $state['global'] ?? [],
        'pages' => $state['pages'] ?? [],
    ];
}

function cms_is_dirty(): bool
{
    return cms_state_content(cms_get_state('draft')) !== cms_state_content(cms_get_state('live'));
}

function cms_relative_path(string $absolute): string
{
    $root = rtrim(str_replace('\\', '/', CMS_ROOT), '/');
    $absolute = str_replace('\\', '/', $absolute);
    return ltrim(substr($absolute, strlen($root)), '/');
}

function cms_list_pages(): array
{
    $pages = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(CMS_ROOT, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($iterator as $file) {
        if (!$file->isFile() || strtolower($file->getExtension()) !== 'html') {
            continue;
        }
        $relative = cms_relative_path($file->getPathname());
        if (preg_match('#^(?:admin|\.git|node_modules|output|\.playwright-cli)/#', $relative)) {
            continue;
        }
        $pages[] = $relative;
    }
    sort($pages, SORT_NATURAL | SORT_FLAG_CASE);

    $result = [];
    foreach ($pages as $page) {
        $html = cms_read_baseline($page);
        $dom = cms_dom_load($html);
        $xpath = new DOMXPath($dom);
        $titleNode = $xpath->query('//title')->item(0);
        $h1Node = $xpath->query('//h1')->item(0);
        $htmlNode = $xpath->query('//html')->item(0);
        $language = $htmlNode instanceof DOMElement ? strtolower($htmlNode->getAttribute('lang')) : 'lv';
        $title = $h1Node ? trim(preg_replace('/\s+/u', ' ', $h1Node->textContent)) : ($titleNode ? trim($titleNode->textContent) : $page);
        $result[] = [
            'path' => $page,
            'url' => cms_page_url($page),
            'lang' => in_array($language, ['lv', 'ru', 'en'], true) ? $language : 'lv',
            'title' => $title,
            'seo_title' => $titleNode ? trim($titleNode->textContent) : '',
        ];
    }
    return $result;
}

function cms_page_url(string $page): string
{
    if ($page === 'index.html') {
        return '/';
    }
    if (substr($page, -11) === '/index.html') {
        return '/' . substr($page, 0, -10);
    }
    return '/' . $page;
}

function cms_baseline_path(string $page): string
{
    return CMS_STORAGE . DIRECTORY_SEPARATOR . 'baseline' . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $page);
}

function cms_ensure_baseline(string $page): void
{
    $page = cms_normalize_page($page);
    $baseline = cms_baseline_path($page);
    if (is_file($baseline)) {
        return;
    }
    $directory = dirname($baseline);
    if (!is_dir($directory) && !@mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('Neizdevās izveidot oriģināla kopiju.');
    }
    $source = CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $page);
    if (!@copy($source, $baseline)) {
        throw new RuntimeException('Neizdevās saglabāt lapas oriģinālu.');
    }
    @chmod($baseline, 0640);
}

function cms_page_has_saved_overrides(string $page): bool
{
    static $pagesWithOverrides = null;
    if ($pagesWithOverrides === null) {
        $pagesWithOverrides = [];
        foreach (['draft', 'live'] as $kind) {
            $path = cms_state_path($kind);
            if (!is_file($path)) {
                continue;
            }
            $state = cms_read_json($path, cms_default_state());
            foreach (array_keys((array) ($state['pages'] ?? [])) as $savedPage) {
                $pagesWithOverrides[(string) $savedPage] = true;
            }
        }
    }
    return isset($pagesWithOverrides[$page]);
}

function cms_sync_unedited_baseline(string $page): void
{
    if (cms_page_has_saved_overrides($page)) {
        return;
    }

    $source = CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $page);
    $baseline = cms_baseline_path($page);
    if (!is_file($source) || !is_file($baseline)) {
        return;
    }

    $sourceHtml = @file_get_contents($source);
    $baselineHtml = @file_get_contents($baseline);
    // A CMS-published file carries replaced phones, prices or hidden pages: only fresh deployments may refresh the baseline.
    if (is_string($sourceHtml) && str_contains($sourceHtml, CMS_PUBLISHED_MARK)) {
        return;
    }
    if ($sourceHtml === false || $baselineHtml === false || hash_equals(hash('sha256', $sourceHtml), hash('sha256', $baselineHtml))) {
        return;
    }

    $temporary = $baseline . '.sync-' . bin2hex(random_bytes(4));
    if (@file_put_contents($temporary, $sourceHtml, LOCK_EX) === false) {
        return;
    }
    @chmod($temporary, 0640);
    if (!@rename($temporary, $baseline)) {
        @unlink($temporary);
    }
}

function cms_read_baseline(string $page): string
{
    $page = cms_normalize_page($page);
    cms_ensure_baseline($page);
    cms_sync_unedited_baseline($page);
    $html = @file_get_contents(cms_baseline_path($page));
    if ($html === false) {
        throw new RuntimeException('Neizdevās nolasīt lapu.');
    }
    return $html;
}

/**
 * libxml serialises every non-ASCII character as an entity (&#1085;, &euro;, &nbsp;) which
 * multiplies the size of Latvian and Russian pages. Decode those back to UTF-8 and keep the
 * ASCII-significant ones (&lt; &gt; &amp; &quot; &#39;) exactly as they are.
 */
function cms_restore_utf8(string $html): string
{
    return (string) preg_replace_callback('/&(?:#\d{2,7}|#x[0-9a-fA-F]{2,6}|[A-Za-z][A-Za-z0-9]{1,31});/', static function (array $match): string {
        $decoded = html_entity_decode($match[0], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if ($decoded === $match[0] || $decoded === '' || (strlen($decoded) === 1 && ord($decoded) < 0x80)) {
            return $match[0];
        }
        return $decoded;
    }, $html);
}

function cms_dom_load(string $html): DOMDocument
{
    if (!class_exists('DOMDocument')) {
        throw new RuntimeException('Serverī nav ieslēgts PHP DOM paplašinājums.');
    }
    $previous = libxml_use_internal_errors(true);
    $dom = new DOMDocument('1.0', 'UTF-8');
    $dom->preserveWhiteSpace = true;
    $dom->formatOutput = false;
    $loaded = $dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    if (!$loaded) {
        throw new RuntimeException('Neizdevās apstrādāt lapas HTML.');
    }
    return $dom;
}

function cms_node_xpath(DOMNode $node): string
{
    if ($node instanceof DOMDocument) {
        return '';
    }
    $parent = $node->parentNode;
    if (!$parent) {
        return '';
    }
    if ($node->nodeType === XML_TEXT_NODE) {
        $position = 1;
        foreach ($parent->childNodes as $sibling) {
            if ($sibling === $node) {
                break;
            }
            if ($sibling->nodeType === XML_TEXT_NODE) {
                $position++;
            }
        }
        return cms_node_xpath($parent) . '/text()[' . $position . ']';
    }
    $name = strtolower($node->nodeName);
    $position = 1;
    foreach ($parent->childNodes as $sibling) {
        if ($sibling === $node) {
            break;
        }
        if ($sibling->nodeType === XML_ELEMENT_NODE && strtolower($sibling->nodeName) === $name) {
            $position++;
        }
    }
    return cms_node_xpath($parent) . '/' . $name . '[' . $position . ']';
}

function cms_page_state(array $state, string $page): array
{
    $default = ['seo' => [], 'texts' => [], 'attributes' => [], 'images' => [], 'blocks' => []];
    $saved = isset($state['pages'][$page]) && is_array($state['pages'][$page]) ? $state['pages'][$page] : [];
    return array_replace($default, $saved);
}

function cms_replace_global_values(string $html, array $global): string
{
    $primary = trim((string) ($global['primary_phone'] ?? CMS_PRIMARY_PHONE));
    $primaryTel = preg_replace('/[^+0-9]/', '', (string) ($global['primary_tel'] ?? $primary));
    $secondary = trim((string) ($global['secondary_phone'] ?? CMS_SECONDARY_PHONE));
    $secondaryTel = preg_replace('/[^+0-9]/', '', (string) ($global['secondary_tel'] ?? $secondary));
    $email = trim((string) ($global['email'] ?? CMS_EMAIL));
    $html = str_replace(
        [CMS_PRIMARY_PHONE, CMS_PRIMARY_TEL, '37122002700', CMS_SECONDARY_PHONE, CMS_SECONDARY_TEL, '37120091762', CMS_EMAIL],
        [$primary, $primaryTel, ltrim($primaryTel, '+'), $secondary, $secondaryTel, ltrim($secondaryTel, '+'), $email],
        $html
    );
    return cms_replace_prices($html, cms_prices_get($global));
}

function cms_prices_get(array $global): array
{
    $prices = [];
    foreach (CMS_PRICE_DEFAULTS as $key => $default) {
        $value = (string) ($global['price_' . $key] ?? '');
        $prices[$key] = preg_match('/^\d{1,5}(\.\d{1,2})?$/', $value) ? $value : $default;
    }
    return $prices;
}

function cms_price_display(string $value, string $lang): string
{
    if (strpos($value, '.') !== false) {
        [$whole, $fraction] = explode('.', $value, 2);
        $fraction = rtrim($fraction, '0');
        $value = $fraction === '' ? $whole : $whole . '.' . str_pad($fraction, 2, '0');
    }
    return $lang === 'en' ? $value : str_replace('.', ',', $value);
}

function cms_replace_prices(string $html, array $prices): string
{
    $lang = preg_match('/<html[^>]*\blang="([a-z]{2})"/i', $html, $m) ? strtolower($m[1]) : 'lv';
    $tokens = [];
    $values = [];
    $index = 0;
    foreach (CMS_PRICE_DEFAULTS as $key => $default) {
        $current = (string) ($prices[$key] ?? $default);
        if ($current === $default) {
            continue;
        }
        $defaultPattern = str_replace('\.', '[.,]', preg_quote($default, '/'));
        $token = "\x00CMSPRICE" . $index++ . "\x00";
        $tokens['/(?<![\d.,])' . $defaultPattern . ' €/u'] = $token;
        $values[$token] = cms_price_display($current, $lang) . ' €';
        if ($key === 'auto' || $key === 'kravas') {
            $tokenMin = "\x00CMSPRICE" . $index++ . "\x00";
            $tokens['/"minPrice":' . preg_quote($default, '/') . '(?![\d.])/'] = $tokenMin;
            $values[$tokenMin] = '"minPrice":' . $current;
        }
    }
    if (!$tokens) {
        return $html;
    }
    $html = (string) preg_replace(array_keys($tokens), array_values($tokens), $html);
    return str_replace(array_keys($values), array_values($values), $html);
}

function cms_save_prices_draft(array $payload): array
{
    $prices = [];
    foreach (CMS_PRICE_DEFAULTS as $key => $default) {
        $value = str_replace([',', ' '], ['.', ''], trim((string) ($payload['price_' . $key] ?? '')));
        if (!preg_match('/^\d{1,5}(\.\d{1,2})?$/', $value)) {
            throw new InvalidArgumentException('Cena jānorāda kā skaitlis, piemēram 30 vai 0,80.');
        }
        $prices['price_' . $key] = $value;
    }
    $state = cms_get_state('draft');
    $state['global'] = array_merge((array) ($state['global'] ?? []), $prices);
    cms_save_state('draft', $state);
    return $state;
}

function cms_valid_asset_src(string $src): bool
{
    return (bool) preg_match('#^(?:/|(?:\.\./)*)assets/(?:images|uploads)/[A-Za-z0-9._/-]+$#', $src);
}

function cms_safe_href(string $href): string
{
    $href = trim($href);
    if ($href === '') {
        return '#';
    }
    if (preg_match('#^(?:https://|tel:\+?[0-9 ()-]+$|mailto:[^\s@]+@[^\s@]+\.[^\s@]+$|/|\./|\.\./|#)#i', $href)) {
        return $href;
    }
    return '#';
}

function cms_apply_overrides(DOMDocument $dom, array $pageState): void
{
    $xpath = new DOMXPath($dom);
    $seo = $pageState['seo'] ?? [];
    if (isset($seo['title'])) {
        $node = $xpath->query('//title')->item(0);
        if ($node) {
            $node->nodeValue = (string) $seo['title'];
        }
    }
    if (isset($seo['description'])) {
        $node = $xpath->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="description"]')->item(0);
        if ($node instanceof DOMElement) {
            $node->setAttribute('content', (string) $seo['description']);
        }
    }

    foreach (($pageState['texts'] ?? []) as $path => $value) {
        if (!is_string($path) || strpos($path, '/html') !== 0) {
            continue;
        }
        $node = $xpath->query($path)->item(0);
        if ($node && $node->nodeType === XML_TEXT_NODE) {
            $node->nodeValue = (string) $value;
        }
    }

    foreach (($pageState['attributes'] ?? []) as $path => $attributes) {
        if (!is_string($path) || strpos($path, '/html') !== 0 || !is_array($attributes)) {
            continue;
        }
        $node = $xpath->query($path)->item(0);
        if (!$node instanceof DOMElement) {
            continue;
        }
        foreach (['placeholder', 'title', 'aria-label'] as $name) {
            if (array_key_exists($name, $attributes)) {
                $node->setAttribute($name, (string) $attributes[$name]);
            }
        }
    }

    foreach (($pageState['images'] ?? []) as $path => $image) {
        if (!is_string($path) || strpos($path, '/html') !== 0 || !is_array($image)) {
            continue;
        }
        $node = $xpath->query($path)->item(0);
        if (!$node instanceof DOMElement || strtolower($node->tagName) !== 'img') {
            continue;
        }
        $src = (string) ($image['src'] ?? '');
        if ($src !== '' && cms_valid_asset_src($src)) {
            $node->setAttribute('src', $src);
            $node->removeAttribute('srcset');
            $node->removeAttribute('sizes');
            $absolute = CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, ltrim($src, '/'));
            if (is_file($absolute)) {
                $size = @getimagesize($absolute);
                if (is_array($size)) {
                    $node->setAttribute('width', (string) $size[0]);
                    $node->setAttribute('height', (string) $size[1]);
                }
            }
        }
        if (array_key_exists('alt', $image)) {
            $node->setAttribute('alt', (string) $image['alt']);
        }
    }
}

function cms_block_html(array $block): string
{
    if (empty($block['enabled'])) {
        return '';
    }
    $type = (string) ($block['type'] ?? 'text');
    $eyebrow = cms_h(trim((string) ($block['eyebrow'] ?? '')));
    $title = cms_h(trim((string) ($block['title'] ?? '')));
    $body = nl2br(cms_h(trim((string) ($block['body'] ?? ''))));
    $eyebrowHtml = $eyebrow !== '' ? '<p class="cms-block__eyebrow">' . $eyebrow . '</p>' : '';
    $titleHtml = $title !== '' ? '<h2>' . $title . '</h2>' : '';
    $bodyHtml = $body !== '' ? '<p class="cms-block__body">' . $body . '</p>' : '';

    if ($type === 'cta') {
        $label = cms_h(trim((string) ($block['button_label'] ?? 'Zvanīt')));
        $href = cms_h(cms_safe_href((string) ($block['button_href'] ?? 'tel:+37122002700')));
        return '<article class="cms-block cms-block--cta"><div>' . $eyebrowHtml . $titleHtml . $bodyHtml . '</div><a class="cms-block__button" href="' . $href . '">' . $label . '</a></article>';
    }
    if ($type === 'list') {
        $items = is_array($block['items'] ?? null) ? $block['items'] : preg_split('/\R/u', (string) ($block['items'] ?? ''));
        $list = '';
        foreach (array_slice($items ?: [], 0, 12) as $item) {
            $item = trim((string) $item);
            if ($item !== '') {
                $list .= '<li>' . cms_h($item) . '</li>';
            }
        }
        return '<article class="cms-block cms-block--list"><div>' . $eyebrowHtml . $titleHtml . $bodyHtml . '</div><ul>' . $list . '</ul></article>';
    }
    if ($type === 'split') {
        $src = (string) ($block['image'] ?? '');
        $image = '';
        if ($src !== '' && cms_valid_asset_src($src)) {
            $image = '<figure><img src="' . cms_h($src) . '" alt="' . cms_h((string) ($block['alt'] ?? '')) . '" loading="lazy" decoding="async"></figure>';
        }
        $reverse = !empty($block['reverse']) ? ' cms-block--reverse' : '';
        return '<article class="cms-block cms-block--split' . $reverse . '">' . $image . '<div>' . $eyebrowHtml . $titleHtml . $bodyHtml . '</div></article>';
    }
    return '<article class="cms-block cms-block--text">' . $eyebrowHtml . $titleHtml . $bodyHtml . '</article>';
}

function cms_append_fragment(DOMDocument $dom, DOMNode $target, string $html): void
{
    $temporary = new DOMDocument('1.0', 'UTF-8');
    $previous = libxml_use_internal_errors(true);
    $temporary->loadHTML('<?xml encoding="UTF-8"><!doctype html><html><body><div id="cms-fragment">' . $html . '</div></body></html>', LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    $container = (new DOMXPath($temporary))->query('//*[@id="cms-fragment"]')->item(0);
    if (!$container) {
        return;
    }
    foreach (iterator_to_array($container->childNodes) as $child) {
        $target->parentNode->insertBefore($dom->importNode($child, true), $target);
    }
}

function cms_inject_blocks(DOMDocument $dom, array $blocks): void
{
    $html = '';
    foreach (array_slice($blocks, 0, 20) as $block) {
        if (is_array($block)) {
            $html .= cms_block_html($block);
        }
    }
    if ($html === '') {
        return;
    }
    $xpath = new DOMXPath($dom);
    $footer = $xpath->query('//footer[contains(concat(" ", normalize-space(@class), " "), " site-footer ")]')->item(0);
    if (!$footer || !$footer->parentNode) {
        return;
    }
    $head = $xpath->query('//head')->item(0);
    if ($head) {
        $link = $dom->createElement('link');
        $link->setAttribute('rel', 'stylesheet');
        $link->setAttribute('href', '/admin/assets/cms-public.css?v=1');
        $head->appendChild($link);
    }
    $zone = '<section class="cms-block-zone" aria-label="Papildu saturs"><div class="cms-block-zone__inner">' . $html . '</div></section>';
    cms_append_fragment($dom, $footer, $zone);
}

function cms_sync_structured_data(DOMDocument $dom, array $global): void
{
    $xpath = new DOMXPath($dom);
    $titleNode = $xpath->query('//title')->item(0);
    $descriptionNode = $xpath->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="description"]')->item(0);
    $h1Node = $xpath->query('//h1')->item(0);
    $pageTitle = $titleNode ? trim((string) $titleNode->textContent) : '';
    $description = $descriptionNode instanceof DOMElement ? $descriptionNode->getAttribute('content') : '';
    $h1 = $h1Node ? trim(preg_replace('/\s+/u', ' ', (string) $h1Node->textContent)) : $pageTitle;
    $primaryTel = (string) ($global['primary_tel'] ?? CMS_PRIMARY_TEL);
    $email = (string) ($global['email'] ?? CMS_EMAIL);

    foreach ($xpath->query('//script[@type="application/ld+json"]') as $node) {
        $data = json_decode((string) $node->nodeValue, true);
        if (!is_array($data)) {
            continue;
        }
        $type = $data['@type'] ?? '';
        if ($type === 'LocalBusiness') {
            $data['telephone'] = $primaryTel;
            $data['email'] = $email;
        } elseif ($type === 'WebPage') {
            if ($pageTitle !== '') {
                $data['name'] = $pageTitle;
            }
            if ($description !== '') {
                $data['description'] = $description;
            }
        } elseif ($type === 'Service') {
            if ($h1 !== '') {
                $data['name'] = $h1;
            }
            if ($description !== '') {
                $data['description'] = $description;
            }
        }
        $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($encoded !== false) {
            $node->nodeValue = str_replace('<', '\\u003c', $encoded);
        }
    }
}

function cms_render_page(string $page, array $state): string
{
    $html = cms_read_baseline($page);
    $html = cms_replace_global_values($html, $state['global'] ?? []);
    $dom = cms_dom_load($html);
    $pageState = cms_page_state($state, $page);
    cms_apply_overrides($dom, $pageState);
    cms_sync_structured_data($dom, $state['global'] ?? []);
    cms_inject_blocks($dom, $pageState['blocks'] ?? []);
    cms_apply_service_visibility($dom, $page, cms_hidden_services($state['global'] ?? []));
    $rendered = $dom->saveHTML();
    $output = $rendered === false ? $html : cms_restore_utf8($rendered);
    $output = (string) preg_replace('/analytics\.js\?v=[A-Za-z0-9._-]+/', 'analytics.js?v=' . CMS_ANALYTICS_VERSION, $output);
    // Marker: a file with it was written by the CMS, so the baseline must never be re-synced from it.
    if (!str_contains($output, CMS_PUBLISHED_MARK)) {
        $output = (string) preg_replace('#\s*</html>\s*$#i', "
" . CMS_PUBLISHED_MARK . "
</html>
", $output, 1);
    }
    return $output;
}

function cms_nearest_label(DOMNode $node): string
{
    $parent = $node->parentNode;
    if (!$parent instanceof DOMElement) {
        return 'Teksts';
    }
    $tag = strtoupper($parent->tagName);
    $section = $parent;
    while ($section && $section instanceof DOMElement && !in_array(strtolower($section->tagName), ['section', 'header', 'footer', 'nav', 'main'], true)) {
        $section = $section->parentNode;
    }
    $area = '';
    if ($section instanceof DOMElement) {
        $area = $section->getAttribute('id') ?: preg_replace('/\s+.*/', '', $section->getAttribute('class'));
    }
    $context = trim(preg_replace('/\s+/u', ' ', $parent->textContent));
    if (cms_strlen($context) > 58) {
        $context = cms_substr($context, 0, 55) . '…';
    }
    return trim($tag . ($area ? ' · ' . $area : '') . ($context ? ' · ' . $context : ''));
}

function cms_scan_page(string $page, array $state): array
{
    $page = cms_normalize_page($page);
    $html = cms_render_page($page, $state);
    $dom = cms_dom_load($html);
    $xpath = new DOMXPath($dom);
    $titleNode = $xpath->query('//title')->item(0);
    $descriptionNode = $xpath->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="description"]')->item(0);
    $h1Node = $xpath->query('//h1')->item(0);
    $htmlNode = $xpath->query('//html')->item(0);

    $texts = [];
    foreach ($xpath->query('//body//text()[normalize-space(.) != "" and not(ancestor::script) and not(ancestor::style) and not(ancestor::svg) and not(ancestor::noscript)]') as $node) {
        $rawValue = (string) $node->nodeValue;
        $value = trim($rawValue);
        if ($value === '' || cms_strlen($value) > 2500) {
            continue;
        }
        $path = cms_node_xpath($node);
        $texts[] = [
            'id' => substr(sha1($path), 0, 12),
            'xpath' => $path,
            'label' => cms_nearest_label($node),
            'value' => $value,
            'multiline' => cms_strlen($value) > 90,
            'leading_space' => preg_match('/^\s/u', $rawValue) === 1,
            'trailing_space' => preg_match('/\s$/u', $rawValue) === 1,
        ];
    }

    $attributes = [];
    foreach ($xpath->query('//main//*[@placeholder or @title or @aria-label]') as $node) {
        if (!$node instanceof DOMElement) {
            continue;
        }
        $values = [];
        foreach (['placeholder', 'title', 'aria-label'] as $attribute) {
            if ($node->hasAttribute($attribute) && trim($node->getAttribute($attribute)) !== '') {
                $values[$attribute] = $node->getAttribute($attribute);
            }
        }
        if ($values) {
            $attributes[] = [
                'xpath' => cms_node_xpath($node),
                'label' => strtoupper($node->tagName) . ' · atribūti',
                'values' => $values,
            ];
        }
    }

    $images = [];
    $index = 1;
    foreach ($xpath->query('//body//img') as $node) {
        if (!$node instanceof DOMElement) {
            continue;
        }
        $images[] = [
            'xpath' => cms_node_xpath($node),
            'label' => 'Attēls ' . $index++,
            'src' => $node->getAttribute('src'),
            'preview' => cms_asset_preview_url($page, $node->getAttribute('src')),
            'alt' => $node->getAttribute('alt'),
        ];
    }

    $pageState = cms_page_state($state, $page);
    return [
        'path' => $page,
        'url' => cms_page_url($page),
        'lang' => $htmlNode instanceof DOMElement ? strtolower($htmlNode->getAttribute('lang')) : 'lv',
        'h1' => $h1Node ? trim(preg_replace('/\s+/u', ' ', $h1Node->textContent)) : '',
        'seo' => [
            'title' => $titleNode ? trim($titleNode->textContent) : '',
            'description' => $descriptionNode instanceof DOMElement ? $descriptionNode->getAttribute('content') : '',
        ],
        'texts' => $texts,
        'attributes' => $attributes,
        'images' => $images,
        'blocks' => array_values($pageState['blocks'] ?? []),
    ];
}

function cms_asset_preview_url(string $page, string $src): string
{
    if ($src === '') {
        return '';
    }
    if ($src[0] === '/') {
        return $src;
    }
    $directory = dirname('/' . $page);
    if ($directory === '/' || $directory === '\\') {
        $directory = '';
    }
    $parts = explode('/', trim($directory . '/' . $src, '/'));
    $normalized = [];
    foreach ($parts as $part) {
        if ($part === '..') {
            array_pop($normalized);
        } elseif ($part !== '.' && $part !== '') {
            $normalized[] = $part;
        }
    }
    return '/' . implode('/', $normalized);
}

function cms_sanitize_page_payload(array $payload): array
{
    $seo = is_array($payload['seo'] ?? null) ? $payload['seo'] : [];
    $result = [
        'seo' => [
            'title' => cms_substr(trim((string) ($seo['title'] ?? '')), 0, 180),
            'description' => cms_substr(trim((string) ($seo['description'] ?? '')), 0, 360),
        ],
        'texts' => [],
        'attributes' => [],
        'images' => [],
        'blocks' => [],
    ];
    foreach ((array) ($payload['texts'] ?? []) as $path => $value) {
        if (is_string($path) && strpos($path, '/html') === 0) {
            $result['texts'][$path] = cms_substr((string) $value, 0, 5000);
        }
    }
    foreach ((array) ($payload['attributes'] ?? []) as $path => $attributes) {
        if (!is_string($path) || strpos($path, '/html') !== 0 || !is_array($attributes)) {
            continue;
        }
        $clean = [];
        foreach (['placeholder', 'title', 'aria-label'] as $name) {
            if (isset($attributes[$name])) {
                $clean[$name] = cms_substr(trim((string) $attributes[$name]), 0, 300);
            }
        }
        if ($clean) {
            $result['attributes'][$path] = $clean;
        }
    }
    foreach ((array) ($payload['images'] ?? []) as $path => $image) {
        if (!is_string($path) || strpos($path, '/html') !== 0 || !is_array($image)) {
            continue;
        }
        $src = trim((string) ($image['src'] ?? ''));
        if ($src !== '' && cms_valid_asset_src($src)) {
            $result['images'][$path] = [
                'src' => $src,
                'alt' => cms_substr(trim((string) ($image['alt'] ?? '')), 0, 300),
            ];
        }
    }
    foreach (array_slice((array) ($payload['blocks'] ?? []), 0, 20) as $block) {
        if (!is_array($block)) {
            continue;
        }
        $type = in_array(($block['type'] ?? ''), ['text', 'split', 'list', 'cta'], true) ? $block['type'] : 'text';
        $result['blocks'][] = [
            'id' => preg_replace('/[^a-zA-Z0-9_-]/', '', (string) ($block['id'] ?? bin2hex(random_bytes(5)))),
            'type' => $type,
            'enabled' => !empty($block['enabled']),
            'eyebrow' => cms_substr(trim((string) ($block['eyebrow'] ?? '')), 0, 120),
            'title' => cms_substr(trim((string) ($block['title'] ?? '')), 0, 200),
            'body' => cms_substr(trim((string) ($block['body'] ?? '')), 0, 4000),
            'items' => array_values(array_slice(array_filter(array_map('trim', (array) ($block['items'] ?? []))), 0, 12)),
            'image' => cms_valid_asset_src((string) ($block['image'] ?? '')) ? (string) $block['image'] : '',
            'alt' => cms_substr(trim((string) ($block['alt'] ?? '')), 0, 300),
            'reverse' => !empty($block['reverse']),
            'button_label' => cms_substr(trim((string) ($block['button_label'] ?? '')), 0, 80),
            'button_href' => cms_safe_href((string) ($block['button_href'] ?? '#')),
        ];
    }
    return $result;
}

function cms_save_page_draft(string $page, array $payload): array
{
    $page = cms_normalize_page($page);
    $state = cms_get_state('draft');
    $state['pages'][$page] = cms_sanitize_page_payload($payload);
    cms_save_state('draft', $state);
    return $state;
}

function cms_format_phone(string $value): array
{
    $digits = preg_replace('/\D+/', '', $value);
    if (strlen($digits) < 8 || strlen($digits) > 15) {
        throw new InvalidArgumentException('Tālruņa numurā jābūt no 8 līdz 15 cipariem.');
    }
    $tel = '+' . $digits;
    if (strlen($digits) === 11 && strpos($digits, '371') === 0) {
        $display = '+371 ' . substr($digits, 3, 8);
    } else {
        $display = $tel;
    }
    return [$display, $tel];
}

function cms_save_global_draft(array $payload): array
{
    [$primary, $primaryTel] = cms_format_phone((string) ($payload['primary_phone'] ?? ''));
    [$secondary, $secondaryTel] = cms_format_phone((string) ($payload['secondary_phone'] ?? ''));
    $email = trim((string) ($payload['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('E-pasta adrese nav derīga.');
    }
    $state = cms_get_state('draft');
    $state['global'] = array_merge((array) ($state['global'] ?? []), [
        'primary_phone' => $primary,
        'primary_tel' => $primaryTel,
        'secondary_phone' => $secondary,
        'secondary_tel' => $secondaryTel,
        'email' => $email,
    ]);
    cms_save_state('draft', $state);
    return $state;
}

function cms_atomic_write(string $path, string $content): void
{
    $temporary = $path . '.cms-' . bin2hex(random_bytes(4));
    if (@file_put_contents($temporary, $content, LOCK_EX) === false) {
        throw new RuntimeException('Neizdevās ierakstīt ' . basename($path) . '.');
    }
    @chmod($temporary, 0644);
    if (!@rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('Neizdevās publicēt ' . basename($path) . '.');
    }
}

function cms_ensure_aux_baseline(string $file): string
{
    $source = CMS_ROOT . DIRECTORY_SEPARATOR . $file;
    $baseline = CMS_STORAGE . DIRECTORY_SEPARATOR . 'baseline' . DIRECTORY_SEPARATOR . $file;
    if (!is_file($baseline)) {
        if (!is_file($source)) {
            return '';
        }
        if (!is_dir(dirname($baseline))) {
            @mkdir(dirname($baseline), 0750, true);
        }
        @copy($source, $baseline);
        @chmod($baseline, 0640);
    }
    return (string) @file_get_contents($baseline);
}

function cms_publish(): array
{
    $lockPath = CMS_STORAGE . DIRECTORY_SEPARATOR . 'publish.lock';
    $lock = fopen($lockPath, 'c+');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
        throw new RuntimeException('Publicēšana jau notiek. Mēģiniet vēlreiz pēc brīža.');
    }
    try {
        $draft = cms_get_state('draft');
        $live = cms_get_state('live');
        $pages = cms_list_pages();
        $rendered = [];
        foreach ($pages as $entry) {
            $rendered[$entry['path']] = cms_render_page($entry['path'], $draft);
        }

        $revisionId = date('Ymd-His') . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
        $revision = $live;
        $revision['meta']['revision_id'] = $revisionId;
        $revision['meta']['saved_at'] = date(DATE_ATOM);
        $revisionDirectory = CMS_STORAGE . DIRECTORY_SEPARATOR . 'revisions';
        if (!is_dir($revisionDirectory)) {
            @mkdir($revisionDirectory, 0750, true);
        }
        cms_write_json($revisionDirectory . DIRECTORY_SEPARATOR . $revisionId . '.json', $revision);

        foreach ($rendered as $page => $html) {
            cms_atomic_write(CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $page), $html);
        }

        $appBaseline = cms_ensure_aux_baseline('app.js');
        if ($appBaseline !== '') {
            $global = $draft['global'] ?? [];
            $primaryTel = preg_replace('/\D+/', '', (string) ($global['primary_tel'] ?? CMS_PRIMARY_TEL));
            $app = str_replace(['37122002700', '+371 22002700'], [$primaryTel, (string) ($global['primary_phone'] ?? CMS_PRIMARY_PHONE)], $appBaseline);
            cms_atomic_write(CMS_ROOT . DIRECTORY_SEPARATOR . 'app.js', $app);
        }

        $sitemapBaseline = cms_ensure_aux_baseline('sitemap.xml');
        if ($sitemapBaseline !== '') {
            $sitemap = $sitemapBaseline;
            foreach (cms_hidden_pages($draft['global'] ?? []) as $hiddenPage) {
                $url = preg_quote(cms_page_url($hiddenPage), '#');
                $sitemap = (string) preg_replace('#\s*<url>\s*<loc>[^<]*' . $url . '</loc>.*?</url>#s', '', $sitemap);
            }
            cms_atomic_write(CMS_ROOT . DIRECTORY_SEPARATOR . 'sitemap.xml', $sitemap);
        }

        $draft['meta']['published_at'] = date(DATE_ATOM);
        $draft['meta']['last_revision'] = $revisionId;
        cms_save_state('live', $draft);
        cms_save_state('draft', $draft);
        cms_trim_revisions(25);
        return ['published_at' => $draft['meta']['published_at'], 'pages' => count($rendered), 'revision' => $revisionId];
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function cms_trim_revisions(int $keep): void
{
    $directory = CMS_STORAGE . DIRECTORY_SEPARATOR . 'revisions';
    if (!is_dir($directory)) {
        return;
    }
    $files = glob($directory . DIRECTORY_SEPARATOR . '*.json') ?: [];
    rsort($files, SORT_STRING);
    foreach (array_slice($files, $keep) as $file) {
        @unlink($file);
    }
}

function cms_list_revisions(): array
{
    $directory = CMS_STORAGE . DIRECTORY_SEPARATOR . 'revisions';
    if (!is_dir($directory)) {
        return [];
    }
    $files = glob($directory . DIRECTORY_SEPARATOR . '*.json') ?: [];
    rsort($files, SORT_STRING);
    $revisions = [];
    foreach (array_slice($files, 0, 25) as $file) {
        $state = cms_read_json($file);
        $revisions[] = [
            'id' => basename($file, '.json'),
            'saved_at' => $state['meta']['saved_at'] ?? null,
            'published_at' => $state['meta']['published_at'] ?? null,
            'pages' => count($state['pages'] ?? []),
        ];
    }
    return $revisions;
}

function cms_restore_revision(string $id): void
{
    if (!preg_match('/^[A-Za-z0-9-]+$/', $id)) {
        throw new InvalidArgumentException('Nederīga versija.');
    }
    $path = CMS_STORAGE . DIRECTORY_SEPARATOR . 'revisions' . DIRECTORY_SEPARATOR . $id . '.json';
    if (!is_file($path)) {
        throw new InvalidArgumentException('Versija nav atrasta.');
    }
    $state = cms_read_json($path);
    if (!$state) {
        throw new RuntimeException('Versiju neizdevās nolasīt.');
    }
    cms_save_state('draft', $state);
}

function cms_discard_draft(): void
{
    cms_save_state('draft', cms_get_state('live'));
}

function cms_media_list(): array
{
    $roots = [
        ['path' => CMS_UPLOADS, 'url' => '/assets/uploads/', 'source' => 'uploads'],
        ['path' => CMS_ROOT . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'images', 'url' => '/assets/images/', 'source' => 'site'],
    ];
    $media = [];
    foreach ($roots as $root) {
        if (!is_dir($root['path'])) {
            continue;
        }
        foreach (new DirectoryIterator($root['path']) as $file) {
            if (!$file->isFile() || !preg_match('/\.(?:jpe?g|png|webp|avif)$/i', $file->getFilename())) {
                continue;
            }
            $size = @getimagesize($file->getPathname());
            $media[] = [
                'name' => $file->getFilename(),
                'url' => $root['url'] . rawurlencode($file->getFilename()),
                'src' => $root['url'] . $file->getFilename(),
                'source' => $root['source'],
                'bytes' => $file->getSize(),
                'width' => is_array($size) ? $size[0] : null,
                'height' => is_array($size) ? $size[1] : null,
                'modified' => date(DATE_ATOM, $file->getMTime()),
            ];
        }
    }
    usort($media, static function (array $a, array $b): int {
        if ($a['source'] !== $b['source']) {
            return $a['source'] === 'uploads' ? -1 : 1;
        }
        return strcmp($b['modified'], $a['modified']);
    });
    return array_slice($media, 0, 500);
}

function cms_upload_image(array $file): array
{
    if (!isset($file['error']) || (int) $file['error'] !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException('Attēlu neizdevās augšupielādēt.');
    }
    if ((int) $file['size'] > 12 * 1024 * 1024) {
        throw new InvalidArgumentException('Attēls ir lielāks par 12 MB.');
    }
    $temporary = (string) $file['tmp_name'];
    $info = @getimagesize($temporary);
    if (!is_array($info) || !in_array((int) $info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
        throw new InvalidArgumentException('Atļauti tikai JPG, PNG un WebP attēli.');
    }
    if ((int) $info[0] < 240 || (int) $info[1] < 180) {
        throw new InvalidArgumentException('Attēls ir pārāk mazs.');
    }

    $base = pathinfo((string) ($file['name'] ?? 'attels'), PATHINFO_FILENAME);
    $base = preg_replace('/[^A-Za-z0-9_-]+/', '-', $base);
    $base = trim(strtolower((string) $base), '-');
    if ($base === '') {
        $base = 'attels';
    }
    $base = substr($base, 0, 60) . '-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
    $saved = false;
    $filename = '';

    if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $raw = @file_get_contents($temporary);
        $image = $raw !== false ? @imagecreatefromstring($raw) : false;
        if ($image !== false) {
            $width = imagesx($image);
            $height = imagesy($image);
            if (max($width, $height) > 2000) {
                $scale = 2000 / max($width, $height);
                $resized = imagescale($image, max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale)), IMG_BICUBIC);
                if ($resized !== false) {
                    imagedestroy($image);
                    $image = $resized;
                }
            }
            $filename = $base . '.webp';
            $saved = imagewebp($image, CMS_UPLOADS . DIRECTORY_SEPARATOR . $filename, 84);
            imagedestroy($image);
        }
    }

    if (!$saved) {
        $extension = [(int) IMAGETYPE_JPEG => 'jpg', (int) IMAGETYPE_PNG => 'png', (int) IMAGETYPE_WEBP => 'webp'][(int) $info[2]];
        $filename = $base . '.' . $extension;
        $saved = @move_uploaded_file($temporary, CMS_UPLOADS . DIRECTORY_SEPARATOR . $filename);
    }
    if (!$saved) {
        throw new RuntimeException('Serveris nevarēja saglabāt attēlu.');
    }
    @chmod(CMS_UPLOADS . DIRECTORY_SEPARATOR . $filename, 0644);
    $size = @getimagesize(CMS_UPLOADS . DIRECTORY_SEPARATOR . $filename);
    return [
        'name' => $filename,
        'url' => '/assets/uploads/' . rawurlencode($filename),
        'src' => '/assets/uploads/' . $filename,
        'source' => 'uploads',
        'bytes' => filesize(CMS_UPLOADS . DIRECTORY_SEPARATOR . $filename),
        'width' => is_array($size) ? $size[0] : null,
        'height' => is_array($size) ? $size[1] : null,
    ];
}

function cms_delete_upload(string $name): void
{
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $name)) {
        throw new InvalidArgumentException('Nederīgs faila nosaukums.');
    }
    $path = CMS_UPLOADS . DIRECTORY_SEPARATOR . $name;
    if (!is_file($path)) {
        throw new InvalidArgumentException('Fails nav atrasts.');
    }
    if (!@unlink($path)) {
        throw new RuntimeException('Failu neizdevās dzēst.');
    }
}

function cms_change_password(string $current, string $next): void
{
    $config = cms_auth_config();
    $username = (string) ($_SESSION['cms_user'] ?? '');
    $users = cms_auth_users($config);
    $userConfig = isset($users[$username]) && is_array($users[$username]) ? $users[$username] : [];
    if ($username === '' || !cms_verify_password($current, $userConfig)) {
        throw new InvalidArgumentException('Pašreizējā parole nav pareiza.');
    }
    if (strlen($next) < 12) {
        throw new InvalidArgumentException('Jaunajai parolei jābūt vismaz 12 rakstzīmēm.');
    }
    $salt = bin2hex(random_bytes(24));
    $iterations = 210000;
    $users[$username] = array_merge($userConfig, [
        'salt' => $salt,
        'iterations' => $iterations,
        'hash' => hash_pbkdf2('sha256', $next, $salt, $iterations, 64, false),
        'updated_at' => date(DATE_ATOM),
    ]);
    cms_write_json(CMS_STORAGE . DIRECTORY_SEPARATOR . 'auth.json', [
        'users' => $users,
        'updated_at' => date(DATE_ATOM),
    ]);
}

function cms_health(): array
{
    $diskTotal = @disk_total_space(CMS_ROOT);
    $diskFree = @disk_free_space(CMS_ROOT);
    $loads = function_exists('sys_getloadavg') ? @sys_getloadavg() : false;
    return [
        'php' => PHP_VERSION,
        'dom' => class_exists('DOMDocument'),
        'gd' => extension_loaded('gd'),
        'storage_writable' => is_writable(CMS_STORAGE),
        'uploads_writable' => is_writable(CMS_UPLOADS),
        'root_writable' => is_writable(CMS_ROOT),
        'disk_total' => is_numeric($diskTotal) ? (int) $diskTotal : null,
        'disk_free' => is_numeric($diskFree) ? (int) $diskFree : null,
        'disk_used_percent' => is_numeric($diskTotal) && $diskTotal > 0 && is_numeric($diskFree)
            ? round((1 - ($diskFree / $diskTotal)) * 100, 1)
            : null,
        'load_1m' => is_array($loads) && isset($loads[0]) ? round((float) $loads[0], 2) : null,
        'memory_limit' => (string) ini_get('memory_limit'),
        'response_ms' => defined('CMS_REQUEST_STARTED') ? (int) round((microtime(true) - CMS_REQUEST_STARTED) * 1000) : null,
    ];
}

function cms_current_user(): string
{
    $user = trim((string) ($_SESSION['cms_user'] ?? 'sistēma'));
    return $user !== '' ? cms_substr($user, 0, 80) : 'sistēma';
}

function cms_activity_log(string $action, array $details = []): void
{
    $allowed = [];
    foreach (['page', 'file', 'revision', 'pages', 'result'] as $key) {
        if (isset($details[$key]) && (is_string($details[$key]) || is_numeric($details[$key]))) {
            $allowed[$key] = cms_substr((string) $details[$key], 0, 180);
        }
    }
    $entry = [
        'at' => date(DATE_ATOM),
        'user' => cms_current_user(),
        'action' => preg_replace('/[^a-z0-9_-]/i', '', $action),
        'details' => $allowed,
    ];
    $payload = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payload !== false) {
        @file_put_contents(CMS_STORAGE . DIRECTORY_SEPARATOR . 'activity.jsonl', $payload . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
}

function cms_activity_list(int $limit = 30): array
{
    $path = CMS_STORAGE . DIRECTORY_SEPARATOR . 'activity.jsonl';
    if (!is_file($path)) {
        return [];
    }
    $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    $result = [];
    foreach (array_reverse(array_slice($lines, -max(1, min($limit, 100)))) as $line) {
        $entry = json_decode($line, true);
        if (is_array($entry)) {
            $result[] = $entry;
        }
    }
    return $result;
}

function cms_backup_directory(): string
{
    return CMS_STORAGE . DIRECTORY_SEPARATOR . 'backups';
}

function cms_ensure_daily_backup(): array
{
    $directory = cms_backup_directory();
    if (!is_dir($directory)) {
        @mkdir($directory, 0750, true);
    }
    $id = date('Y-m-d');
    $path = $directory . DIRECTORY_SEPARATOR . $id . '.json';
    if (!is_file($path)) {
        $state = cms_get_state('live');
        $state['backup'] = [
            'id' => $id,
            'created_at' => date(DATE_ATOM),
            'type' => 'daily-live-state',
        ];
        cms_write_json($path, $state);
    }
    $files = glob($directory . DIRECTORY_SEPARATOR . '*.json') ?: [];
    rsort($files, SORT_STRING);
    foreach (array_slice($files, 30) as $old) {
        @unlink($old);
    }
    return cms_backup_status();
}

function cms_backup_status(): array
{
    $files = glob(cms_backup_directory() . DIRECTORY_SEPARATOR . '*.json') ?: [];
    rsort($files, SORT_STRING);
    return [
        'count' => count($files),
        'latest' => $files ? basename($files[0], '.json') : null,
        'retention_days' => 30,
    ];
}

function cms_analytics_empty_totals(): array
{
    return [
        'page_view' => 0,
        'phone_primary' => 0,
        'phone_secondary' => 0,
        'whatsapp_open' => 0,
        'location_open' => 0,
        'request_prepared' => 0,
        'sms_open' => 0,
    ];
}

function cms_analytics_add(array &$target, array $source): void
{
    foreach (cms_analytics_empty_totals() as $key => $unused) {
        $target[$key] = (int) ($target[$key] ?? 0) + (int) ($source[$key] ?? 0);
    }
}

function cms_analytics_summary(int $days = 30): array
{
    $days = max(1, min($days, 90));
    $directory = CMS_STORAGE . DIRECTORY_SEPARATOR . 'analytics';
    $totals = cms_analytics_empty_totals();
    $daily = [];
    $visitors = [];
    $pages = [];
    $languages = [];
    $devices = [];
    $sources = [];
    $lastUpdated = null;
    $heatmap = array_fill(0, 7, array_fill(0, 24, ['page_view' => 0, 'help_actions' => 0]));
    $heatmapDays = 0;

    for ($offset = $days - 1; $offset >= 0; $offset--) {
        $date = date('Y-m-d', strtotime('-' . $offset . ' days'));
        $data = cms_read_json($directory . DIRECTORY_SEPARATOR . $date . '.json');
        $dayTotals = cms_analytics_empty_totals();
        cms_analytics_add($dayTotals, (array) ($data['totals'] ?? []));
        cms_analytics_add($totals, $dayTotals);
        foreach ((array) ($data['visitors'] ?? []) as $visitor => $value) {
            if ($value && count($visitors) < 20000) {
                $visitors[(string) $visitor] = true;
            }
        }
        foreach ((array) ($data['pages'] ?? []) as $path => $row) {
            if (!isset($pages[$path])) {
                $pages[$path] = cms_analytics_empty_totals();
            }
            cms_analytics_add($pages[$path], (array) $row);
        }
        foreach ((array) ($data['languages'] ?? []) as $label => $count) {
            $languages[(string) $label] = (int) ($languages[(string) $label] ?? 0) + (int) $count;
        }
        foreach ((array) ($data['devices'] ?? []) as $label => $count) {
            $devices[(string) $label] = (int) ($devices[(string) $label] ?? 0) + (int) $count;
        }
        foreach ((array) ($data['sources'] ?? []) as $label => $count) {
            $sources[(string) $label] = (int) ($sources[(string) $label] ?? 0) + (int) $count;
        }
        if (!empty($data['hours']) && is_array($data['hours'])) {
            $weekday = ((int) date('N', strtotime($date))) - 1; // 0 = Monday
            $heatmapDays++;
            foreach ($data['hours'] as $hour => $row) {
                $hour = (int) $hour;
                if ($hour < 0 || $hour > 23 || !is_array($row)) {
                    continue;
                }
                $heatmap[$weekday][$hour]['page_view'] += (int) ($row['page_view'] ?? 0);
                $heatmap[$weekday][$hour]['help_actions'] += (int) ($row['help_actions'] ?? 0);
            }
        }
        if (!empty($data['updated_at']) && ($lastUpdated === null || strcmp((string) $data['updated_at'], $lastUpdated) > 0)) {
            $lastUpdated = (string) $data['updated_at'];
        }
        $daily[] = [
            'date' => $date,
            'visitors' => count((array) ($data['visitors'] ?? [])),
            'page_views' => $dayTotals['page_view'],
            'phone_clicks' => $dayTotals['phone_primary'] + $dayTotals['phone_secondary'],
            'help_actions' => $dayTotals['phone_primary'] + $dayTotals['phone_secondary'] + $dayTotals['whatsapp_open'] + $dayTotals['location_open'] + $dayTotals['request_prepared'],
        ];
    }

    uasort($pages, static function (array $a, array $b): int {
        return ((int) ($b['page_view'] ?? 0)) <=> ((int) ($a['page_view'] ?? 0));
    });
    arsort($languages);
    arsort($devices);
    arsort($sources);

    $active = cms_read_json($directory . DIRECTORY_SEPARATOR . 'active.json');
    $online = 0;
    $now = time();
    foreach ($active as $session) {
        if (is_array($session) && ($now - (int) ($session['last_seen'] ?? 0)) <= 300) {
            $online++;
        }
    }
    $phoneClicks = $totals['phone_primary'] + $totals['phone_secondary'];
    $helpActions = $phoneClicks + $totals['whatsapp_open'] + $totals['location_open'] + $totals['request_prepared'];
    $unique = count($visitors);
    return [
        'window_days' => $days,
        'online_now' => $online,
        'unique_visitors' => $unique,
        'page_views' => $totals['page_view'],
        'phone_clicks' => $phoneClicks,
        'help_actions' => $helpActions,
        'conversion_percent' => $unique > 0 ? round(($helpActions / $unique) * 100, 1) : 0,
        'totals' => $totals,
        'daily' => $daily,
        'top_pages' => array_slice($pages, 0, 8, true),
        'languages' => $languages,
        'devices' => $devices,
        'sources' => $sources,
        'updated_at' => $lastUpdated,
        'heatmap' => ['days' => $heatmapDays, 'cells' => $heatmap, 'timezone' => date_default_timezone_get()],
        'notice' => 'Tiek skaitīti pogu nospiedieni, nevis savienoti vai atbildēti zvani.',
    ];
}

function cms_audit_issue(array &$issues, string $severity, string $page, string $title, string $detail): void
{
    $issues[] = [
        'severity' => $severity,
        'page' => $page,
        'title' => $title,
        'detail' => $detail,
    ];
}

function cms_audit_local_target(string $page, string $href): ?string
{
    $href = html_entity_decode(trim($href), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if ($href === '' || $href[0] === '#' || preg_match('#^(?:https?:|//|tel:|mailto:|sms:|javascript:|data:|blob:)#i', $href)) {
        return null;
    }
    $href = preg_replace('/[?#].*$/', '', $href);
    $path = isset($href[0]) && $href[0] === '/' ? ltrim($href, '/') : trim(dirname($page), './\\') . '/' . $href;
    $parts = [];
    foreach (explode('/', str_replace('\\', '/', rawurldecode($path))) as $part) {
        if ($part === '' || $part === '.') {
            continue;
        }
        if ($part === '..') {
            array_pop($parts);
        } else {
            $parts[] = $part;
        }
    }
    $path = implode('/', $parts);
    if ($path === '') {
        return 'index.html';
    }
    if (substr($href, -1) === '/') {
        $path .= '/index.html';
    } elseif (pathinfo($path, PATHINFO_EXTENSION) === '' && is_file(CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path) . DIRECTORY_SEPARATOR . 'index.html')) {
        $path .= '/index.html';
    }
    return $path;
}

function cms_site_audit(bool $force = false): array
{
    $cache = CMS_STORAGE . DIRECTORY_SEPARATOR . 'site-audit.json';
    if (!$force && is_file($cache) && (time() - (int) @filemtime($cache)) < 600) {
        $cached = cms_read_json($cache);
        if ($cached) {
            return $cached;
        }
    }

    $issues = [];
    $checked = 0;
    foreach (cms_list_pages() as $entry) {
        $page = (string) $entry['path'];
        $path = CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $page);
        $html = @file_get_contents($path);
        if ($html === false) {
            cms_audit_issue($issues, 'error', $page, 'Lapu nevar nolasīt', 'Pārbaudiet faila piekļuves tiesības.');
            continue;
        }
        $checked++;
        $dom = cms_dom_load($html);
        $xpath = new DOMXPath($dom);
        $titleNode = $xpath->query('//title')->item(0);
        $title = $titleNode ? trim(preg_replace('/\s+/u', ' ', $titleNode->textContent)) : '';
        $titleLength = cms_strlen($title);
        if ($title === '') {
            cms_audit_issue($issues, 'error', $page, 'Nav SEO virsraksta', 'Pievienojiet unikālu <title>.');
        } elseif ($titleLength < 25 || $titleLength > 65) {
            cms_audit_issue($issues, 'warning', $page, 'SEO virsraksta garums', 'Pašlaik ' . $titleLength . ' zīmes; orientieris ir 25–65.');
        }

        $descriptionNode = $xpath->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="description"]')->item(0);
        $description = $descriptionNode instanceof DOMElement ? trim($descriptionNode->getAttribute('content')) : '';
        $descriptionLength = cms_strlen($description);
        if ($description === '') {
            cms_audit_issue($issues, 'error', $page, 'Nav meta apraksta', 'Pievienojiet lapai unikālu aprakstu.');
        } elseif ($descriptionLength < 70 || $descriptionLength > 175) {
            cms_audit_issue($issues, 'warning', $page, 'Meta apraksta garums', 'Pašlaik ' . $descriptionLength . ' zīmes; orientieris ir 70–175.');
        }

        $h1Count = $xpath->query('//h1')->length;
        if ($h1Count !== 1) {
            cms_audit_issue($issues, 'error', $page, 'H1 struktūra', 'Atrasti H1: ' . $h1Count . '; lapā jābūt vienam galvenajam virsrakstam.');
        }
        if ($page !== '404.html' && $xpath->query('//link[translate(@rel,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="canonical"]')->length < 1) {
            cms_audit_issue($issues, 'error', $page, 'Nav canonical saites', 'Norādiet lapas galveno URL versiju.');
        }
        $hreflangCount = $xpath->query('//link[@hreflang]')->length;
        if ($hreflangCount > 0 && $hreflangCount < 3) {
            cms_audit_issue($issues, 'warning', $page, 'Nepilns hreflang komplekts', 'Atrastas tikai ' . $hreflangCount . ' valodu saites.');
        }
        $htmlNode = $xpath->query('//html')->item(0);
        if (!$htmlNode instanceof DOMElement || trim($htmlNode->getAttribute('lang')) === '') {
            cms_audit_issue($issues, 'error', $page, 'Nav lapas valodas', 'HTML elementam jānorāda lang.');
        }

        foreach ($xpath->query('//img') as $image) {
            if (!$image instanceof DOMElement) {
                continue;
            }
            $src = trim($image->getAttribute('src'));
            if (!$image->hasAttribute('alt') || trim($image->getAttribute('alt')) === '') {
                cms_audit_issue($issues, 'warning', $page, 'Attēlam nav ALT', $src !== '' ? $src : 'Attēls bez avota.');
            }
            $target = cms_audit_local_target($page, $src);
            if ($target !== null && !is_file(CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $target))) {
                cms_audit_issue($issues, 'error', $page, 'Attēla fails nav atrasts', $src);
            }
        }

        foreach ($xpath->query('//a[@href]') as $link) {
            if (!$link instanceof DOMElement) {
                continue;
            }
            $href = trim($link->getAttribute('href'));
            $target = cms_audit_local_target($page, $href);
            if ($target !== null && strpos($target, 'admin/') !== 0 && !is_file(CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $target))) {
                cms_audit_issue($issues, 'error', $page, 'Iekšējā saite nedarbojas', $href);
            }
        }

        foreach ($xpath->query('//script[@type="application/ld+json"]') as $script) {
            json_decode($script->textContent, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                cms_audit_issue($issues, 'error', $page, 'Nederīgi strukturētie dati', json_last_error_msg());
            }
        }
    }

    foreach (cms_media_list() as $media) {
        if ((int) ($media['bytes'] ?? 0) > 900 * 1024) {
            cms_audit_issue($issues, 'warning', 'assets', 'Smags attēls', (string) $media['name'] . ' · ' . round(((int) $media['bytes']) / 1024 / 1024, 1) . ' MB');
        }
    }

    $counts = ['error' => 0, 'warning' => 0, 'info' => 0];
    foreach ($issues as $issue) {
        $severity = (string) ($issue['severity'] ?? 'info');
        $counts[$severity] = (int) ($counts[$severity] ?? 0) + 1;
    }
    $score = max(0, (int) round(100 - min(70, $counts['error'] * 4) - min(25, $counts['warning'] * 1.25)));
    $result = [
        'checked_at' => date(DATE_ATOM),
        'pages_checked' => $checked,
        'score' => $score,
        'counts' => $counts,
        'issues' => array_slice($issues, 0, 250),
        'note' => 'Vērtējums ir tehnisks orientieris. Tas negarantē pozīciju Google rezultātos.',
    ];
    cms_write_json($cache, $result);
    return $result;
}

/* ---------- Pieteikumi (leads stored by request.php) ---------- */
function cms_leads_dir(): string
{
    return CMS_STORAGE . DIRECTORY_SEPARATOR . 'leads';
}

function cms_lead_path(string $id): string
{
    if (!preg_match('/^\d{8}-\d{6}-[a-f0-9]{6}$/', $id)) {
        throw new InvalidArgumentException('Nederīgs pieteikuma ID.');
    }
    return cms_leads_dir() . DIRECTORY_SEPARATOR . $id . '.json';
}

function cms_leads_list(int $limit = 300): array
{
    $files = glob(cms_leads_dir() . DIRECTORY_SEPARATOR . '*.json') ?: [];
    rsort($files, SORT_STRING);
    $leads = [];
    foreach (array_slice($files, 0, max(1, min($limit, 1000))) as $file) {
        $lead = cms_read_json($file);
        if ($lead && isset($lead['id'])) {
            $leads[] = $lead;
        }
    }
    return $leads;
}

function cms_leads_count_new(): int
{
    $count = 0;
    foreach (cms_leads_list(1000) as $lead) {
        if (($lead['status'] ?? 'new') === 'new') {
            $count++;
        }
    }
    return $count;
}

function cms_lead_set_status(string $id, string $status): array
{
    if (!in_array($status, ['new', 'done'], true)) {
        throw new InvalidArgumentException('Nederīgs statuss.');
    }
    $path = cms_lead_path($id);
    $lead = cms_read_json($path);
    if (!$lead) {
        throw new InvalidArgumentException('Pieteikums nav atrasts.');
    }
    $lead['status'] = $status;
    $lead['handled_at'] = $status === 'done' ? date(DATE_ATOM) : null;
    $lead['handled_by'] = $status === 'done' ? cms_current_user() : null;
    cms_write_json($path, $lead);
    return $lead;
}

function cms_lead_delete(string $id): void
{
    $path = cms_lead_path($id);
    if (is_file($path) && !@unlink($path)) {
        throw new RuntimeException('Neizdevās dzēst pieteikumu.');
    }
}

function cms_notify_get(): array
{
    $defaults = ['email' => '', 'email_enabled' => true, 'telegram_token' => '', 'telegram_chat' => ''];
    $stored = cms_read_json(CMS_STORAGE . DIRECTORY_SEPARATOR . 'notify.json');
    $merged = array_merge($defaults, array_intersect_key($stored, $defaults));
    $merged['telegram_token_set'] = $merged['telegram_token'] !== '';
    $merged['telegram_token'] = '';   // the token never leaves the server
    return $merged;
}

function cms_notify_save(array $payload): array
{
    $current = cms_read_json(CMS_STORAGE . DIRECTORY_SEPARATOR . 'notify.json');
    $email = trim((string) ($payload['email'] ?? ''));
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Nederīga e-pasta adrese.');
    }
    $token = trim((string) ($payload['telegram_token'] ?? ''));
    if ($token !== '' && !preg_match('/^\d+:[A-Za-z0-9_-]{20,}$/', $token)) {
        throw new InvalidArgumentException('Telegram bota tokens izskatās nepareizi (formāts 123456:ABC…).');
    }
    $chat = trim((string) ($payload['telegram_chat'] ?? ''));
    if ($chat !== '' && !preg_match('/^-?\d{1,20}$/', $chat)) {
        throw new InvalidArgumentException('Telegram chat ID sastāv tikai no cipariem.');
    }
    $next = [
        'email' => $email,
        'email_enabled' => !empty($payload['email_enabled']),
        'telegram_token' => $token !== '' ? $token : (string) ($current['telegram_token'] ?? ''),
        'telegram_chat' => $chat,
        'updated_at' => date(DATE_ATOM),
    ];
    if (!empty($payload['telegram_clear'])) {
        $next['telegram_token'] = '';
        $next['telegram_chat'] = '';
    }
    cms_write_json(CMS_STORAGE . DIRECTORY_SEPARATOR . 'notify.json', $next);
    return cms_notify_get();
}

/* ---------- Papildu pakalpojumi: show / hide ---------- */
function cms_hidden_services(array $global): array
{
    $hidden = [];
    foreach ((array) ($global['hidden_services'] ?? []) as $key) {
        if (isset(CMS_EXTRA_SERVICES[(string) $key])) {
            $hidden[] = (string) $key;
        }
    }
    return array_values(array_unique($hidden));
}

function cms_hidden_pages(array $global): array
{
    $pages = [];
    foreach (cms_hidden_services($global) as $key) {
        foreach (CMS_EXTRA_SERVICES[$key]['pages'] as $page) {
            $pages[] = $page;
        }
    }
    return $pages;
}

function cms_services_get(array $global): array
{
    $hidden = cms_hidden_services($global);
    $result = [];
    foreach (CMS_EXTRA_SERVICES as $key => $service) {
        $result[] = [
            'key' => $key,
            'label' => $service['label'],
            'visible' => !in_array($key, $hidden, true),
            'url' => cms_page_url($service['pages']['lv']),
            'pages' => array_values($service['pages']),
        ];
    }
    return $result;
}

function cms_save_services_draft(array $payload): array
{
    $hidden = [];
    foreach ((array) ($payload['hidden'] ?? []) as $key) {
        if (!isset(CMS_EXTRA_SERVICES[(string) $key])) {
            throw new InvalidArgumentException('Nezināms pakalpojums.');
        }
        $hidden[] = (string) $key;
    }
    $state = cms_get_state('draft');
    $state['global'] = array_merge((array) ($state['global'] ?? []), ['hidden_services' => array_values(array_unique($hidden))]);
    cms_save_state('draft', $state);
    return $state;
}

function cms_apply_service_visibility(DOMDocument $dom, string $page, array $hidden): void
{
    if (!$hidden) {
        return;
    }
    $xpath = new DOMXPath($dom);
    $lang = array_search($page, CMS_EXTRA_HUBS, true);
    if ($lang !== false) {
        // Hub page: drop the cards of hidden services, renumber the rest and fix the counter.
        $directories = [];
        foreach ($hidden as $key) {
            $directories[] = basename(dirname(CMS_EXTRA_SERVICES[$key]['pages'][$lang]));
        }
        foreach ($xpath->query('//a[contains(concat(" ", normalize-space(@class), " "), " directory-item ")]') as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }
            $href = rtrim($node->getAttribute('href'), '/');
            if (in_array(basename($href), $directories, true)) {
                $node->parentNode->removeChild($node);
            }
        }
        $count = 0;
        foreach ($xpath->query('//span[contains(concat(" ", normalize-space(@class), " "), " directory-item__number ")]') as $node) {
            $node->nodeValue = str_pad((string) (++$count), 2, '0', STR_PAD_LEFT);
        }
        $words = ['lv' => ['virziens', 'virzieni'], 'ru' => ['направление', 'направления'], 'en' => ['direction', 'directions']];
        $counter = $xpath->query('//p[contains(concat(" ", normalize-space(@class), " "), " hero-note ")]/strong')->item(0);
        if ($counter && preg_match('/^\d+\s/u', trim((string) $counter->textContent))) {
            $counter->nodeValue = $count . ' ' . $words[$lang][$count === 1 ? 0 : 1];
        }
        return;
    }
    foreach ($hidden as $key) {
        $lang = array_search($page, CMS_EXTRA_SERVICES[$key]['pages'], true);
        if ($lang === false) {
            continue;
        }
        // Hidden service page: keep the file, but hide it from search engines and send visitors to the list.
        $head = $xpath->query('//head')->item(0);
        if (!$head) {
            return;
        }
        $robots = $xpath->query('//meta[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="robots"]')->item(0);
        if ($robots instanceof DOMElement) {
            $robots->setAttribute('content', 'noindex, nofollow');
        } else {
            $robots = $dom->createElement('meta');
            $robots->setAttribute('name', 'robots');
            $robots->setAttribute('content', 'noindex, nofollow');
            $head->appendChild($robots);
        }
        $refresh = $dom->createElement('meta');
        $refresh->setAttribute('http-equiv', 'refresh');
        $refresh->setAttribute('content', '0; url=' . cms_page_url(CMS_EXTRA_HUBS[$lang]));
        $head->appendChild($refresh);
        foreach ($xpath->query('//link[@rel="canonical"]') as $canonical) {
            $canonical->parentNode->removeChild($canonical);
        }
        return;
    }
}
