<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/cms.php';
cms_require_auth(false);

header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Cache-Control: no-store, max-age=0');
header('X-Frame-Options: SAMEORIGIN');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self' mailto:");

try {
    $page = cms_normalize_page((string) ($_GET['page'] ?? 'index.html'));
    $html = cms_render_page($page, cms_get_state('draft'));
    $dom = cms_dom_load($html);
    $xpath = new DOMXPath($dom);
    foreach ($xpath->query('//meta[translate(@http-equiv,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="content-security-policy"]') as $node) {
        if ($node->parentNode) {
            $node->parentNode->removeChild($node);
        }
    }
    $head = $xpath->query('//head')->item(0);
    if ($head) {
        $base = $dom->createElement('base');
        $base->setAttribute('href', cms_page_url($page));
        $head->insertBefore($base, $head->firstChild);
    }
    echo $dom->saveHTML();
} catch (Throwable $error) {
    http_response_code(500);
    echo '<!doctype html><html lang="lv"><meta charset="utf-8"><title>Kļūda</title><body style="font:16px system-ui;background:#101214;color:#fff;padding:32px"><h1>Priekšskatījums nav pieejams</h1><p>' . cms_h($error->getMessage()) . '</p></body></html>';
}

