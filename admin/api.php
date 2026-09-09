<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/cms.php';
cms_send_security_headers(true);
cms_require_auth(true);

$action = isset($_GET['action']) ? (string) $_GET['action'] : '';
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

try {
    if ($method === 'GET' && $action === 'bootstrap') {
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
            'dirty' => cms_is_dirty(),
            'published_at' => $live['meta']['published_at'] ?? null,
            'health' => cms_health(),
            'stats' => [
                'pages' => count($pages),
                'languages' => count(array_unique(array_column($pages, 'lang'))),
                'media' => count(cms_media_list()),
                'edited_pages' => count($draft['pages'] ?? []),
            ],
        ]);
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
        cms_json_response(['ok' => true, 'dirty' => cms_is_dirty(), 'message' => 'Melnraksts saglabāts.']);
    }

    if ($method === 'POST' && $action === 'save-global') {
        $input = cms_json_input();
        $state = cms_save_global_draft($input);
        cms_json_response(['ok' => true, 'global' => $state['global'], 'dirty' => cms_is_dirty(), 'message' => 'Kontakti saglabāti melnrakstā.']);
    }

    if ($method === 'POST' && $action === 'publish') {
        $result = cms_publish();
        cms_json_response(['ok' => true, 'dirty' => false, 'result' => $result, 'revisions' => cms_list_revisions(), 'message' => 'Izmaiņas publicētas vietnē.']);
    }

    if ($method === 'POST' && $action === 'discard') {
        cms_discard_draft();
        cms_json_response(['ok' => true, 'dirty' => false, 'message' => 'Melnraksta izmaiņas atceltas.']);
    }

    if ($method === 'POST' && $action === 'restore') {
        $input = cms_json_input();
        cms_restore_revision((string) ($input['id'] ?? ''));
        cms_json_response(['ok' => true, 'dirty' => true, 'message' => 'Versija ielādēta melnrakstā. Pārbaudiet un publicējiet.']);
    }

    if ($method === 'POST' && $action === 'upload') {
        if (!isset($_FILES['image'])) {
            throw new InvalidArgumentException('Izvēlieties attēlu.');
        }
        $media = cms_upload_image($_FILES['image']);
        cms_json_response(['ok' => true, 'media' => $media, 'message' => 'Attēls pievienots bibliotēkai.']);
    }

    if ($method === 'POST' && $action === 'delete-media') {
        $input = cms_json_input();
        cms_delete_upload((string) ($input['name'] ?? ''));
        cms_json_response(['ok' => true, 'message' => 'Attēls izdzēsts.']);
    }

    if ($method === 'POST' && $action === 'password') {
        $input = cms_json_input();
        cms_change_password((string) ($input['current'] ?? ''), (string) ($input['next'] ?? ''));
        cms_json_response(['ok' => true, 'message' => 'Parole nomainīta.']);
    }

    if ($method === 'POST' && $action === 'logout') {
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

