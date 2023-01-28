/** @type {import('next').NextConfig} */

// TODO remove phaser.io
// TODO deal with unsafe- policies
// TODO CSF concept
const contentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self' labs.phaser.io;
`


const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: contentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
                    },
                ],
            }
        ]
    },
}

module.exports = nextConfig
