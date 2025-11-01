# Access Logging Information

## How Logging Works

The authentication system logs every access attempt with the following information:
- **Token used** (partial for security - first 10 characters)
- **IP Address** (fetched via ipify.org API)
- **Page accessed** (biodata.html, photo-gallery.html, etc.)
- **Timestamp** (exact date and time)
- **Success/Failure** status
- **User Agent** (browser information)

## Where Logs Are Stored

**Logs are stored in the browser's localStorage** for each user. This means:
- Each user/browser has their own log history
- Logs persist until browser data is cleared
- Maximum of 100 log entries stored (oldest are removed automatically)

## Viewing Logs

### As a Site Visitor:
- Visit `view-logs.html` after logging in
- You'll see all access logs from your browser session
- You can export logs as JSON

### As a Site Owner:
**Option 1: View from Your Browser**
- Access your site and log in
- Go to `view-logs.html`
- You'll see logs from your browser's session
- Export the JSON file to save logs

**Option 2: Set Up External Logging (Recommended for Tracking All Visitors)**
- Logs are currently client-side only
- To track all visitors' access, you would need to:
  1. Set up an API endpoint (serverless function, webhook, etc.)
  2. Modify `auth.js` to send logs to your API
  3. Store logs in a database or logging service

Example integration point is in `auth.js`:
```javascript
async sendLogToServer(logEntry) {
    // You can implement API call here
}
```

## Important Notes

1. **Privacy**: Each user's logs are only visible to them in their own browser
2. **Security**: Token is partially masked in logs (only first 10 chars shown)
3. **Limitation**: Client-side logging means you can't see other users' access unless they export and share their logs
4. **IP Tracking**: IP is fetched using a public API (ipify.org) - this is accurate but may be rate-limited

## For Production Use

If you need to track all visitors:
- Use a server-side solution (like the included `server.js` for local hosting)
- Set up a serverless function (AWS Lambda, Vercel Functions, etc.)
- Use a third-party analytics service
- Integrate with a database service (Firebase, Supabase, etc.)

