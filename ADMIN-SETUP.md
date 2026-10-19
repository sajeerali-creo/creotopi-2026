# Creotopi Admin Setup (Hostinger)

The admin runs on Hostinger PHP and stores its data in protected JSON files. It does not need a database or extra software.

## One-time setup

1. In Hostinger hPanel, open **Websites → Manage → File Manager** for your domain.
2. Open `public_html`. Upload the contents of this project there, keeping the folders as they are (`api`, `assets`, `css`, and `js`). The `index.html` file should be directly inside `public_html`.
3. In File Manager, open `public_html/api`. Make a copy of `config.example.php` and name the copy `config.php`.
4. Edit `config.php`. Replace `REPLACE_WITH_A_RANDOM_64_CHARACTER_KEY` with your own random 64-character letters-and-numbers key. Keep this key private. Do not send it to anyone or add `config.php` to GitHub.
5. In Google Cloud Console, choose or create a project, enable **Places API (New)** and billing, then open **APIs & Services → Credentials → Create credentials → API key**. Restrict the key to **Places API (New)**. Add this line to Hostinger's `api/config.php`, replacing the placeholder with your Google key:

	```php
	define('CREOTOPI_GOOGLE_API_KEY', 'REPLACE_WITH_YOUR_GOOGLE_PLACES_API_KEY');
	```

	The key stays in PHP on Hostinger; never put it in a public JavaScript file or send it in chat.
6. Visit `https://YOUR-DOMAIN.com/admin.html`. Enter your setup key, create an admin password with at least 12 characters, and confirm it.
7. Sign in at `/admin.html` whenever you need to update projects or reviews. Changes become public when you select **Save changes**.

Use an HTTPS address for the first setup and for every admin session. The admin password is saved as a one-way password hash; the setup key and admin file are excluded from Git.

## Managing content

- **Works:** Add a project title, service category, Behance link, and image URL or upload a JPG, PNG, or WebP image up to 5 MB. New or edited work moves to the top; use the up/down arrows to change the order. Select **Apply project**, then **Save changes** to publish it.
- **Google reviews:** Add your business's Place ID in the admin and select **Save changes**. The website then fetches live data through the private Hostinger API, cached for one hour. You can find the Place ID with Google's Place ID Finder. Change the displayed score/count or edit the review link in the admin as needed.

Google Places returns up to five reviews per request, not the full review history. The saved review entries remain as a fallback if the Google API is unavailable or not configured. The optional custom API URL is only used when no Place ID is set.

## If saving or uploading fails

In Hostinger File Manager, check that `api/storage` and `assets/uploads` exist and are writable by PHP. Start with the normal `755` folder permission; only change permissions if Hostinger reports a permission error. Keep `api/storage/.htaccess` in place because it prevents direct access to saved data.
