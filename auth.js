// Authentication and session management
class AuthManager {
    constructor() {
        this.SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
        this.SESSION_KEY = 'biodata_session';
        this.TOKEN_KEY = 'biodata_token';
        this.init();
    }

    init() {
        // Check if we're on a protected page
        if (this.isProtectedPage()) {
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
            } else {
                this.updateSessionTimer();
                this.startSessionTimer();
            }
        }
    }

    isProtectedPage() {
        const currentPage = window.location.pathname;
        return currentPage.includes('biodata.html') || 
               currentPage.includes('photo-gallery.html') ||
               currentPage.includes('view-logs.html');
    }

    isAuthenticated() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) return false;

        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // Check if session expired
            if (now > session.expiresAt) {
                localStorage.removeItem(this.SESSION_KEY);
                localStorage.removeItem(this.TOKEN_KEY);
                return false;
            }

            // Session is valid
            return true;
        } catch (error) {
            console.error('Error parsing session:', error);
            return false;
        }
    }

    authenticate(token, callback) {
        // Load token from config
        fetch('auth-config.js')
            .then(response => response.text())
            .then(content => {
                // Extract AUTH_TOKENS object from the file
                // This regex matches the object definition
                const tokensMatch = content.match(/const AUTH_TOKENS = (\{[\s\S]*?\});/);
                
                if (!tokensMatch) {
                    callback(false, 'Token configuration file error');
                    return;
                }

                try {
                    // Evaluate the tokens object (safe since it's our own config file)
                    const tokensObj = eval(tokensMatch[1]);
                    const tokenValue = token.trim();
                    
                    // Check if token exists and get its identifier
                    const tokenIdentifier = tokensObj[tokenValue];

                    if (tokenIdentifier) {
                        // Create session
                        const session = {
                            token: tokenValue.substring(0, 10) + '...', // Store partial for logging
                            tokenIdentifier: tokenIdentifier, // Store token identifier
                            authenticatedAt: Date.now(),
                            expiresAt: Date.now() + this.SESSION_DURATION
                        };

                        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
                        localStorage.setItem(this.TOKEN_KEY, tokenValue); // Store full token for logging
                        localStorage.setItem('biodata_token_id', tokenIdentifier); // Store token identifier

                        // Log access
                        this.logAccess(tokenValue, tokenIdentifier, 'login', true);

                        callback(true, 'Authentication successful');
                    } else {
                        // Log failed attempt
                        this.logAccess(tokenValue, 'UNKNOWN', 'login_failed', false);
                        callback(false, 'Invalid token');
                    }
                } catch (error) {
                    console.error('Error parsing tokens:', error);
                    callback(false, 'Token configuration error');
                }
            })
            .catch(error => {
                console.error('Error loading token config:', error);
                callback(false, 'Configuration error');
            });
    }

    logout() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const tokenIdentifier = localStorage.getItem('biodata_token_id');
        if (token) {
            this.logAccess(token, tokenIdentifier || 'UNKNOWN', 'logout', true);
        }
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem('biodata_token_id');
        window.location.href = 'login.html';
    }

    getSessionToken() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                return session.token;
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    getFullToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    redirectToLogin() {
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    startSessionTimer() {
        setInterval(() => {
            if (!this.isAuthenticated()) {
                alert('Your session has expired. Please log in again.');
                this.logout();
                return;
            }
            this.updateSessionTimer();
        }, 1000);
    }

    updateSessionTimer() {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;

        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) return;

        try {
            const session = JSON.parse(sessionData);
            const remaining = session.expiresAt - Date.now();

            if (remaining <= 0) {
                timerElement.textContent = '0:00';
                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error updating timer:', error);
        }
    }

    async logAccess(token, tokenIdentifier, page, success) {
        try {
            // Get IP address
            let ip = 'unknown';
            let latitude = null;
            let longitude = null;
            let city = null;
            let country = null;
            
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                ip = ipData.ip || 'unknown';

                // Get geolocation from IP using ip-api.com (free, no key required)
                if (ip !== 'unknown') {
                    try {
                        const geoResponse = await fetch(`https://ip-api.com/json/${ip}`);
                        const geoData = await geoResponse.json();
                        
                        if (geoData.status === 'success') {
                            latitude = geoData.lat;
                            longitude = geoData.lon;
                            city = geoData.city || null;
                            country = geoData.country || null;
                        }
                    } catch (geoError) {
                        console.warn('Could not fetch geolocation:', geoError);
                    }
                }
            } catch (ipError) {
                console.warn('Could not fetch IP address:', ipError);
            }

            // Get user agent
            const userAgent = navigator.userAgent || 'unknown';

            // Create log entry
            const logEntry = {
                timestamp: new Date().toISOString(),
                token: token ? (token.length > 10 ? token.substring(0, 10) + '...' : token) : 'N/A',
                tokenIdentifier: tokenIdentifier || 'N/A',
                ip: ip,
                latitude: latitude,
                longitude: longitude,
                city: city,
                country: country,
                location: city && country ? `${city}, ${country}` : (country || 'Unknown'),
                page: page,
                userAgent: userAgent,
                success: success,
                url: window.location.href
            };

            // Store in localStorage (keep last 100 entries)
            let logs = [];
            const storedLogs = localStorage.getItem('biodata_logs');
            if (storedLogs) {
                try {
                    logs = JSON.parse(storedLogs);
                } catch (error) {
                    logs = [];
                }
            }

            logs.push(logEntry);

            // Keep only last 100 entries
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }

            localStorage.setItem('biodata_logs', JSON.stringify(logs));

            // Also try to send to a logging endpoint (if you set one up)
            // You can use GitHub Gists, a serverless function, or any API endpoint
            this.sendLogToServer(logEntry);

        } catch (error) {
            console.error('Error logging access:', error);
        }
    }

    async sendLogToServer(logEntry) {
        // Optional: Send logs to an external API
        // You can set up a serverless function or API endpoint
        // For now, logs are stored in localStorage
        // Example endpoint (you would need to set this up):
        // try {
        //     await fetch('YOUR_LOGGING_API_ENDPOINT', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(logEntry)
        //     });
        // } catch (error) {
        //     console.error('Failed to send log to server:', error);
        // }
    }

    getLogs() {
        const storedLogs = localStorage.getItem('biodata_logs');
        if (storedLogs) {
            try {
                return JSON.parse(storedLogs);
            } catch (error) {
                return [];
            }
        }
        return [];
    }
}

// Initialize auth manager
const authManager = new AuthManager();

