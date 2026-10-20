# Creotopi Admin Setup (Hostinger)

The admin runs on Hostinger PHP and stores its data in protected JSON files. It does not need a database or extra software.

## One-time setup

1. In Hostinger hPanel, open **Websites → Manage → File Manager** for your domain.
2. Open `public_html`. Upload the contents of this project there, keeping the folders as they are (`api`, `assets`, `css`, and `js`). The `index.html` file should be directly inside `public_html`.
3. In File Manager, open `public_html/api`. Make a copy of `config.example.php` and name the copy `config.php`.
4. Edit `config.php`. Replace `REPLACE_WITH_A_RANDOM_64_CHARACTER_KEY` with your own random 64-character letters-and-numbers key. Keep this key private. Do not send it to anyone or add `config.php` to GitHub.
5. Visit `https://YOUR-DOMAIN.com/admin.html`. Enter your setup key, create an admin password with at least 12 characters, and confirm it.
6. Sign in at `/admin.html` whenever you need to update projects or reviews. Changes become public when you select **Save changes**.

Use an HTTPS address for the first setup and for every admin session. The admin password is saved as a one-way password hash; the setup key and admin file are excluded from Git.

## Managing content

- **Works:** Add a project title, service category, Behance link, and image URL or upload a JPG, PNG, or WebP image up to 5 MB. New or edited work moves to the top; use the up/down arrows to change the order. Select **Apply project**, then **Save changes** to publish it.
- **Google reviews:** In the admin, edit the displayed rating and total, write-review link, and individual review cards. Add, edit, or delete review entries, then select **Save changes** to publish the static content to the home page.

No Google API key or Google Cloud project is needed for review content. Enter or update the review details manually in the admin.

## If saving or uploading fails

In Hostinger File Manager, check that `api/storage` and `assets/uploads` exist and are writable by PHP. Start with the normal `755` folder permission; only change permissions if Hostinger reports a permission error. Keep `api/storage/.htaccess` in place because it prevents direct access to saved data.
