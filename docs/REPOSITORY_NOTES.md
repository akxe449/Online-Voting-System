# Repository preparation notes

This repository was assembled from the two supplied working archives:

- `voting-app-E2E-working-20261007.zip` — Expo frontend.
- `voting-backend-working-20261007.zip` — PHP backend and supplied database migration.

The original backend archive also contained legacy HTML/PHP copies and an installed Composer `vendor/` directory. The repository keeps the active API/config source and Composer metadata; generated dependencies are intentionally excluded and can be restored with `composer install`.

Live backend configuration files were replaced by safe example templates so credentials are not committed.
