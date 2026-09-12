<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/cms.php';
cms_send_security_headers(true);
cms_require_auth(true);

$action = isset($_GET['action']) ? (string) $_GET['action'] : '';
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

try {
    if ($method === 'GET' && $action === 'bootstrap') {
        $backups = cms_ensure_daily_backup();
        $pages = cms_list_pages();
        $draft = cms_get_state('draft');
        $live = cms_get_state('live');
        cms_json_response([
            'ok' => true,
            'csrf' => cms_csrf_token(),
            'pages' => $pages,
            'media' => cms_media_list(),
            'revisions' => cms_list_revisions(),
            'global' => $draft['global'],
            'prices' => cms_prices_get($draft['global']),
            'services' => cms_services_get($draft['global']),
            'hidden_pages' => cms_hidden_pages($draft['global']),
            'dirty' => cms_is_dirty(),
            'published_at' => $live['meta']['published_at'] ?? null,
            'health' => cms_health(),
            'analytics' => cms_analytics_summary(30),
            'backups' => $backups,
            'activity' => cms_activity_list(12),
            'leads_new' => cms_leads_count_new(),
            'notify' => cms_notify_get(),
            'stats' => [
                'pages' => count($pages),
                'languages' => count(array_unique(array_column($pages, 'lang'))),
                'media' => count(cms_media_list()),
                'edited_pages' => count($draft['pages'] ?? []),
            ],
        ]);
    }

    if ($method === 'GET' && $action === 'analytics') {
        cms_json_response(['ok' => true, 'analytics' => cms_analytics_summary(30)]);
    }

    if ($method === 'GET' && $action === 'leads') {
        cms_json_response(['ok' => true, 'leads' => cms_leads_list(), 'leads_new' => cms_leads_count_new()]);
    }

    if ($method === 'GET' && $action === 'audit') {
        $force = (string) ($_GET['refresh'] ?? '') === '1';
        cms_json_response(['ok' => true, 'audit' => cms_site_audit($force), 'health' => cms_health(), 'backups' => cms_backup_status()]);
    }

    if ($method === 'GET' && $action === 'page') {
        $page = cms_normalize_page((string) ($_GET['page'] ?? ''));
        cms_json_response(['ok' => true, 'page' => cms_scan_page($page, cms_get_state('draft'))]);
    }

    if ($method === 'GET' && $action === 'media') {
        cms_json_response(['ok' => true, 'media' => cms_media_list()]);
    }

    if ($method === 'POST') {
        cms_require_csrf();
    }

    if ($method === 'POST' && $action === 'save-page') {
        $input = cms_json_input();
        $page = cms_normalize_page((string) ($input['page'] ?? ''));
        cms_save_page_draft($page, (array) ($input['content'] ?? []));
        cms_activity_log('save_page', ['page' => $page]);
        cms_json_response(['ok' => true, 'dirty' => cms_is_dirty(), 'message' => 'Melnraksts saglabāts.']);
    }

    if ($method === 'POST' && $action === 'save-global') {
        $input = cms_json_input();
        $state = cms_save_global_draft($input);
        cms_activity_log('save_contacts');
        cms_json_response(['ok' => true, 'global' => $state['global'], 'dirty' => cms_is_dirty(), 'message' => 'Kontakti saglabāti melnrakstā.']);
    }

    if ($method === 'POST' && $action === 'save-prices') {
        $input = cms_json_input();
        $state = cms_save_prices_draft($input);
        cms_activity_log('save_prices');
        cms_json_response(['ok' => true, 'prices' => cms_prices_get($state['global']), 'dirty' => cms_is_dirty(), 'message' => 'Cenas saglabātas melnrakstā. Publicējiet, lai tās parādītos vietnē.']);
    }

    if ($method === 'POST' && $action === 'save-services') {
        $input = cms_json_input();
        $state = cms_save_services_draft($input);
        cms_activity_log('save_services');
        cms_json_response(['ok' => true, 'services' => cms_services_get($state['global']), 'hidden_pages' => cms_hidden_pages($state['global']), 'dirty' => cms_is_dirty(), 'message' => 'Pakalpojumu redzamība saglabāta melnrakstā. Publicējiet, lai piemērotu.']);
    }

    if ($method === 'POST' && $action === 'publish') {
        $result = cms_publish();
        cms_activity_log('publish', ['revision' => $result['revision'] ?? '', 'pages' => $result['pages'] ?? 0]);
        cms_json_response(['ok' => true, 'dirty' => false, 'result' => $result, 'revisions' => cms_list_revisions(), 'message' => 'Izmaiņas publicētas vietnē.']);
    }

    if ($method === 'POST' && $action === 'discard') {
        cms_discard_draft();
        cms_activity_log('discard_draft');
        cms_json_response(['ok' => true, 'dirty' => false, 'message' => 'Melnraksta izmaiņas atceltas.']);
    }

    if ($method === 'POST' && $action === 'restore') {
        $input = cms_json_input();
        $revision = (string) ($input['id'] ?? '');
        cms_restore_revision($revision);
        cms_activity_log('restore_revision', ['revision' => $revision]);
        cms_json_response(['ok' => true, 'dirty' => true, 'message' => 'Versija ielādēta melnrakstā. Pārbaudiet un publicējiet.']);
    }

    if ($method === 'POST' && $action === 'upload') {
        if (!isset($_FILES['image'])) {
            throw new InvalidArgumentException('Izvēlieties attēlu.');
        }
        $media = cms_upload_image($_FILES['image']);
        cms_activity_log('upload_image', ['file' => $media['name'] ?? '']);
        $format = static fn (int $bytes): string => $bytes >= 1024 * 1024 ? number_format($bytes / 1024 / 1024, 1, ',', '') . ' MB' : (string) max(1, (int) round($bytes / 1024)) . ' KB';
        $message = 'Attēls pievienots bibliotēkai.';
        if (($media['mode'] ?? 'original') !== 'original' && ($media['saved_percent'] ?? 0) > 0) {
            $message = 'Attēls pievienots: ' . $format((int) $media['original_bytes']) . ' → ' . $format((int) $media['bytes']) . ' (−' . $media['saved_percent'] . ' %' . (($media['mode'] ?? '') === 'webp' ? ', WebP' : '') . ').';
        }
        cms_json_response(['ok' => true, 'media' => $media, 'message' => $message]);
    }

    if ($method === 'POST' && $action === 'delete-media') {
        $input = cms_json_input();
        $name = (string) ($input['name'] ?? '');
        cms_delete_upload($name);
        cms_activity_log('delete_image', ['file' => $name]);
        cms_json_response(['ok' => true, 'message' => 'Attēls izdzēsts.']);
    }

    if ($method === 'POST' && $action === 'password') {
        $input = cms_json_input();
        cms_change_password((string) ($input['current'] ?? ''), (string) ($input['next'] ?? ''));
        cms_activity_log('change_password');
        cms_json_response(['ok' => true, 'message' => 'Parole nomainīta.']);
    }

    if ($method === 'POST' && $action === 'lead-status') {
        $input = cms_json_input();
        $lead = cms_lead_set_status((string) ($input['id'] ?? ''), (string) ($input['status'] ?? 'done'));
        cms_activity_log('lead_status', ['revision' => $lead['id'] . ' ' . $lead['status']]);
        cms_json_response(['ok' => true, 'lead' => $lead, 'leads_new' => cms_leads_count_new(), 'message' => $lead['status'] === 'done' ? 'Pieteikums atzīmēts kā apstrādāts.' : 'Pieteikums atkal ir jauns.']);
    }

    if ($method === 'POST' && $action === 'lead-delete') {
        $input = cms_json_input();
        cms_lead_delete((string) ($input['id'] ?? ''));
        cms_activity_log('lead_delete', ['revision' => (string) ($input['id'] ?? '')]);
        cms_json_response(['ok' => true, 'leads_new' => cms_leads_count_new(), 'message' => 'Pieteikums dzēsts.']);
    }

    if ($method === 'POST' && $action === 'save-notify') {
        $input = cms_json_input();
        $notify = cms_notify_save($input);
        cms_activity_log('save_notify');
        cms_json_response(['ok' => true, 'notify' => $notify, 'message' => 'Paziņojumu iestatījumi saglabāti.']);
    }

    if ($method === 'POST' && $action === 'logout') {
        cms_activity_log('logout');
        cms_logout();
        cms_json_response(['ok' => true, 'redirect' => '/admin/']);
    }

    cms_json_response(['ok' => false, 'error' => 'Darbība nav atrasta.'], 404);
} catch (InvalidArgumentException $error) {
    cms_json_response(['ok' => false, 'error' => $error->getMessage()], 422);
} catch (Throwable $error) {
    error_log('[Autopalidziba CMS] ' . $error->getMessage());
    cms_json_response(['ok' => false, 'error' => 'Servera kļūda. Mēģiniet vēlreiz vai sazinieties ar izstrādātāju.'], 500);
}
