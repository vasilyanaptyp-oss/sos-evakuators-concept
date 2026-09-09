<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/cms.php';
cms_require_auth(false);
header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="autopalidziba-cms-' . date('Y-m-d-His') . '.json"');
header('Cache-Control: no-store');
echo json_encode(cms_get_state('draft'), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

