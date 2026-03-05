import { NextResponse } from 'next/server';

// Bu middleware her istekte çalışır ve React uygulamasından önce devreye girer.
export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Statik dosyaları, resimleri ve özel sayfaları pas geç
    // (Döngüye girmemek için /maintenance.html mutlaka hariç tutulmalı)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') ||
        pathname === '/maintenance.html' ||
        pathname === '/admin-login'
    ) {
        return NextResponse.next();
    }

    try {
        // 2. Firestore REST API üzerinden bakım modunu kontrol et
        // (SDK yüklemeye gerek kalmadan çok hızlı bir fetch isteği atar)
        const response = await fetch(
            'https://firestore.googleapis.com/v1/projects/playtester-ae580/databases/(default)/documents/settings/site_settings',
            { next: { revalidate: 0 } } // Önbelleği devre dışı bırak (gerçek zamanlı kontrol için)
        );

        if (!response.ok) return NextResponse.next();

        const data = await response.json();
        const isMaintenance = data?.fields?.maintenanceMode?.booleanValue === true;

        // 3. Eğer bakım modu aktifse, kullanıcıyı hazır HTML sayfasına yönlendir
        if (isMaintenance) {
            return NextResponse.rewrite(new URL('/maintenance.html', request.url));
        }
    } catch (error) {
        // Hata durumunda siteyi bozmamak için normal akışa devam et
        console.error('Bakım modu kontrolü başarısız:', error);
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Sadece belirli yollarda çalışması için (isteğe bağlı performans ayarı)
export const config = {
    matcher: [
        /*
         * Aşağıdaki yollar hariç tüm yollarda çalış:
         * - api (API yolları)
         * - _next/static (statik dosyalar)
         * - _next/image (resim optimizasyon dosyaları)
         * - favicon.ico (ikon dosyası)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
