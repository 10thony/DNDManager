/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' 'nonce-8WZMf22ob5w=' dashing-finch-21.accounts.dev dashing-finch-21.clerk.accounts.dev cdn.jsdelivr.net js.sentry-cdn.com browser.sentry-cdn.com *.sentry.io challenges.cloudflare.com scdn.clerk.com segapi.clerk.com https://api.stripe.com https://maps.googleapis.com https://*.js.stripe.com https://js.stripe.com;
              connect-src 'self' https://*.clerk.accounts.dev https://clerk-telemetry.com https://*.clerk.com https://*.sentry.io https://api.stripe.com;
              frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com;
              img-src 'self' data: https://*.clerk.accounts.dev https://*.clerk.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com;
              style-src 'self' 'unsafe-inline';
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 