// Standard Web API Middleware for Vercel Edge Runtime (No Next.js dependency)
export default async function middleware(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    // 1. Statik dosyaları, resimleri ve özel sayfaları pas geç
    if (
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        pathname === '/maintenance.html' ||
        pathname === '/admin-login'
    ) {
        return; // Normal akışa devam et
    }

    try {
        // 2. Firestore REST API üzerinden bakım modunu kontrol et
        const response = await fetch(
            'https://firestore.googleapis.com/v1/projects/playtester-ae580/databases/(default)/documents/settings/site_settings',
            { cache: 'no-store' }
        );

        if (!response.ok) return;

        const data = await response.json();
        const isMaintenance = data?.fields?.maintenanceMode?.booleanValue === true;

        // 3. Eğer bakım modu aktifse, kullanıcıyı hazır HTML sayfasına yönlendir
        if (isMaintenance) {
            url.pathname = '/maintenance.html';
            return Response.redirect(url);
        }
    } catch (error) {
        console.error('Bakım modu kontrolü başarısız:', error);
    }
}

// Sadece belirli yollarda çalışması için
export const config = {
    matcher: [
        '/((?!api|static|favicon.ico).*)',
    ],
};
