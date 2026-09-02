# SOS Evakuators — homepage concept

Interactive homepage redesign concept for SOS Evakuators / TK Trans in Daugavpils.

The concept uses only public business information and photography published on the official website. It is an independent design demonstration, not the official production website.

## Local preview

```bash
npm start
```

Open `http://127.0.0.1:4174/`.

## Additional services

The additional-service area is intentionally isolated from the towing homepage:

- `citi-pakalpojumi/` is the directory page;
- every service has its own folder and `index.html`;
- `additional-services.css` and `additional-services.js` are shared only by these pages.

To add another service, copy one existing service folder, update its metadata and neutral content, then add one directory link in `citi-pakalpojumi/index.html`. Do not publish prices, contacts, claims, or images until the client has confirmed them.
