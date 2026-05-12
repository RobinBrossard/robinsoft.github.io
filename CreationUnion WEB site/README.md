# CreationUnion WEB site

This repository contains a pure static GitHub Pages version of the site.

Public site URL: https://www.creationunion.com/

## Publish layout

GitHub Pages is built from `src/main/webapp` and publishes only the static files:

```text
site/
├── index.html
├── about.html
├── products.html
├── css/
├── i18n/
├── images/
├── js/
├── partials/
└── products/
    └── cloudmediaplayer/
        ├── cmp_index.html
        ├── copyright-notice/
        │   └── index.html
        ├── help-center/
        │   └── index.html
        ├── payment-policy/
        │   └── index.html
        ├── privacy-policy/
        │   └── index.html
        └── terms-of-service/
            └── index.html
```

## Not published

These server-side folders are excluded from the GitHub Pages output:

- `src/main/java/`
- `src/main/webapp/WEB-INF/`
- `src/main/webapp/META-INF/`

## Deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` copies the static files into a temporary `site/` folder and publishes that folder to the custom domain `https://www.creationunion.com/`.
