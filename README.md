# Kantor Virtual · Ruang — Kantor 3D & Mission Control Hermes

*Ruang* adalah kantor virtual 3D sekaligus mission control **hanya-baca** untuk kru [Hermes Agent](https://hermes-agent.nousresearch.com) dan OpenCode di mesin lokal. Lihat siapa yang bekerja dan apa yang dikerjakannya, plus papan Kanban, cron, sesi, memori, folder, dan log — semuanya di satu tempat. Semua dibaca lewat CLI `hermes`, dan tidak ada yang pernah diubah.

![Kantor 3D: seorang agen bekerja di mejanya, agen santai bermain ping-pong dan konsol di ruang game](docs/screenshots/office.png)

![Statistik mission control dalam tema malam](docs/screenshots/mission-control.png)

> **Tentang repo ini.** Ini fork kerja dari [yugienugraha/ruang](https://github.com/yugienugraha/ruang), dipakai untuk AI Team Kantor Virtual Prasetya. Perbedaannya dari upstream: antarmuka sudah diterjemahkan ke bahasa Indonesia (menu, judul halaman, label, pesan kosong, pesan galat) sementara id internal, slug URL, dan kontrak API tetap Inggris supaya tautan lama dan tes tetap stabil. Sinkronisasi dengan upstream dilakukan lewat `git remote upstream`.

## Status repo ini

| | |
|---|---|
| **Versi** | 0.2.0 |
| **Bahasa antarmuka** | Indonesia (label, pesan, dan judul halaman) |
| **Basis** | fork dari `yugienugraha/ruang`, riwayat upstream ada di remote `upstream` |
| **Rilis** | `v0.2.0` — paket `ruang.tgz` dilampirkan ke [release](https://github.com/Prasetya1721/Kantor-virtual/releases/latest) |
| **Pemeriksaan** | `npm run lint`, `npm test`, `npm run build` |

## Prasyarat

- Node.js 20 atau lebih baru
- `hermes` tersedia di `PATH` shell yang menjalankan server
- `opencode` opsional; kalau terpasang, ia muncul sebagai agen

## Instalasi

Lewat installer (memasang rilis terakhir dari repo ini):

```bash
curl -fsSL https://raw.githubusercontent.com/Prasetya1721/Kantor-virtual/main/install.sh | bash
```

Lalu jalankan dan buka http://127.0.0.1:3001:

```bash
ruang                        # atau: ruang --port 3005
```

- **Jalan di latar belakang dan saat boot (Linux):** tambahkan `--service` untuk memasang systemd user service:
  `curl -fsSL https://raw.githubusercontent.com/Prasetya1721/Kantor-virtual/main/install.sh | bash -s -- --service`
  Supaya tetap jalan setelah logout, jalankan juga `loginctl enable-linger $USER`.
- **Perbarui:** jalankan perintah install lagi.
- **Hapus:** tambahkan `--uninstall`.
- **Opsi lain:** `--version v0.2.0` memasang rilis tertentu; `--from-source` membangun dari `main` (butuh `git`); `--tarball <path>` memasang paket `.tgz` lokal. Lihat `install.sh --help`.
- **Di server:** Ruang hanya mendengarkan `127.0.0.1`. Dari laptop, jalankan `ssh -L 3001:127.0.0.1:3001 user@server`, lalu buka http://127.0.0.1:3001.

Semua masuk ke `~/.local/share/ruang`, plus perintah `ruang` di `~/.local/bin`. Instalasi dengan nama proyek sebelumnya (`mission-control`, `majujaya`) dibersihkan otomatis. Tidak ada `sudo` dan tidak ada yang dipasang system-wide. Mau membaca skripnya dulu? `curl -fsSL https://raw.githubusercontent.com/Prasetya1721/Kantor-virtual/main/install.sh -o install.sh`, baca, lalu `bash install.sh`.

**Dengan Node.js 20+ milik sendiri:** unduh `ruang.tgz` dari [release terakhir](https://github.com/Prasetya1721/Kantor-virtual/releases/latest) lalu jalankan `npm install -g ./ruang.tgz`.

**Dari checkout** (untuk pengembangan):

```bash
git clone https://github.com/Prasetya1721/Kantor-virtual.git
cd Kantor-virtual
npm install
npm run build      # UI ke dist/, server ke build/server/
npm start          # buka http://127.0.0.1:3001
```

## Pengembangan

```bash
npm install
npm run dev        # API di 127.0.0.1:3001 + Vite UI (buka URL yang dicetak Vite, biasanya http://localhost:5173)
```

Produksi dari checkout (satu proses, menyajikan UI hasil build dan API):

```bash
npm run build
npm start          # buka http://127.0.0.1:3001
```

**Merilis versi baru.** Workflow *Release* (`.github/workflows/release.yml`) berjalan saat tag `v*` di-push: ia memeriksa tag cocok dengan `version` di `package.json`, menjalankan lint, tes, dan build, lalu melampirkan `ruang.tgz` ke GitHub release — paket itulah yang diunduh installer.

```bash
npm version 0.2.1 && git push origin main --follow-tags
```

Publishing ke npm bersifat opsional: tambahkan secret `NPM_TOKEN` di repo untuk mengaktifkannya. Tanpa secret itu, langkah npm dilewati dan release GitHub tetap dibuat.

**Setelah menarik kode baru** jalankan `npm install && npm run build` lalu mulai ulang `npm start` (`npm start` yang sedang jalan tetap menyajikan API lama; `npm run dev` restart sendiri). UI memeriksa `/api/health` dan menampilkan banner *Perlu mulai ulang* saat server lebih lama daripada halaman. Setel `RUANG_PORT` (atau pakai `--port`) untuk mengganti port. Pengaturan lama `MISSION_CONTROL_*` masih berfungsi.

## Halaman

Navigasi berupa drawer, tertutup secara bawaan seperti menu game: buka dengan tombol ☰ atau tombol **M**, tutup dengan Esc, klik di luar, atau dengan memilih halaman. Titik pada ☰ menandai pembacaan CLI yang gagal atau gateway yang berhenti. Header punya satu tombol tema terang/gelap (diingat per peramban) dan tombol segarkan. Semua halaman melakukan polling otomatis, menyimpan data terakhir yang baik (ditandai *Basi* kalau penyegaran gagal), dan punya tombol segarkan manual. "Segarkan semua" melewati cache server 10 detik untuk apa pun yang lebih tua dari 2 detik. Halaman bisa diakses lewat hash URL (misalnya `#/task-board`; slug tetap Inggris supaya tautan lama tidak putus).

- **Kantor** (halaman utama): kantor memenuhi layar di bawah header. HUD di bagian atas menampilkan kru aktif, gateway berjalan, tugas berjalan/terbuka, cron berikutnya, dan (kalau ada) pembacaan CLI yang gagal; tiap chip menautkan ke halamannya. Tombol **Panel** membuka satu panel samping dengan tiga tab: **Kru** (ringkasan kru dan daftar stasiun yang bisa diklik), **Statistik** (statistik dari setiap sumber, pemakaian token, rincian status Kanban, runtime, dan agenda berikutnya; tile menautkan ke halamannya), dan **Aktivitas** (metadata sesi tanpa atribusi dan kanal pesan). Tombol **Tugas**, **Kalender**, dan **Token** membuka Papan Tugas, kalender bulan cron, atau pemakaian token di atas kantor tanpa meninggalkannya (Esc atau ✕ menutupnya; *Buka halaman penuh* menuju halamannya). `#/dashboard` membuka Kantor.

  Tampilan bisa berganti antara **3D** (bawaan) dan **2D**, diingat per peramban; peramban tanpa WebGL tetap di 2D. Tampilan 3D (three.js lewat React Three Fiber, hanya diunduh saat dipakai) adalah kantor beberapa ruangan dengan sentuhan Indonesia:
  - ruang kerja: meja bersama, satu meja tanpa label per agen dalam dua baris (gedung melebar untuk kru yang lebih besar), dan meja rapat dengan gorengan di atasnya
  - ruang santai di balik partisi kaca, sofanya menghadap TV di dinding belakang
  - ruang game lewat pintu dari ruang santai: ping-pong, dua mesin arcade, sudut konsol dengan beanbag, dan papan karambol
  - pantry dengan dispenser galon
  - AC split di dinding (unit luar di belakang gedung) dan lampu LED kantor putih sejuk yang digantung
  - bendera Merah Putih di sudut halaman
  - di gang samping gedung, di luar pandangan utama: gerobak bakso dan kopi keliling, masing-masing dengan penjualnya

  Semua mengikuti tema: siang di mode terang, malam di mode gelap, saat lampu kantor, lampu jalan, dan lampu gerobak menyala. Hanya tekstur prosedural yang dipakai, tanpa berkas gambar atau model. Geser untuk memutar, gulir untuk zoom, dan geser tampilan dengan klik kanan, dua jari, tombol panah, atau tombol **Geser** (yang membuat geser biasa memindahkan tampilan). Menggeser tetap di dalam halaman, dan **Atur ulang tampilan** kembali ke tampilan awal.

  Gedung punya dua lantai; tombol di kiri atas tampilan 3D (atau Page Up / Page Down) berpindah lantai, masing-masing menampilkan berapa agen di lantai itu. **Lantai 1** adalah kantor. **Lantai 2**, lewat tangga di dekat pintu masuk, berisi kamar tidur dengan satu tempat tidur per agen, sudut lesehan, kamar mandi, dan balkon gaya ruko dengan kursi rotan, hammock, jemuran, dan lampu hias; lantai bawah tertutup di bawahnya, dan agen di luar gedung tetap terlihat. Agen santai juga naik ke atas untuk tidur, tidur siang di hammock, atau duduk di balkon; tombol **💤 Tidur** mengirim semua agen santai ke tempat tidur (diingat per peramban, seperti lantainya). Tidur hanya dekoratif, sama seperti aktivitas santai lainnya.
  Setiap agen punya mejanya sendiri. Agen yang membalas chat berjalan ke meja rapat; yang menjalankan cron, alat, atau tugas Kanban duduk di mejanya dengan gelembung bicara yang menyebut apa yang dikerjakannya. Agen berjalan lewat lorong dan memakai pintu masuk, tidak pernah menembus perabot atau dinding. Agen santai tidak hanya duduk: setiap 32 detik masing-masing pindah ke tempat lain, seperti bersantai di ruang santai, ping-pong, arcade, atau konsol di ruang game, mengambil air galon, ke dapur, bakso di kursi gerobak, ngopi di sepeda kopi, atau jalan-jalan ke bendera atau rak buku. Gelembung putus-putus menyebutkan di mana mereka. Aktivitas ini dekoratif saja (rute berbasis jam yang sama untuk semua), dan status Santai sendiri datang dari server. Klik agen untuk dialog detailnya, dengan tiga tab: **Ikhtisar** (status, tugas, asal-usul, kesegaran), **Folder** (folder agen itu sendiri, hanya-baca, seperti di halaman Folder), dan **Memori** (SOUL.md, MEMORY.md, USER.md, dan berkas konteksnya).
- **Agen**: setiap agen di mesin ini, dengan model, status gateway, dan apa yang dikerjakannya di kantor. Agen ditemukan, bukan dikonfigurasi: setiap profil Hermes dari `hermes profile list` adalah agen, ditambah OpenCode kalau terpasang. Profil baru muncul otomatis, dan setiap agen punya warna karakternya sendiri yang diturunkan dari namanya. Halaman ini juga menampilkan Divisi Engineering: enam peran spesialis (Front-End, Back-End, Full-Stack, UI/UX, Project Manager, QA) yang berjalan sebagai Sub-Agent on-demand, bukan daemon latar belakang, supaya host 2-CPU tetap ringan.
- **Papan Tugas**: Kanban Hermes dalam urutan papan (triage → todo → scheduled → ready → running → blocked → review → done) dengan pencarian, filter penanggung jawab, dan prioritas. Tugas dari setiap papan Kanban ditampilkan (bukan hanya papan saat ini), dengan filter papan saat papannya lebih dari satu. Setiap kolom setinggi layar dan bergulir sendiri, sehingga bilah gulir samping papan tetap terlihat; strip di atas papan menggesernya (‹ ›) atau melompat ke kolom lewat chip statusnya. Klik kartu untuk detail lengkapnya dari `hermes kanban show <id> --json`: deskripsi, hasil atau ringkasan terbaru, ruang kerja, cabang, keahlian, model, waktu, dependensi (bisa diklik), jalan, komentar, dan aktivitas. Teks bebas disamarkan rahasianya; hanya id yang ada di snapshot papan yang bisa dibuka.
- **Kalender**: kalender bulan berisi cron setiap agen (tiap tugas dilabeli agennya, dan kalender bisa disaring per agen): jalan mendatang sejak hari ini, tugas berulang, jalan yang terlambat, dan hasil jalan terakhir, dibaca dari ekspresi cron 5-field dan interval `every …`, dalam waktu lokal host Hermes. Di bawahnya ada daftar tugas dengan status, jalan berikutnya, keterlambatan, dan hasil jalan terakhir. Tugas yang dijeda hanya menampilkan jalan terakhirnya.
- **Aktivitas**: 20 sesi terbaru dengan pencarian.
- **Memori**: per agen, apa yang dibawanya ke setiap sesi (mengikuti dokumentasi memori dan berkas konteks Hermes):
  - `SOUL.md` (identitas, slot prompt sistem #1)
  - `memories/MEMORY.md` (catatan agen) dan `memories/USER.md` (profil pengguna), dipecah per entri `§`, dengan bilah pemakaian terhadap batas yang dikonfigurasi (bawaan 2.200 / 1.375 karakter dari `memory.*` di `config.yaml`) dan peringatan di atas 80%
  - berkas konteks yang ada di profil (`HERMES.md`, `.hermes.md`, `AGENTS.override.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`)
  - pengaturan memori (store aktif, `write_approval`, penyedia eksternal)

  OpenCode menampilkan `AGENTS.md`/`CLAUDE.md` globalnya. Entri bisa dicari. Semua dibaca lewat lapisan keamanan Folder, jadi hanya-baca, terbatas di folder agen, dan rahasianya disamarkan. `#/knowledge` membuka halaman ini.
- **Folder**: satu folder per agen, dan hanya folder agen itu: profil Hermes `<name>` → `~/.hermes/profiles/<name>`, OpenCode → `~/.opencode`. Telusuri sub-folder dan lihat berkas secara hanya-baca. Lihat *Folder* di bawah.
- **Log**: ekor dari `hermes logs agent|gateway|errors` dengan filter level, pencarian, dan mode ikuti, plus audit setiap perintah yang dijalankan server (tab *Audit perintah*).
- **Pengaturan**: kode akses opsional dan kunci profil. Lihat *Kode akses* dan *Kunci profil* di bawah.

**Pemakaian token** (halaman **Pemakaian** di menu, tombol **◔ Token** di Kantor, dan tab Statistik di Panel) menjumlahkan `hermes insights` setiap agen, karena Hermes menyimpan sesi per profil. Pilih 24 jam, 7 hari, atau 30 hari untuk melihat:
- total token, masuk/keluar, estimasi biaya, sesi, pesan, dan panggilan alat untuk seluruh kru, plus pemakai terbesar
- **Per agen**: setiap agen diurutkan berdasarkan token dengan porsinya dari total; arahkan kursor untuk masuk/keluar, sesi, biaya, dan sesi terbesarnya
- **Per jenis pekerjaan**: token per sumber sesi, seperti tugas Kanban, cron, Telegram, atau terminal
- **Per model** dan **Alat teratas**, di semua agen

Dialog agen di Kantor menampilkan token agen itu selama 7 hari dan peringkatnya. Hitungan per sumber dan per model mencakup token cache, jadi bisa melebihi total. Agen yang insights-nya tidak bisa dibaca tampil sebagai *Tidak Tersedia* sementara yang lain tetap dihitung. Token per tugas Kanban tidak tersedia: Hermes tidak mencatatnya per tugas.

## Kode akses

Mati secara bawaan. Nyalakan di **Pengaturan → Kode akses** untuk meminta kode setiap kali Ruang dibuka di peramban. Cara kerjanya seperti API key, bukan nama pengguna dan kata sandi:

1. Pilih **Buat otomatis** (kode acak seperti `ruang-7KQ4-M2XD-9PWT-H6RA`) atau **Kustom** (minimal 12 karakter, diketik dua kali).
2. **Unduh .txt** atau **Salin**. Kode hanya ditampilkan saat diatur, dan Ruang tidak punya reset kata sandi, jadi berkas yang diunduh adalah cadangannya.
3. Centang *Saya sudah menyimpan kode ini*, opsional *Ingat perangkat ini selama 7 hari*, lalu aktifkan.

Setiap peramban kemudian menampilkan layar buka kunci lebih dulu. Tanpa *Ingat*, sesi berakhir saat peramban ditutup (dan paling lama 12 jam). **Ganti kode** dan **Matikan** memerlukan kode saat ini; mengganti atau menghapusnya mengeluarkan semua peramban. **Kunci peramban ini** mengakhiri sesi saat ini.

Kode hilang? Di mesin yang menjalankan Ruang:

```bash
ruang access-code off      # hapus, lalu set kode baru di Pengaturan
ruang access-code new      # atau cetak kode acak baru
ruang access-code status
```

Cara pelindungannya:
- Hanya hash scrypt dari kode yang disimpan, bersama secret acak yang menandatangani sesi, di `~/.config/ruang/access.json` (mode `0600`; `RUANG_CONFIG_DIR` atau `XDG_CONFIG_HOME` memindahkannya). Kodenya sendiri tidak pernah disimpan, dicatat di log, atau disimpan di peramban.
- Server yang menegakkan: saat terkunci, setiap rute `/api` kecuali `/api/health` dan rute buka kunci menjawab `401`, jadi tidak ada data Hermes yang sampai ke peramban. Shell UI-nya sendiri statis dan tidak membawa data.
- Sesi memakai cookie `HttpOnly`, `SameSite=Strict`. Perubahan memerlukan header permintaan dari halaman yang sama, sehingga situs lain tidak bisa melakukannya.
- Setelah 5 kode salah, setiap percobaan berikutnya dari alamat yang sama menunggu lebih lama (1 detik, berlipat, sampai 5 menit).
- `access.json` yang rusak membuat Ruang tetap terkunci, bukan terbuka; `ruang access-code off` membersihkannya.
- Ini satu-satunya penulisan Ruang, dan hanya menyentuh konfigurasi Ruang sendiri, tidak pernah Hermes.

Ruang mengikat `127.0.0.1`, jadi kode ini penting saat diakses dari perangkat lain, misalnya lewat SSH tunnel, Tailscale, atau reverse proxy. Lewat HTTP biasa, kode melintas jaringan tanpa enkripsi; pakai tunnel HTTPS atau Tailscale untuk itu.

## Kunci profil

Mati secara bawaan. Di **Pengaturan → Kunci profil**, pilih agen yang dikunci dan setel satu PIN 6 digit, seperti app lock di ponsel. Agen terkunci tetap bekerja dan tetap muncul di kantor (dengan 🔒 di namanya, dan statusnya seperti Bekerja atau Santai), tapi data privatnya tetap tersembunyi sampai PIN membuka agen itu di peramban ini selama 15 menit:

| Data | Saat terkunci |
|---|---|
| Isi folder dan berkas, memori (SOUL.md, MEMORY.md, USER.md, berkas konteks) | ditolak (HTTP 423); tab Folder dan Memori meminta PIN |
| Tugas Kanban yang ditugaskan padanya | kartunya tetap, berjudul *🔒 Private task*; detailnya meminta PIN |
| Cron miliknya | jadwalnya tetap, bernama *🔒 Private job* |
| Aktivitas langsung dan tugas saat ini di kantor | generik (*🔒 Bekerja*, *On a break*) |
| Sesi, log, dan sesi terbaru (berasal dari profil `default`) | disembunyikan saat `default` terkunci |
| Pemakaian token | totalnya tetap; sesi terbesarnya disembunyikan |

Membuka satu agen tidak membuka agen lain, dan **🔒 Kunci lagi** menutupnya lebih awal. Mengubah daftar agen terkunci, PIN, atau mematikan kunci memerlukan PIN saat ini; PIN baru mengunci semua agen lagi. Server menegakkan semua ini per permintaan, bukan hanya di halaman.

- Hanya hash scrypt dari PIN yang disimpan, di `~/.config/ruang/profile-lock.json` (mode `0600`), bersebelahan dengan kode akses.
- Pembukaan ditandatangani, per agen, dalam cookie `HttpOnly`, `SameSite=Strict` yang kedaluwarsa setelah 15 menit.
- Setelah 5 PIN salah, setiap percobaan menunggu lebih lama (1 detik, berlipat, sampai 5 menit); setelah 10 PIN salah, satu jam.
- Berkas kunci yang rusak membuat semua agen tetap terkunci. PIN hilang? Di mesin: `ruang profile-lock off` (dan `ruang profile-lock status`).
- Kunci ini mencakup apa yang ditampilkan Ruang. Siapa pun yang punya shell di mesin tetap bisa membaca `~/.hermes` langsung, dan Hermes sendiri tidak berubah.

## Data dan keamanan

Server hanya memakai perintah tetap dan hanya-baca berikut:
- `hermes profile list` (agen dan status gateway-nya), `opencode --version`
- `hermes kanban boards list --json`, lalu `hermes kanban --board <slug> list --json` untuk setiap papan yang punya tugas (maksimal empat sekaligus; `hermes kanban list --json` biasa pada versi Hermes tanpa boards), dan `hermes kanban --board <slug> show <id> --json` (detail tugas)
- `hermes -p <profile> cron list --all` untuk setiap profil di `hermes profile list` (Hermes menyimpan cron per profil), `hermes sessions list --limit 20`, `hermes skills list --enabled-only`
- `hermes status --all`, `hermes logs <agent|gateway|errors> -n 200`
- untuk pemakaian token, untuk setiap profil (maksimal empat sekaligus): `hermes -p <profile> insights --days <1|7|30>`
- untuk aktivitas Kantor langsung, untuk setiap profil (maksimal empat sekaligus): `hermes -p <profile> logs agent -n 80 --since 3m` dan `hermes -p <profile> sessions list --limit 3`

Cara menjalankannya:
- Perintah dijalankan dengan `NO_COLOR=1` dan `COLUMNS` lebar supaya format teks biasa terurai andal.
- Status gateway bawaan diturunkan dari `hermes profile list`; tidak ada perintah gateway terpisah yang dijalankan.
- Setiap perintah dijalankan dengan `execFile` dan timeout proses 8 detik. Hasil endpoint-nya di-cache 10 detik (insights: 60 detik; log: 5 detik), dan permintaan bersamaan berbagi satu pembacaan yang sedang berjalan. Konkurensi CLI dibatasi (semaphore) karena host 2-CPU mudah mengalami CPU starvation.
- Input dari peramban tidak pernah mencapai perintah shell.

Hanya data ternormalisasi yang diekspos:
- profil/model, status gateway, versi OpenCode
- judul/status Kanban dan field cron yang dikenali
- judul/preview/aktif terakhir/ID sesi yang bisa diurai
- field tabel skill aktif yang dikenali
- nama platform pesan yang terkonfigurasi dengan status generik configured/connected, dan jumlah sesi aktif berupa bilangan bulat saat aman dikenali

Baris log adalah satu-satunya pengecualian yang disengaja terhadap "tanpa output mentah". Baris dikembalikan setelah dua lapis penyamaran: penyamaran rahasia milik Hermes sendiri, lalu lapisan kedua oleh server (API key, bearer token, rahasia `key=value`, token bot). Jalur direktori home dipendekkan menjadi `~`, dan baris header `hermes logs` (yang memuat jalur) dibuang. Teks galat jalan terakhir cron tidak pernah dikembalikan, hanya ok/gagal.

Selain itu, output CLI mentah, detail proses, jalur, konfigurasi, kredensial, autentikasi, API key, berkas environment, detail penyedia, dan basis data sesi tidak pernah dibaca atau dikembalikan. Sumber yang gagal ditampilkan sebagai `Tidak Tersedia`; satu field yang tidak diketahui ditampilkan sebagai `Tidak Diketahui`.

`/api/tasks`, `/api/calendar`, `/api/activity` dan `/api/knowledge` masing-masing mengembalikan status ketersediaan sumber dan waktu penyegaran:
- Papan Tugas hanya-baca dan tidak mengekspos mutasi.
- Kalender hanya berisi cron, jadi memang tidak menyertakan agenda umum.
- Aktivitas terbatas pada metadata daftar sesi dan tidak menyintesis peristiwa.
- Pengetahuan adalah katalog skill aktif yang dikenali dari tabel Rich milik Hermes.

Hasil sumber yang kosong tetap tersedia dan menampilkan keadaan kosong yang jujur; output yang tidak bisa diurai dan kegagalan perintah ditampilkan sebagai `Tidak Tersedia`. Aksi tulis Hermes sengaja tidak diimplementasikan. Satu-satunya hal yang pernah ditulis Ruang adalah berkas kode akses dan kunci profil opsionalnya (lihat *Kode akses* dan *Kunci profil*).

## Kantor

`/api/office` adalah komposisi hanya-baca dari pembacaan runtime, Kanban, dan aktivitas yang sudah di-cache. Isinya satu stasiun per agen (setiap profil Hermes, plus OpenCode kalau terpasang), dalam urutan yang diberikan `hermes profile list`. Mejanya meja bersama: satu per agen dan tidak ada yang bernama. Warna karakter diturunkan dari nama agen, jadi sama di setiap perangkat. Tampilan 2D menata Ruang Kerja (meja dan meja rapat) dan Ruang Santai untuk jumlah agen berapa pun hanya dengan CSS; tidak ada aset gambar atau seni yang dipakai.

Status kantor adalah salah satu dari `Idle`, `Working`, `Reviewing`, `Collaborating`, atau `Unknown` (`Offline` disediakan tapi tidak diproduksi). Prioritasnya:
1. Overlay status eksplisit internal yang segar dan belum kedaluwarsa bisa menyatakan `Working`, `Reviewing`, atau `Collaborating`.
2. Aktivitas langsung (di bawah), dilabeli dengan tugas Kanban running/review agen itu kalau ada.
3. Tugas Kanban segar yang secara eksplisit ditugaskan ke agen memetakan `running` ke `Working` dan `review` ke `Reviewing`.
4. Sesi aktif segar yang diatribusikan ke aktor memetakan ke `Collaborating`.
5. Kalau tidak ada, kebijakan santai terkelola berlaku.

Gateway yang berhenti tidak membuat agen luring: itu hanya berarti agen tidak mendengarkan di platform pesan, dan banyak agen dipakai dari CLI tanpa itu. Ini ditampilkan di halaman Agen dan pada label santai (`On a break · gateway stopped`).

Santai Terkelola adalah kebijakan penempatan server yang transparan, bukan kehadiran yang dilaporkan agen. Ia hanya berlaku kalau semua ini terpenuhi:
- pembacaan runtime, Kanban, dan aktivitas yang segar tersedia
- tidak ada overlay eksplisit yang segar
- Kanban tidak punya tugas running/review yang diatribusikan ke agen
- aktivitas tidak punya sesi aktif yang diatribusikan ke agen

Kalau terpenuhi, stasiun ditempatkan di Ruang Santai dan dilabeli `Santai · penempatan terkelola`. Input wajib yang tidak tersedia atau basi membuat stasiun tetap `Unknown`. Gateway `Running`, sesi generik, tugas Kanban tanpa penanggung jawab, dan ketersediaan versi OpenCode tidak bisa sendiri menciptakan status aktif; ketersediaan versi OpenCode secara eksplisit bukan sinyal status.

Tugas saat ini dan aktivitas terbaru memerlukan atribusi aktor. Kantor hanya menampilkan tugas Kanban saat penanggung jawab eksplisitnya adalah nama profil agen (atau `opencode`). Metadata daftar sesi Hermes saat ini tidak punya atribusi aktor, jadi panel Aktivitas melabelinya sebagai metadata sesi tanpa atribusi dan tidak pernah ditugaskan ke stasiun. Sumber tugas atau aktivitas yang gagal tetap mempertahankan makna `Tidak Tersedia`: itu ketersediaan sumber, bukan status kerja kantor. Memilih stasiun membuka dialog detail di dalam halaman yang bisa diakses lewat keyboard, berisi ruangan, asal-usul, dan kesegaran sumber.

Penempatan status divisualisasikan tanpa mengarang pekerjaan:
- `Working` dan `Reviewing` di meja; `Collaborating` di meja rapat (sebanyak tempat yang dibutuhkan).
- `Idle` di Ruang Santai (di 3D, berkeliling kantor).
- `Unknown` ditampilkan di meja dengan kehadiran netral yang dilabeli.

Ringkasan kru menghitung agen, pekerjaan aktif (`Working`/`Reviewing`/`Collaborating`), santai terkelola, dan tidak diketahui secara terpisah. Kesehatan gateway (berapa profil yang melaporkan gateway-nya `Running`) ditampilkan sebagai metrik terpisah. Saat satu stasiun punya beberapa tugas Kanban, yang `running` menang, lalu `review`, lalu tugas terbuka pertama.

`/api/channels` adalah snapshot aman terpisah yang hanya bersumber dari bagian Messaging Platforms dan jumlah sesi aktif `hermes status --all`; ia tidak pernah mengekspos platform yang belum terkonfigurasi atau isi status lainnya. Kantor tidak memperkenalkan endpoint tulis, input shell, atau perintah di luar allowlist tetap.

## Aktivitas langsung di Kantor

Setiap profil Hermes menulis seluruh pekerjaannya ke `agent.log`-nya sendiri: balasan pesan (gateway), jalan cron, panggilan alat, dan loop agen. Untuk setiap profil, server membaca 3 menit terakhir log itu dan sesi terbaru profil tersebut (maksimal empat profil sekaligus, di-cache 15 detik):

- Baris pesan gateway bersama baris loop agen atau alat, atau sesi yang aktif dalam 3 menit terakhir, menjadi `Collaborating` ("Membalas chat", di meja rapat).
- `cron.*` menjadi `Working` ("Menjalankan tugas terjadwal"); `tools.*` menjadi `Working` ("Memakai alat"); `agent`/`run_agent` menjadi `Working` ("Mengerjakan permintaan").
- OpenCode `Working` saat baris log agen yang baru menunjukkan ia sedang digerakkan.

Derau polling gateway dan baris housekeeping CLI diabaikan.

## Folder

Setiap agen mengarah ke foldernya sendiri:

| Agen | Folder |
|---|---|
| `default` | `<hermes root>/profiles/default`; hanya kalau folder itu tidak ada (tata letak Hermes standar), root Hermes itu sendiri |
| setiap profil Hermes lainnya | `<hermes root>/profiles/<name>` |
| OpenCode (hanya terdaftar kalau foldernya ada) | `~/.opencode`, lalu `~/.config/opencode` (`RUANG_OPENCODE_DIR` menimpanya) |

Root Hermes mengikuti aturan Hermes sendiri (`HERMES_HOME`, bawaan `~/.hermes`); `RUANG_HERMES_ROOT` menimpanya.
- Agen non-`default` yang mengarah ke root Hermes, atau ke folder yang sudah dimiliki agen lain, ditampilkan sebagai tidak tersedia beserta alasannya, bukan dibuka.
- Saat folder satu agen memuat folder agen lain (root standar memuat `profiles/`), sub-folder itu disembunyikan dan tidak bisa dibaca lewat agen luar.
- Kartu dan breadcrumb menampilkan jalur sebenarnya.

`/api/folders` mendaftar agen; `/api/folders/<agent>/list?path=` dan `/api/folders/<agent>/file?path=` menelusuri satu folder. Aturan keamanannya:
- Setiap jalur diresolusi (termasuk symlink) dan harus tetap di dalam folder agen itu.
- Instalasi `hermes-agent`, `.git`, virtualenv, dan cache disembunyikan.
- Berkas kredensial dan basis data (`.env*`, `auth.json`, kunci dan sertifikat, nama yang memuat token/secret/password/credential, berkas `*.db`/SQLite) didaftar tapi tidak pernah dibaca.
- Pratinjau teks dibatasi 256 KB dan melewati penyamaran rahasia yang sama seperti log. Berkas biner tidak dipratinjau.

**Mengatasi "Folder ini tidak dapat dibaca".** Ruang membaca folder sebagai pengguna yang menjalankannya. Kalau folder profil milik pengguna lain atau bermode `700` (misalnya dibuat oleh gateway yang dijalankan dengan `sudo`/systemd sebagai root), kartunya menampilkan `No read permission for <user>` dan membukanya menjelaskan pengguna mana yang ditolak. Periksa dengan `ls -ld ~/.hermes/profiles/<name>`. Perbaiki dengan mengembalikan folder ke pengguna sendiri (`sudo chown -R $USER:$USER ~/.hermes/profiles/<name>`) atau memberi akses baca (`sudo setfacl -R -m u:$USER:rX ~/.hermes/profiles/<name>`).

## Bahasa antarmuka

Seluruh label, judul halaman, pesan kosong, dan pesan galat sudah berbahasa Indonesia. Yang sengaja tetap Inggris:

- **Slug URL dan id halaman** (`#/task-board`, `#/knowledge`) — supaya tautan lama dan bookmark tetap berfungsi. Nama halaman di menu ditampilkan lewat peta label terpisah.
- **Id internal dan kontrak API** — `OfficeRoom` (`Workspace`/`Lounge`), `OfficeState` (`Idle`/`Working`/`Reviewing`/`Collaborating`/`Offline`/`Unknown`), `GatewayState` (`Running`/`Stopped`/`Unknown`), dan status Kanban. Semuanya dipetakan ke label Indonesia di lapisan tampilan (`src/format.ts`), jadi payload API dan tes server tetap stabil.
- **Nama perintah, perangkat, dan platform** — `hermes`, `opencode`, `kanban`, `cron`, Telegram, Discord, Slack, dan sejenisnya adalah nama diri.
- **Beberapa string yang dikirim server apa adanya** — misalnya `On a break · gateway stopped`, `🔒 Private task`, `🔒 Private job`, `No read permission for <user>`, dan provenance teknis seperti `OpenCode version availability is not a state signal`. UI menerjemahkan sebagian besar yang lain; sisa ini masih Inggris dan belum masuk cakupan terjemahan.

Peta label tinggal di `src/format.ts` (status kerja, ruangan, peran agen, status tugas), `src/routes.ts` (nama halaman), dan `src/usage.ts` (label jenis pekerjaan).
