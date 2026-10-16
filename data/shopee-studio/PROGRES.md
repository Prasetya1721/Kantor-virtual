# Studio Shopee — Progres Kerja

## Selesai (16 Okt 2026)
- Riset produk terlaris: `riset-produk-2026-10.json` (5 kandidat; pemenang: Anker Soundcore R50i TWS, Rp158rb-199rb, sumber GoodStats/Compas/Media90).
- Video promo pertama: `promo-r50i.mp4` (1080x1920, 14 detik, 3 scene hook-fitur-CTA, ffmpeg).

## Rencana berikutnya (belum dikerjakan)
1. Ruang 'Studio Shopee' di Kantor Virtual:
   - `src/office3d-layout.ts`: tambah konstanta STUDIO_ROOM di sisi kiri gedung (sebelum desk paling kiri), idle stop 'studio' (meja rigging, ring light, tripod).
   - `src/scene3d/environment.tsx`: tambah komponen StudioShopee (lantai karpet oranye Shopee, ring light, tripod kamera, rak produk).
   - `src/types.ts` + `server/mission-control.ts`: perluas OfficeRoom jadi 'Workspace' | 'Lounge' | 'Studio' ATAU pakai roomPosition 'studio' di Workspace (lebih kecil dampaknya).
   - `src/pages/Office.tsx` (2D): tab ruangan baru atau posisi studio.
   - Test: `src/office3d-layout.test.ts`.
2. Halaman 'Studio Shopee' (routes.ts, pages/StudioShopee.tsx):
   - Kuota min 5 konten per periode (mingguan), progress bar.
   - Pipeline: Riset -> Naskah -> Video -> Upload. Status tiap konten.
   - Tombol 'Reset Periode' (arsipkan, kuota kembali 0).
   - Baca data riset dari /api/studio (endpoint server baru, folder data/shopee-studio).
3. Tim (src/specialized-roles.ts): tambah Riset Produk, Konten Kreator, Koordinator Studio (category 'Peran Pendukung & Tim').
4. Cron harian: cek kuota konten, riset ulang produk tiap Senin.

## Keputusan desain
- Video dibuat motion-graphics (tanpa footage produk asli) agar aman hak cipta; bisa diganti screenshot asli kalau Oppa punya produk fisiknya.
- Data studio disimpan sebagai file JSON di data/shopee-studio (bukan DB) — sesuai pola repo (stateless, read-only server).
