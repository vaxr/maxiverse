/** @type {import('next').NextConfig} */

// TODO deal with unsafe- policies
// TODO CSF concept
const contentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
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
