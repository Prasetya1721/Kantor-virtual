# Metadata Upload — Konten 002 (Skintific Serum)

- Produk: Skintific Serum Wajah (kategori #1 Shopee Q1 2026, pangsa 6,4%)
- Video final: final.mp4 (12,6 detik, 7 shot AI + VO Gadis, gaya cepat ala video contoh Oppa)
- Gaya: hook "Nyesel kenapa nggak dari dulu tahu..." → fitur → CTA (transkrip analisis video contoh)
- VO: /tmp sumber dihapus; regenerate via edge-tts bila perlu (teks di naskah.md)
- Caption: Serum nomor satu di Shopee! Cepat serap, nggak lengket ✨ Cek keranjang kuning!
- Hashtag: #Skintific #SerumWajah #SkincareLokal #ShopeeAffiliate #RacunShopee #GlowingSkin #KulitSehat #PromoShopee
- Catatan klaim: sebut kandungan niacinamide; JANGAN klaim menyembuhkan; BPOM wajib disebut
- Status: SIAP UPLOAD (menunggu review Oppa)


## Revisi v2 (17 Okt — koreksi Oppa)
- Produk asli: botol Skintific asli (foto resmi us.skintific.com, di aset/botol-asli.jpg)
  dikompositkan ke scene s2/s4/s6 dengan drop shadow → Produk di video = barang asli.
- VO natural: script dengan jeda natural ("Duh,... Nah, ini dia solusinya.") + rate +15%
  + pitch +15Hz → lebih hidup. vo-natural.mp3 (14,5 dtk setelah atempo 1.2).
- Video final: final-v2.mp4 (13,3 dtk).
- Catatan: compositing PIL masih sederhana (rounded-rect mask). Untuk hasil sempurna,
  cut-out presisi butuh rembg (AI background removal) — bisa dipasang nanti.


## Revisi v3 (17 Okt — Gemini via ModelRouter)
- Oppa kasih akses ModelRouter: ternyata punya gemini-3.8-flash (vision) +
  gemini-3.8-flash-lite-tts (TTS natural).
- VO v3: Gemini TTS voice "Leda" — intonasi jauh lebih natural dari edge-tts
  (transkrip verifikasi via whisper: bersih, tanpa instruksi terucap).
- VO 13,5 dtk → final-v3.mp4 12,5 dtk, produk asli tetap dipakai.
- Key disimpan di .env sebagai MODELROUTER_TTS_KEY.
- Catatan: endpoint chat gemini di router ini vision-capable (QA storyboard otomatis
  jadi mungkin!), tapi TIDAK ada image-generation endpoint.
