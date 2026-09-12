<?php
declare(strict_types=1);

require_once __DIR__ . '/inc/bootstrap.php';
cms_send_security_headers(false);

$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $token = isset($_POST['csrf']) ? (string) $_POST['csrf'] : '';
    if (!hash_equals(cms_csrf_token(), $token)) {
        $loginError = 'Drošības pārbaude neizdevās. Pārlādējiet lapu.';
    } else {
        [$blocked, $remaining] = cms_login_is_blocked();
        if ($blocked) {
            $loginError = 'Pārāk daudz mēģinājumu. Mēģiniet vēlreiz pēc ' . max(1, (int) ceil($remaining / 60)) . ' minūtēm.';
        } elseif (cms_login((string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''))) {
            header('Location: /admin/');
            exit;
        } else {
            $loginError = 'Nepareizs lietotājvārds vai parole.';
        }
    }
}

if (!cms_is_authenticated()):
?><!doctype html>
<html lang="lv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#0b0c0d">
  <title>Autopalīdzība · Vadības panelis</title>
  <link rel="icon" href="/assets/images/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/admin/assets/admin.css?v=4">
</head>
<body class="login-page">
  <main class="login-shell">
    <section class="login-brand" aria-label="Autopalīdzība.lv">
      <p class="brand-word">AUTO<span>PALĪDZĪBA</span>.LV</p>
      <div>
        <p class="kicker">Vietnes vadība</p>
        <h1>Saturs tavās rokās.</h1>
        <p>Maini tekstus, attēlus un SEO. Pārbaudi priekšskatījumā un tikai tad publicē.</p>
      </div>
      <p class="login-security"><span aria-hidden="true">●</span> Drošs savienojums · meklētājiem slēgts</p>
    </section>
    <section class="login-card">
      <div class="login-card__head">
        <span class="login-index">CMS / 01</span>
        <h2>Ieeja panelī</h2>
        <p>Izmantojiet administratora piekļuvi.</p>
      </div>
      <?php if ($loginError !== ''): ?>
        <div class="alert alert--error" role="alert"><?= cms_h($loginError) ?></div>
      <?php endif; ?>
      <form method="post" class="login-form" autocomplete="on">
        <input type="hidden" name="action" value="login">
        <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>">
        <label>
          <span>Lietotājvārds</span>
          <input name="username" type="text" autocomplete="username" required autofocus>
        </label>
        <label>
          <span>Parole</span>
          <input name="password" type="password" autocomplete="current-password" required>
        </label>
        <button class="button button--primary button--wide" type="submit">Atvērt vadības paneli <span aria-hidden="true">→</span></button>
      </form>
      <a class="back-link" href="/">← Atgriezties vietnē</a>
    </section>
  </main>
</body>
</html>
<?php
exit;
endif;

cms_touch_session();
?><!doctype html>
<html lang="lv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#0b0c0d">
  <title>Autopalīdzība · Vadības panelis</title>
  <link rel="icon" href="/assets/images/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/admin/assets/admin.css?v=4">
</head>
<body class="admin-page" data-csrf="<?= cms_h(cms_csrf_token()) ?>">
  <a class="skip-link" href="#workspace">Pāriet uz saturu</a>
  <div class="admin-shell">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__brand">
        <a href="/admin/" class="brand-word">AUTO<span>PALĪDZĪBA</span>.LV</a>
        <p>Vadības panelis</p>
      </div>
      <nav class="side-nav" aria-label="Vadības sadaļas">
        <button type="button" class="is-active" data-view="dashboard"><span class="nav-icon">⌂</span><span>Pārskats</span></button>
        <button type="button" data-view="analytics"><span class="nav-icon">↗</span><span>Statistika</span></button>
        <button type="button" data-view="leads"><span class="nav-icon">☏</span><span>Pieteikumi</span><b data-leads-count hidden>0</b></button>
        <button type="button" data-view="pages"><span class="nav-icon">▤</span><span>Lapas</span><b data-page-count>—</b></button>
        <button type="button" data-view="media"><span class="nav-icon">◇</span><span>Attēli</span></button>
        <button type="button" data-view="optimization"><span class="nav-icon">✓</span><span>Optimizācija</span></button>
        <button type="button" data-view="settings"><span class="nav-icon">⚙</span><span>Kontakti</span></button>
        <button type="button" data-view="history"><span class="nav-icon">↶</span><span>Versijas</span></button>
      </nav>
      <div class="sidebar__foot">
        <a href="/" target="_blank" rel="noopener">Atvērt vietni <span>↗</span></a>
        <button type="button" data-logout>Iziet</button>
      </div>
    </aside>
    <button class="sidebar-backdrop" type="button" data-sidebar-close aria-label="Aizvērt izvēlni" hidden></button>

    <div class="admin-main">
      <header class="topbar">
        <button class="mobile-nav-toggle" type="button" aria-label="Atvērt izvēlni" aria-expanded="false" aria-controls="sidebar"><span></span><span></span></button>
        <div class="topbar__context">
          <p class="kicker">AUTOPALĪDZĪBA.LV</p>
          <h1 data-view-title>Pārskats</h1>
        </div>
        <div class="topbar__actions">
          <span class="draft-state" data-dirty-state><i></i> Pārbauda…</span>
          <button class="button button--ghost" type="button" data-preview-current disabled>Priekšskatīt</button>
          <button class="button button--primary" type="button" data-publish>Publicēt <span aria-hidden="true">↑</span></button>
        </div>
      </header>

      <main class="workspace" id="workspace" tabindex="-1">
        <div class="loading-state" data-loading>
          <span class="loader"></span>
          <p>Ielādē vadības paneli…</p>
        </div>
        <div data-workspace hidden></div>
      </main>
    </div>
  </div>

  <div class="modal" data-media-picker hidden>
    <button class="modal__backdrop" type="button" data-close-modal aria-label="Aizvērt"></button>
    <section class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="media-picker-title">
      <div class="modal__head">
        <div><p class="kicker">Mediju bibliotēka</p><h2 id="media-picker-title">Izvēlieties attēlu</h2></div>
        <button class="icon-button" type="button" data-close-modal aria-label="Aizvērt">×</button>
      </div>
      <div class="media-picker-grid" data-media-picker-grid></div>
    </section>
  </div>

  <div class="confirm-dialog" data-confirm hidden>
    <button class="modal__backdrop" type="button" data-confirm-cancel aria-label="Atcelt"></button>
    <section class="confirm-dialog__panel" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
      <span class="confirm-mark">!</span>
      <h2 id="confirm-title" data-confirm-title>Apstipriniet darbību</h2>
      <p id="confirm-text" data-confirm-text></p>
      <div class="confirm-actions"><button class="button button--ghost" type="button" data-confirm-cancel>Atcelt</button><button class="button button--danger" type="button" data-confirm-ok>Apstiprināt</button></div>
    </section>
  </div>

  <div class="toast-stack" aria-live="polite" aria-atomic="true" data-toasts></div>
  <script src="/admin/assets/admin.js?v=4" defer></script>
</body>
</html>
