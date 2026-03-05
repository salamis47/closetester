// Standart Web API Middleware (Vercel Edge)
export default async function middleware(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    // 1. Statik dosyaları, resimleri ve admin yolunu pas geç
    if (
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        pathname === '/admin-login' ||
        pathname === '/login'
    ) {
        return;
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

        // 3. Eğer bakım modu aktifse, doğrudan HTML içeriği döndür (Rewrite mantığı)
        if (isMaintenance) {
            return new Response(
                `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Bakımda | PlayTester</title>
    <style>
        :root { --primary: #6366f1; --bg: #0f172a; --text: #f8fafc; --text-muted: #94a3b8; }
        body { margin: 0; padding: 0; font-family: sans-serif; background: var(--bg); color: var(--text); display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 3rem; border-radius: 2rem; text-align: center; max-width: 500px; width: 90%; }
        h1 { color: #fbbf24; margin-bottom: 1rem; }
        p { color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem; }
        .btn-admin { display: inline-block; padding: 0.75rem 1.5rem; background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid #fbbf24; border-radius: 0.75rem; text-decoration: none; }
    </style>
</head>
<body>
    <div class="glass">
        <h1>🛠️ Sistem Bakımda</h1>
        <p>Size daha iyi hizmet verebilmek için kısa süreli bir bakım yapıyoruz. Lütfen biraz sonra tekrar deneyin.</p>
        <a href="/admin-login" class="btn-admin">Yönetici Girişi</a>
    </div>
</body>
</html>`,
                { headers: { 'content-type': 'text/html; charset=UTF-8' } }
            );
        }
    } catch (error) {
        return;
    }
}

export const config = {
    matcher: ['/((?!api|static|favicon.ico).*)'],
};
