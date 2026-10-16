# Prompt Storyboard — Konten 001 (Anker Soundcore R50i)

## Cara pakai (5 menit, gratis)
1. Buka chatgpt.com (atau gemini.google.com) dari HP/laptop Oppa, login akun sendiri.
2. Upload 1 foto produk R50i (sudah tersedia: `aset/produk-1.jpg` — foto resmi toko).
3. Aktifkan create image, paste prompt di bawah.
4. **Cek storyboard sederit**: jumlah tangan, teks typo, jumlah earbuds. Salah = regenerate.
5. Download storyboard → lanjut ke Google Flow (labs.google/flow).

## Prompt (copy-paste)
Saya ingin membuat video affiliate produk earbuds Anker Soundcore R50i dari foto produk
yang saya upload. Buatkan storyboard video affiliate vertikal 9:16 durasi 10 detik yang
keren dan realistis: satu gambar berisi 4 panel adegan berurutan. Setiap panel harus ada:
deskripsi visual detail (kamera, pencahayaan, latar), dialog voice-over bahasa Indonesia
santai, teks di layar, dan durasi dalam detik.

Adegan:
1. (0-2s) HOOK: close-up TWS putih di atas meja kayu, ring light, tangan mengambil case.
   VO: "Earphone sejuta umat 2026, harganya cuma Rp158 ribu!" Teks: "TWS SEJUTA UMAT"
2. (2-5s) FITUR: karakter memakai earbuds sambil dengar musik, visual bass bergelombang.
   VO: "Bass nendang, baterai sampai 30 jam, dan tahan keringat." Teks: "BASS NENDANG · 30 JAM"
3. (5-8s) DETAIL: zoom earbuds + kotak, ikon Bluetooth 5.3 dan IPX5 muncul.
   VO: "Bluetooth 5.3, tahan keringat IPX5." Teks: "BT 5.3 · IPX5"
4. (8-10s) CTA: produk + badge harga, karakter menunjuk ke bawah.
   VO: "Garansi resmi 18 bulan — cek keranjang kuning sekarang!" Teks: "Rp158.000 · CEK KERANJANG KUNING"

## Lanjutan di Google Flow (labs.google/flow)
- Login Gmail, project baru, MATIKAN tombol agent
- Video → rasio 9:16 → assets 1x generate → OmniFlash 10 detik (15 poin)
- Upload storyboard → prompt: "Buatlah video yang keren dari gambar storyboard ini."
- Download hasil → gabung dengan VO (vo-fast.mp3) di Tahap 5

## Status konten-001
- Naskah: OK (naskah.md)
- VO: OK (vo-fast.mp3, 17,5 detik)
- Video sementara: final.mp4 (motion-graphics, tanpa AI video)
- Storyboard AI: MENUNGGU Oppa jalankan dari browser sendiri (server ini diblokir anti-bot:
  Shopee captcha, Tokopedia error, ChatGPT Cloudflare, Gemini upload hang 50%)
