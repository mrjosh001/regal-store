# Regal Store authentication email template

`confirmation.html` is the branded **Confirm signup** email for Regal Store.

## Hosted Supabase setup

The hosted Supabase project does not automatically read HTML files from this repository. Copy the contents of `confirmation.html` into:

**Supabase Dashboard → Authentication → Email Templates → Confirm signup**

Use this subject:

`Confirm your Regal Store account`

The template uses `{{ .ConfirmationURL }}`, so the redirect configured by the application (`/auth/callback`) is preserved by Supabase.

After confirmation, Regal Store's `/auth/callback` verifies the code/token, signs the temporary confirmation session out, and redirects the user to `/sign-in?confirm=success`.
