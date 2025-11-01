# Biodata Website with Authentication

A secure biodata website with **client-side** token-based authentication designed for GitHub Pages hosting.

## Features

- 🔐 Token-based authentication (client-side)
- ⏱️ 5-minute session expiration
- 📊 Access logging (tracks token and IP address)
- 🛡️ Protected routes for biodata and gallery pages
- 🌐 Works on GitHub Pages (no server required)

## Setup

1. **Set Your Tokens**
   - Edit `auth-config.js` and add your tokens with identifiers
   ```javascript
   const AUTH_TOKENS = {
       'your-secret-token-here': 'Token 1',
       'another-token-here': 'Token 2',
       // Add more tokens as needed
   };
   ```
   - Each token has an identifier (like "Token 1", "Family Token", etc.) that helps you track which token was used

2. **Deploy to GitHub Pages**
   - Push all files to your GitHub repository
   - Enable GitHub Pages in repository settings
   - Your site will be available at `https://yourusername.github.io/bio-data/`

## Usage

1. Access the website - you'll be redirected to the login page
2. Enter the token from `auth-config.js`
3. Once authenticated, you can access:
   - Biodata page: `biodata.html`
   - Photo Gallery: `photo-gallery.html`
   - View Logs: `view-logs.html`
4. Session expires after 5 minutes of inactivity
5. Logout using the "Logout" button in the navbar

## Access Logs

**Important:** Logs are stored in the user's browser localStorage. This means:
- Each user sees their own access logs
- Logs are stored locally in the browser
- To view all logs from all users, you would need to set up an external logging service

Each log entry contains:
- **Timestamp** - Exact date and time of access
- **Token Identifier** - Which token was used (e.g., "Token 1", "Token 2")
- **IP Address** - Visitor's IP address
- **Location** - City and Country (from IP geolocation)
- **Coordinates** - Latitude and Longitude (from IP geolocation)
- **Page** - Which page was accessed
- **Success/Failure** - Whether authentication was successful
- **User Agent** - Browser information

## View Logs

Access `view-logs.html` (requires authentication) to view:
- All access logs from your browser session
- Statistics (total accesses, unique IPs, unique tokens)
- Export logs as JSON

**Note:** Logs are stored per-browser. If you want to track all visitors, consider setting up an external logging API endpoint.

## File Structure

```
├── auth-config.js         # Token configuration (edit this!)
├── auth.js                # Client-side authentication logic
├── login.html             # Login page
├── biodata.html           # Biodata page (protected)
├── photo-gallery.html     # Gallery page (protected)
├── view-logs.html         # Logs viewer page (protected)
├── index.html             # Redirects to login
├── images.json            # Gallery images list
├── images/                # Image files
└── README.md              # This file
```

**Note:** Server files (`server.js`, `package.json`) are not needed for GitHub Pages. You can keep them for local testing, but they won't be used on GitHub Pages.

## Security Notes

- Token is stored in `auth-config.js` (keep this file secure!)
- Sessions are stored in browser localStorage (expires after 5 minutes)
- Logs are stored per-browser in localStorage
- Client-side authentication means token is visible in browser source (but still requires knowing it)
- For production use, consider hosting on a server with backend authentication

## Local Testing (Optional)

If you want to test locally with the Node.js server:

1. Install dependencies: `npm install`
2. Edit `token.txt` (for server mode)
3. Run: `npm start`
4. Access: `http://localhost:3000`

However, for GitHub Pages, only the client-side files are needed!
