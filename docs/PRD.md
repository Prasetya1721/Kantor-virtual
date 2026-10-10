# PRD: Hermes + OpenCode Mission Control

| | |
|---|---|
| **Versi** | 1.0 (Draf untuk persetujuan) |
| **Tanggal** | 30 September 2026 |
| **Pemilik Produk** | Prasetya |
| **Status** | Selesai (Fase 0 hingga 6 Terimplementasi & Terverifikasi) |
| **Lokalisasi** | Selesai — antarmuka berbahasa Indonesia (Fase 1–5, lihat §16.1) |
| **Dokumen acuan** | "Hermes + OpenCode Mission Control – Simple Copy-Paste Prompt Pack" |

> **Catatan penyusunan.** Dokumen acuan berbentuk paket prompt, bukan PRD. PRD ini mempertahankan seluruh maksud aslinya (struktur agent, modul, Visual Office, aturan "jangan mengarang data") lalu menambahkan hal yang belum ada: masalah dan metrik, persona, ID kebutuhan yang bisa diuji, model asal-usul data, aturan status, keamanan, arsitektur, risiko, dan fase rilis. Semua hal tentang API/data Hermes yang belum terverifikasi ditandai **[Verifikasi di Fase 0]** dan tidak boleh diasumsikan.

---

## 1. Ringkasan Eksekutif

Mission Control adalah antarmuka web tunggal untuk memahami dan mengelola **AI Team berbasis Hermes** tanpa perlu keahlian teknis. Pengguna cukup menentukan tujuan; **Lead Agent** mengoordinasikan pekerjaan, **Lead Engineer** menangani spesifikasi dan perencanaan teknis, dan **OpenCode** mengeksekusi pekerjaan coding di level repository.

Produk terdiri dari tujuh modul: **Dashboard, Agents, Task Board, Calendar, Activity, Memory/Knowledge,** dan **Visual Office 2D** bergaya pixel-art. Prinsip utamanya: **berguna dulu, menyenangkan kemudian**. Setiap angka dan status di layar harus berasal dari data nyata atau diberi label jelas.

## 2. Latar Belakang dan Masalah

| # | Masalah | Dampak |
|---|---|---|
| P1 | Pengguna non-teknis tidak tahu agent mana yang sedang bekerja, mengerjakan apa, atau macet. | Sulit percaya dan mengarahkan AI Team. |
| P2 | Informasi tersebar (log, chat, file) dan tidak punya satu tampilan ringkas. | Waktu terbuang untuk mencari status. |
| P3 | Dashboard agent sering menampilkan data simulasi atau tebakan agar terlihat "hidup". | Keputusan diambil dari data palsu. |
| P4 | Pekerjaan coding sulit dipantau oleh orang non-teknis. | Bug dan blocker baru diketahui terlambat. |

## 3. Tujuan, Non-Tujuan, dan Metrik

### 3.1 Tujuan
1. Memberi gambaran real-time yang jujur tentang kondisi AI Team dalam satu antarmuka.
2. Memungkinkan pengguna non-teknis mengelola tugas tanpa menyentuh detail teknis.
3. Menjaga integritas data: tidak ada nilai simulasi/tebakan yang tampil sebagai data nyata.
4. Menjaga Mission Control **terpisah dari inti Hermes** kecuali perubahan inti benar-benar tak terhindarkan.

### 3.2 Non-Tujuan (di luar MVP)
- Mengubah, menghentikan, atau mengendalikan agent Hermes dari Mission Control (MVP bersifat **read-mostly**).
- Membuat agent Hermes baru (termasuk Product Manager Agent) kecuali terbukti perlu.
- Ruang tambahan Visual Office (Meeting, Review, Research, Operations) selain Workspace dan Lounge.
- Multi-tenant, manajemen banyak pengguna, dan penagihan.
- Simulasi aktivitas untuk tampilan demo, kecuali diberi label jelas.

### 3.3 Metrik Keberhasilan
Angka berikut adalah **usulan**; nilai final ditetapkan di Fase 0.

| Metrik | Target |
|---|---|
| Pengguna non-teknis dapat menjawab "siapa bekerja dan mengerjakan apa" | ≤ 10 detik, tanpa bantuan |
| Nilai/status di layar yang menampilkan sumber data | 100% |
| Nilai simulasi/placeholder tampil sebagai data nyata | 0 |
| Kesesuaian status agent dengan kondisi sebenarnya (uji 20 sampel manual) | ≥ 90% |
| Waktu muat Dashboard | ≤ 2 detik pada data normal |
| Keterlambatan pembaruan status (sejak sinyal berubah) | ≤ 15 detik |
| Defect **CRITICAL** terbuka saat rilis MVP | 0 |

## 4. Pengguna dan Skenario

**Pengguna utama: Pemilik/Operator non-teknis.** Menentukan tujuan bisnis, tidak paham path, framework, build, atau API. Butuh ringkasan cepat dan bahasa sederhana.

**Pengguna sekunder: Pengelola teknis (opsional).** Ingin memeriksa sumber data, error, dan batasan.

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| S1 | Pemilik membuka Dashboard pagi hari. | Melihat jumlah agent Working/Idle/Offline/Unknown, tugas berjalan, dan kejadian terbaru. |
| S2 | Pemilik ingin tahu apa yang dikerjakan agent tertentu. | Klik agent → panel info: peran, status, tugas saat ini, aktivitas terbaru. |
| S3 | Tugas gagal atau macet. | Muncul di Task Board (Blocked/Failed) dan Activity dengan waktu dan sumbernya. |
| S4 | Data tertentu tidak tersedia. | UI menampilkan "Tidak tersedia", bukan angka tebakan. |
| S5 | Pemilik ingin tampilan visual. | Membuka Visual Office; agent aktif tampak di Workspace, yang menganggur di Lounge. |

## 5. Prinsip Produk

1. **Data nyata atau tidak sama sekali.** Jangan mengarang API, status agent, data sistem, atau integrasi.
2. **Tidak tahu itu jawaban yang sah.** Gunakan `Unknown` / `Tidak tersedia`, atau sembunyikan nilai dengan rapi.
3. **Pakai ulang kemampuan Hermes** yang sudah ada; jangan membangun ulang.
4. **Sederhana dulu.** Versi pertama minimal, arsitektur mudah dirawat.
5. **Fungsi sebelum dekorasi.** Pixel-art tidak boleh membuat informasi operasional lebih sulit dibaca.
6. **Perubahan kecil dan terverifikasi.** Jalankan, uji, baca error asli, perbaiki masalah terkecil dulu.

## 6. Struktur Kerja dan Peran

```
Pengguna
  → Lead Agent          (tujuan menyeluruh, koordinasi, tinjauan terhadap tujuan bisnis)
    → Lead Engineer     (spesifikasi produk & rekayasa, rencana, kriteria penerimaan, tinjauan hasil)
      → OpenCode        (eksekusi coding level repository: bangun, jalankan, uji, perbaiki)
```

| Peran | Bertanggung jawab atas | Tidak boleh |
|---|---|---|
| **Pengguna** | Menentukan tujuan; menyetujui rencana di setiap gerbang fase; keputusan tingkat produk. | Diminta pertanyaan teknis tanpa alasan kuat. |
| **Lead Agent** | Menjaga tujuan tercapai; menilai apakah hasil sesuai tujuan bisnis; melaporkan ke pengguna. | Melewati gerbang persetujuan. |
| **Lead Engineer** | Memahami kebutuhan; inspeksi lingkungan; menentukan MVP; inventarisasi sumber data; spesifikasi; kriteria penerimaan; menugaskan OpenCode bertahap; meninjau hasil; membuat tugas perbaikan. | Mulai coding sebelum rencana disetujui; mengarang data. |
| **OpenCode** | Implementasi kode, debugging, pengujian, perbaikan. | Menulis ulang kode yang sudah berjalan tanpa alasan; mengubah inti Hermes tanpa persetujuan. |

**Aturan serah-terima (handoff):**
- Lead Engineer memverifikasi OpenCode tersedia dan bisa dipakai sebelum implementasi. Jika belum, jelaskan kekurangan dan setup minimum.
- Jika OpenCode siap, lanjut tanpa bertanya hal teknis, kecuali ada keputusan produk yang nyata.
- Tidak ada Product Manager Agent terpisah di tahap ini. Rekomendasikan hanya bila proyek membesar signifikan.
- Berhenti dan minta keputusan pengguna hanya jika ada **blocker nyata**.

## 7. Ruang Lingkup MVP

| Modul | Prioritas | Ringkasan |
|---|---|---|
| Application shell dan navigasi | Must | Kerangka, menu, state loading/empty/error. |
| Dashboard | Must | Ringkasan tim, tugas, kejadian terbaru. |
| Agents | Must | Daftar agent, peran, status, tugas saat ini. |
| Task Board | Must | Papan tugas berstatus. |
| Activity | Should | Umpan kejadian nyata. |
| Calendar | Should | Pekerjaan terjadwal yang benar-benar ada. |
| Memory / Knowledge | Should | Penampil pengetahuan/memori Hermes (baca saja). |
| Visual Office 2D | Should (dibangun setelah MVP fungsional stabil) | Workspace + Lounge. |

## 8. Kebutuhan Fungsional

Kode kebutuhan: `FR-<MODUL>-<nomor>`. Prioritas: **M**ust / **S**hould / **C**ould.

### 8.1 Shell dan Navigasi
| ID | Kebutuhan | P |
|---|---|---|
| FR-SHELL-01 | Navigasi utama ke seluruh modul dengan penanda halaman aktif. | M |
| FR-SHELL-02 | Setiap halaman memiliki state **loading**, **kosong**, **error**, dan **data tidak tersedia**. | M |
| FR-SHELL-03 | Bahasa antarmuka sederhana dan mudah dipahami non-teknis. | M |
| FR-SHELL-04 | Indikator "terakhir diperbarui" per widget dan tombol muat ulang. | S |

### 8.2 Dashboard
| ID | Kebutuhan | P |
|---|---|---|
| FR-DASH-01 | Ringkasan jumlah agent per status (Working/Idle/Offline/Unknown) dari data nyata. | M |
| FR-DASH-02 | Ringkasan tugas per status dan tugas yang butuh perhatian (gagal/blocked). | M |
| FR-DASH-03 | Kejadian terbaru (dari modul Activity) bila tersedia. | S |
| FR-DASH-04 | Jika hitungan tidak dapat ditentukan andal, tampilkan "Tidak tersedia", bukan angka perkiraan. | M |

### 8.3 Agents
| ID | Kebutuhan | P |
|---|---|---|
| FR-AGT-01 | Daftar agent dengan nama, peran, status, dan tugas saat ini (jika ada). | M |
| FR-AGT-02 | Halaman/panel detail agent: aktivitas terbaru dan sumber status. | M |
| FR-AGT-03 | Daftar agent diambil dari Hermes, bukan ditulis manual. **[Verifikasi di Fase 0]** | M |

### 8.4 Task Board
| ID | Kebutuhan | P |
|---|---|---|
| FR-TASK-01 | Kolom status: Backlog, Sedang Dikerjakan, Review, Selesai, Blocked/Gagal. | M |
| FR-TASK-02 | Kartu tugas menampilkan judul, agent penanggung jawab, waktu, dan sumber. | M |
| FR-TASK-03 | Bila Hermes tidak menyediakan data tugas, tugas dikelola Mission Control dan **diberi label "Dikelola Mission Control"**. **[Keputusan di Fase 0]** | M |

### 8.5 Calendar
| ID | Kebutuhan | P |
|---|---|---|
| FR-CAL-01 | Menampilkan hanya pekerjaan terjadwal yang benar-benar terdaftar (mis. cron/jadwal Hermes). **[Verifikasi di Fase 0]** | S |
| FR-CAL-02 | Jika tidak ada jadwal atau sumber tak tersedia, tampilkan state kosong yang jelas. | S |

### 8.6 Activity
| ID | Kebutuhan | P |
|---|---|---|
| FR-ACT-01 | Umpan kejadian: agent mulai bekerja, tugas selesai/gagal, review diminta, status berubah, channel terhubung/terputus. | S |
| FR-ACT-02 | Setiap kejadian memiliki waktu, pelaku, dan sumber. | S |
| FR-ACT-03 | **Dilarang** membuat kejadian palsu agar antarmuka tampak sibuk. | M |

### 8.7 Memory / Knowledge
| ID | Kebutuhan | P |
|---|---|---|
| FR-MEM-01 | Menampilkan dan mencari pengetahuan/memori yang benar-benar dimiliki Hermes (**hanya baca** di MVP). | S |
| FR-MEM-02 | Menampilkan sumber dan waktu pembaruan tiap entri. | S |
| FR-MEM-03 | Konten yang berpotensi rahasia disamarkan (lihat NFR-SEC). | M |

### 8.8 Visual Office 2D

**Tampilan.** Ruang retro pixel-art di tengah, dikelilingi UI Mission Control gelap: tampilan ruangan besar, navigasi ruangan, kehadiran agent, ringkasan Working/Idle/Offline, panel Live Activity (opsional), dan status channel terhubung (opsional). Acuan visual dipakai sebagai inspirasi, **tidak disalin persis**.

| ID | Kebutuhan | P |
|---|---|---|
| FR-VO-01 | Ruang **Workspace**: meja, komputer, kursi, jendela, pintu, tanaman, rak. Agent aktif tampil di/dekat meja kerjanya. | M |
| FR-VO-02 | Ruang **Lounge**: sofa, kursi, layar/TV, area istirahat, tanaman. Agent tidak aktif tampil di sini. | M |
| FR-VO-03 | Navigasi antar ruangan (minimal Workspace dan Lounge); arsitektur mudah menambah ruangan baru. | M |
| FR-VO-04 | Setiap agent memiliki avatar pixel, nama, peran, status, ruangan, tugas saat ini, dan aktivitas terbaru (jika tersedia). | M |
| FR-VO-05 | Klik agent membuka panel info kecil. | M |
| FR-VO-06 | Ringkasan kru (Working/Idle/Offline) memakai hitungan nyata; jika tidak andal, tidak ditampilkan. | M |
| FR-VO-07 | Panel Live Activity tampil **hanya** jika ada data aktivitas andal. | S |
| FR-VO-08 | Status channel (mis. Telegram: nama, status koneksi, jumlah sesi aktif) tampil hanya jika Hermes menyediakannya secara andal; jika tidak, sembunyikan atau "Tidak tersedia". | C |

## 9. Aturan Status Agent (Perbaikan Utama)

Dokumen acuan mendefinisikan enam status tanpa aturan konflik dan kedaluwarsa. PRD ini menambahkannya.

### 9.1 Definisi dan pemetaan ruangan

| Status | Arti | Ruangan default |
|---|---|---|
| **Working** | Sinyal andal menunjukkan agent sedang mengeksekusi tugas. | Workspace |
| **Reviewing** | Agent sedang meninjau hasil (mis. Lead Engineer meninjau OpenCode). | Workspace / area review |
| **Collaborating** | Agent bekerja bersama agent lain pada tugas yang sama. | Workspace / area kolaborasi |
| **Idle** | Agent aktif tetapi tidak mengeksekusi tugas. | Lounge |
| **Offline** | Ada sinyal eksplisit bahwa agent tidak berjalan. | Diredupkan / area offline terpisah (pilih yang paling jelas saat desain) |
| **Unknown** | Tidak ada sinyal andal. **Jangan menebak.** | Lokasi netral dengan penanda "?" |

### 9.2 Aturan tambahan
1. **Kedaluwarsa:** jika sinyal terakhir lebih lama dari ambang T (nilai ditetapkan di Fase 0), status berubah menjadi **Unknown**, bukan Idle.
2. **Prioritas saat sinyal bertentangan:** sinyal eksplisit dari Hermes > status yang dikelola Mission Control > turunan dari aktivitas. Bila masih bertentangan → Unknown.
3. **Setiap status wajib punya sumber** yang dapat ditampilkan (lihat Bagian 10).
4. Agent **tidak boleh** tampil aktif tanpa data pendukung. Simulasi hanya boleh jika diberi label **"SIMULASI"** yang jelas dan dinonaktifkan secara default.
5. Lead Engineer boleh mengusulkan pemetaan yang lebih baik berdasarkan data aktual yang ditemukan di Fase 0.

## 10. Model Data dan Asal-usul (Provenance)

Setiap nilai penting di UI membawa label asal-usul, terlihat lewat tooltip/ikon kecil.

| Label | Arti | Boleh tampil sebagai "data nyata"? |
|---|---|---|
| **REAL** | Diambil langsung dari Hermes atau sistem. | Ya |
| **DERIVED** | Dihitung dari data REAL dengan rumus terdokumentasi. | Ya (rumus tercatat) |
| **MANUAL** | Dimasukkan pengguna di Mission Control. | Ya, dengan label "Manual" |
| **SIMULATED** | Data demo. | **Tidak**; wajib berlabel "Simulasi" |
| **UNAVAILABLE** | Tidak dapat ditentukan andal. | Tampil sebagai "Tidak tersedia/Unknown" |

**Entitas inti (usulan, disesuaikan di Fase 0):**

| Entitas | Atribut utama |
|---|---|
| Agent | id, nama, peran, avatar, status, sumber_status, ruangan, tugas_saat_ini, sinyal_terakhir |
| Task | id, judul, status, agent, dibuat, diperbarui, sumber |
| Event (Activity) | id, waktu, jenis, agent, tugas, sumber |
| ScheduledJob | id, nama, jadwal, agent, sumber |
| MemoryItem | id, judul, ringkasan, sumber, diperbarui |
| Channel | nama, status_koneksi, jumlah_sesi (opsional) |

**Inventaris data (dihasilkan Lead Engineer di Fase 0):** untuk setiap entitas, catat apakah datanya *tersedia dari Hermes*, *perlu implementasi khusus*, atau *tidak tersedia*.

## 11. Kebutuhan Non-Fungsional

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-SEC-01 | Keamanan | Akses ke Hermes **hanya baca** secara default; aksi tulis hanya pada state milik Mission Control. |
| NFR-SEC-02 | Keamanan | Mission Control berjalan lokal/terbatas secara default dan memerlukan autentikasi sederhana bila dapat diakses jaringan. |
| NFR-SEC-03 | Keamanan | Kredensial, token, dan rahasia **tidak pernah** ditampilkan; disamarkan di Activity dan Memory. |
| NFR-SEC-04 | Keamanan | Tinjauan risiko keamanan wajib di Fase Review. |
| NFR-PERF-01 | Kinerja | Dashboard termuat ≤ 2 detik pada data normal (usulan). |
| NFR-PERF-02 | Kinerja | Pembaruan status ≤ 15 detik setelah sinyal berubah (usulan). |
| NFR-REL-01 | Keandalan | Kegagalan satu sumber data tidak merusak halaman lain; tampilkan "Tidak tersedia". |
| NFR-MNT-01 | Kemudahan rawat | Kode Mission Control terpisah dari inti Hermes; adapter data terisolasi sehingga sumber bisa diganti. |
| NFR-MNT-02 | Kemudahan rawat | Ruangan Visual Office bersifat data-driven agar mudah ditambah. |
| NFR-UX-01 | Pengalaman | Nama dan peran agent terbaca jelas; pixel-art tidak menutupi informasi. |
| NFR-A11Y-01 | Aksesibilitas | Status tidak hanya dibedakan lewat warna (sertakan ikon/teks). |

## 12. Arsitektur Tingkat Tinggi (Usulan)

```
┌────────────────────────── Mission Control (aplikasi terpisah) ─────────────────────────┐
│  UI: Dashboard | Agents | Task Board | Calendar | Activity | Memory | Visual Office   │
│                                   ▲                                                    │
│                         Lapisan layanan + aturan status                                │
│                                   ▲                                                    │
│                  Adapter data (baca saja) + penyimpanan state Mission Control          │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │  sumber nyata (diverifikasi di Fase 0)
                              ┌─────▼─────┐
                              │   Hermes  │  (tidak diubah kecuali mutlak perlu)
                              └───────────┘
```

Tumpukan teknologi **tidak ditetapkan di PRD**; Lead Engineer memilihnya setelah inspeksi proyek dan repository, dengan prinsip sederhana dan mudah dirawat.

## 13. Kriteria Penerimaan

### 13.1 Global
- **AC-G1:** Setiap nilai/status yang tampil memiliki sumber yang dapat ditelusuri (REAL/DERIVED/MANUAL) atau ditandai Unknown/Tidak tersedia.
- **AC-G2:** Tidak ada data simulasi, tebakan, atau placeholder yang tampil sebagai data nyata.
- **AC-G3:** Aplikasi berjalan tanpa error di konsol/log pada alur utama.
- **AC-G4:** Pengujian relevan (bila tersedia) lulus; hasil dilaporkan apa adanya.

### 13.2 Per modul (contoh format Given/When/Then)
- **Dashboard.** *Given* Hermes melaporkan 3 agent aktif dan 2 tidak aktif, *when* Dashboard dibuka, *then* hitungan Working=3 dan Idle=2 sesuai sumber. *Given* sumber tak dapat dijangkau, *then* hitungan menampilkan "Tidak tersedia".
- **Agents.** *Given* agent tanpa sinyal lebih lama dari T, *when* daftar dibuka, *then* statusnya Unknown, bukan Idle.
- **Task Board.** *Given* tugas gagal, *then* muncul di kolom Blocked/Gagal dengan waktu dan sumber.
- **Activity.** *Given* tidak ada data aktivitas andal, *then* panel menampilkan state kosong, bukan kejadian karangan.
- **Visual Office.** *Given* agent berstatus Working, *then* ia tampil di Workspace; *given* Idle, *then* di Lounge; *given* Unknown, *then* tampil netral dengan penanda jelas; klik agent membuka panel info yang benar.

## 14. Rencana Rilis dan Gerbang Persetujuan

Setiap fase berakhir dengan **gerbang**: pengguna menyetujui sebelum lanjut.

| Fase | Isi | Keluaran | Gerbang |
|---|---|---|---|
| **0. Discovery & Rencana** (tanpa coding) | Inspeksi lingkungan Hermes; verifikasi OpenCode; inventaris data & integrasi; tetapkan ambang T, sumber tugas, dan MVP final. | Laporan 9 bagian (tujuan produk, pengguna utama, fitur MVP, data yang dibutuhkan, yang disediakan Hermes, yang perlu implementasi khusus, kriteria penerimaan, keterbatasan, urutan build) + status "siap membangun / belum". | Persetujuan rencana |
| **1. Fondasi** | Shell & navigasi, Dashboard, Agents. | Fitur berjalan + laporan. | Persetujuan |
| **2. Operasional** | Task Board, Activity. | idem | Persetujuan |
| **3. Pengetahuan** | Calendar, Memory/Knowledge. | idem | Persetujuan |
| **4. Visual Office** | Ruang, agent, pemetaan status, panel info, ringkasan, Live Activity & channel (jika data ada). | idem | Persetujuan |
| **5. Review & Perbaikan** | Tinjauan menyeluruh tanpa fitur baru. | Laporan review (Bagian 15). | Status akhir |
| **6. Kustomisasi Bisnis** | Sesuaikan modul/ruang dengan operasi bisnis pengguna. | Rekomendasi (Bagian 16). | Persetujuan sebelum OpenCode dipakai |

**Urutan build Visual Office:** room shell → Workspace → Lounge → render agent → pemetaan status-ke-ruangan → panel info → ringkasan status → Live Activity → status channel.

**Setelah tiap perubahan bermakna:** jalankan aplikasi, verifikasi perilaku, baca error asli, perbaiki masalah terkecil dulu, pastikan perbaikan tidak merusak fitur lain. Jangan menulis ulang kode yang sudah berfungsi.

**Laporan akhir setiap build:** apa yang dibangun; apa yang berfungsi; yang sebagian berfungsi; data yang nyata; data yang tidak tersedia; keterbatasan; error/blocker; langkah berikutnya yang disarankan.

## 15. Strategi Review dan Pengujian

**Area tinjauan:** Dashboard, Agents, Task Board, Calendar, Activity, Memory/Knowledge, Visual Office (Workspace, Lounge, pemetaan status, pergantian ruangan, panel agent, live activity, status channel), navigasi, loading/empty state, data tidak tersedia, keandalan, risiko keamanan.

**Tinjauan integritas data:** untuk setiap nilai penting, verifikasi asalnya: hitungan Working/Idle/Offline, status agent, tugas saat ini, penempatan ruangan, kejadian aktivitas, pekerjaan terjadwal, status channel, sumber memori.

**Pemeriksaan khusus Visual Office:** agent aktif ada di area kerja; agent idle di lounge; penanganan Offline konsisten; Unknown jelas; tidak ada agent tampak aktif tanpa data; transisi ruangan mudah dipahami; nama/peran terbaca; pixel-art tidak menyulitkan pembacaan info.

**Format laporan review:**
- **CRITICAL** – harus diperbaiki.
- **IMPORTANT** – sebaiknya diperbaiki.
- **BERJALAN BAIK** – terverifikasi andal.
- **KETERBATASAN DATA** – yang belum dapat ditentukan andal.
- **STATUS VISUAL OFFICE** – kualitas pemetaan status, perilaku ruangan, kehadiran agent, live activity, status channel.
- **PERBAIKAN OPSIONAL**
- **STATUS AKHIR:** *Siap Dipakai* / *Siap dengan Keterbatasan* / *Perlu Kerja Lanjutan*.

**Proses perbaikan:** identifikasi akar masalah → Lead Engineer menentukan perbaikan terkecil → OpenCode menerapkan → jalankan aplikasi → jalankan uji relevan → verifikasi masalah awal → periksa regresi.

## 16. Kustomisasi untuk Bisnis (Fase 6)

Lead Agent dan Lead Engineer meninjau sistem saat ini, lalu bertanya **seminimal mungkin** (tanpa pertanyaan teknis): jenis bisnis, fungsi bisnis terpenting, pekerjaan berulang yang ingin dibantu AI Team, informasi yang perlu sering dilihat, tindakan yang ingin dikelola dari Mission Control, agent/peran terpenting, dan perlu-tidaknya ruangan tambahan.

**Modul opsional** (rekomendasikan hanya yang jelas menyelesaikan masalah bisnis):

| Fungsi | Contoh modul |
|---|---|
| Pemasaran | Perencanaan konten, antrean persetujuan, pemantauan kampanye, status publikasi |
| Penjualan | Pipeline lead, antrean tindak lanjut, status peluang, aktivitas penjualan |
| Keuangan | Laporan, ringkasan arus kas, tinjauan transaksi, tugas keuangan terjadwal |
| Operasional | Pemantauan SOP, checklist, pemantauan tugas, operasi berulang |

**Ruangan tambahan** hanya jika ada manfaat operasional jelas; tiap usulan menjelaskan: agent yang berada di sana, status yang memindahkan mereka ke sana, informasi yang dipahami pengguna, dan masalah bisnis yang diselesaikan.

**Prioritas:** MUST HAVE · SHOULD HAVE · LATER · DO NOT BUILD.

**Keluaran wajib:** 3 perbaikan teratas; masalah bisnis yang diselesaikan; data yang dibutuhkan; integrasi yang dibutuhkan; dampak ke Mission Control; dampak ke Visual Office; estimasi kompleksitas (Rendah/Sedang/Tinggi); alasan dibangun sekarang atau tidak. **Jangan implementasi sebelum ada persetujuan.** Setelah disetujui: Lead Agent → Lead Engineer → OpenCode → Uji → Review.

## 16.1 Lokalisasi Antarmuka (Bahasa Indonesia)

**Tujuan.** Operator di BKI Pontianak dan perusahaan pelayaran membaca sistem ini setiap hari; seluruh label, judul halaman, pesan kosong, pesan galat, dan petunjuk harus berbahasa Indonesia. Istilah teknis yang tidak punya padanan lazim (`cron`, `gateway`, `Kanban`, `token`) tetap dipakai apa adanya.

**Aturan yang dipegang.**
1. **Slug URL dan id halaman tetap Inggris** (`#/task-board`, `#/knowledge`) supaya tautan lama dan bookmark tidak putus. Nama halaman di menu ditampilkan lewat peta label terpisah (`PAGE_LABELS_ID` di `src/routes.ts`).
2. **Id internal dan kontrak API tidak diubah.** `OfficeRoom` (`Workspace`/`Lounge`), `OfficeState` (`Idle`/`Working`/`Reviewing`/`Collaborating`/`Offline`/`Unknown`), `GatewayState` (`Running`/`Stopped`/`Unknown`), dan status Kanban tetap Inggris di payload. Pemetaan ke label Indonesia dilakukan di lapisan tampilan, sehingga tes server dan kontrak API stabil.
3. **Peta label terpusat.** `src/format.ts` (status kerja, ruangan, peran agen, status tugas), `src/routes.ts` (nama halaman), `src/usage.ts` (jenis pekerjaan). Satu istilah untuk satu konsep — tidak ada dua kata untuk hal yang sama.
4. **Tes yang mengunci string lama diperbarui di commit yang sama**, bukan dihapus.

**Cakupan per fase.**

| Fase | Cakupan | Hasil |
|---|---|---|
| 1 | Chrome bersama: `ui.tsx`, `office-state.ts`, `request-state.ts`, `access.ts`, `profile-lock.ts` | label `Memuat`, `Tidak Tersedia`, `Menghubungkan`, `Basi (segarkan gagal)`, tombol segarkan |
| 2 | Dashboard: label Indonesia + banner Antrean Persetujuan + widget OpenCode build | sudah ada sebelum lokalisasi menyeluruh |
| 3 | Pemulihan fitur lokal yang hilang saat rebase + terjemahan berkas kode akses | Specialized Roles, label dashboard, teks berkas unduhan |
| 4 | Halaman inti: Office, Agents, Task Board, Stats | HUD, tab panel, dialog detail, kolom papan, kartu agen, catatan banner engineering |
| 5 | Halaman sekunder: Calendar, Activity, Memory, Folders, Logs, Settings, Usage, Build, LockScreen, ProfileLock | termasuk 14 label aktivitas santai di `office3d-layout.ts` dan string operator di sisi server |

**Cara mengukur cakupan.** Skrip sekali jalan memindai `src/**/*.tsx|ts`: ambil JSX text node, prop user-facing (`title`/`label`/`placeholder`/`message`/`aria-label`), dan literal label; saring dengan penanda bahasa Indonesia untuk memisahkan yang sudah diterjemahkan, lalu buang kecocokan code-ish. Angkanya turun **457 → 326 → ~0** string UI Inggris di seluruh `src/`. Sisa yang memang dibiarkan Inggris: slug URL, id internal, nama platform dan alat, serta beberapa string yang dikirim server apa adanya (`On a break · gateway stopped`, `🔒 Private task`, `🔒 Private job`, `No read permission for <user>`, provenance teknis).

**Verifikasi.** Setiap fase diverifikasi dengan `tsc --noEmit`, `vitest run`, `eslint .`, dan `npm run build`, lalu dibaca langsung dari DOM peramban (bukan dari kode sumber) untuk memastikan string benar-benar terkirim ke browser. Bundle hasil build juga diperiksa dengan `grep` untuk membuktikan string baru ada dan string lama sudah hilang.

---

## 17. Risiko dan Mitigasi

| # | Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|---|
| R1 | Hermes tidak menyediakan data status/aktivitas yang andal. | Sedang | Tinggi | Fase 0 memetakan data nyata; fitur bergantung data disembunyikan atau berlabel "Tidak tersedia"; status dikelola Mission Control diberi label. |
| R2 | OpenCode belum siap/terkonfigurasi. | Sedang | Sedang | Verifikasi di Fase 0; jelaskan setup minimum. |
| R3 | Dorongan menampilkan UI "hidup" dengan data simulasi. | Tinggi | Tinggi | AC-G2, FR-ACT-03, label SIMULATED, review integritas data. |
| R4 | Perubahan pada inti Hermes menimbulkan regresi. | Rendah | Tinggi | Aplikasi terpisah, adapter baca-saja, perubahan inti butuh persetujuan. |
| R5 | Kebocoran rahasia lewat Activity/Memory. | Sedang | Tinggi | NFR-SEC-03, penyamaran otomatis, tinjauan keamanan. |
| R6 | Visual Office menyita waktu dan mengaburkan informasi. | Sedang | Sedang | Dibangun setelah MVP stabil; prinsip "berguna dulu, menyenangkan kemudian". |
| R7 | Ruang lingkup melebar (ruangan/agent tambahan). | Sedang | Sedang | Non-tujuan eksplisit; tambahan hanya lewat Fase 6 dengan persetujuan. |
| R8 | Kegagalan berulang membuat OpenCode menulis ulang kode berfungsi. | Sedang | Sedang | Aturan "perbaikan terkecil dulu"; tinjauan Lead Engineer. |

## 18. Pertanyaan Terbuka (Dijawab di Fase 0)

1. Data agent, tugas, aktivitas, jadwal, memori, dan channel apa yang **benar-benar** diekspos Hermes, dan lewat mekanisme apa?
2. Apakah tugas berasal dari Hermes atau dikelola Mission Control (FR-TASK-03)?
3. Berapa ambang kedaluwarsa sinyal T yang wajar?
4. Bagaimana perlakuan Offline: disembunyikan, diredupkan, atau area terpisah?
5. Di mana Mission Control dijalankan dan siapa yang boleh mengaksesnya (lokal saja atau jaringan)?
6. Apakah OpenCode sudah terpasang dan bisa mengakses repository target?
7. Apakah diperlukan aksi tulis dari Mission Control (mis. membuat tugas ke Hermes) setelah MVP?

## Lampiran A. Paket Prompt (Versi Diperbaiki, Bahasa Indonesia)

**Aturan umum (tempel di awal setiap prompt):**
> Jangan mengarang API, status agent, data sistem, atau integrasi. Gunakan data nyata bila tersedia; bila tidak, tampilkan "Unknown" atau "Tidak tersedia". Data simulasi harus berlabel jelas. Jangan mengubah inti Hermes tanpa persetujuan saya. Periksa kode yang ada sebelum mengubah; jangan menulis ulang kode yang sudah berfungsi. Jalankan aplikasi dan uji setelah perubahan bermakna; baca error asli; perbaiki masalah terkecil dulu. Jangan ajukan pertanyaan teknis kecuali ada keputusan produk yang benar-benar perlu saya ambil.

**Prompt 1: Rencanakan Mission Control (Fase 0, jangan coding)**
> Saya ingin membuat Mission Control untuk AI Team berbasis Hermes: Dashboard, Agents, Task Board, Calendar, Activity, Memory/Knowledge, dan Visual Office 2D. Struktur kerja: Saya → Lead Agent → Lead Engineer → OpenCode. Jangan mulai coding. Periksa lingkungan Hermes dan kemampuan yang tersedia, identifikasi data dan integrasi yang benar-benar ada, gunakan ulang kemampuan Hermes, dan pisahkan Mission Control dari inti Hermes. Jangan buat Product Manager Agent terpisah; Lead Engineer menangani spesifikasi produk dan rekayasa. Di akhir tampilkan: 1) Tujuan Produk 2) Pengguna Utama 3) Fitur MVP 4) Data yang Dibutuhkan 5) Yang Bisa Disediakan Hermes 6) Yang Perlu Implementasi Khusus 7) Kriteria Penerimaan 8) Keterbatasan Penting 9) Urutan Build yang Disarankan. Lalu katakan apakah kita siap membangun.

**Prompt 2: Bangun MVP (Fase 1–3)**
> Rencana sudah disetujui. Bangun MVP dengan alur Lead Agent → Lead Engineer → OpenCode → Build/Run/Test/Fix. Pastikan OpenCode tersedia dan bisa dipakai; jika belum, jelaskan setup minimum. Bangun bertahap: shell & navigasi → Dashboard → Agents → Task Board → Activity → Calendar → Memory/Knowledge. Verifikasi setiap fitur utama berfungsi sebelum lanjut. Lanjutkan sampai MVP berjalan atau ada blocker nyata yang butuh keputusan saya. Di akhir laporkan: yang dibangun, yang berfungsi, yang sebagian berfungsi, data yang nyata, data yang tidak tersedia, keterbatasan, error/blocker, dan langkah berikutnya.

**Prompt 3: Tambahkan Visual Office 2D (Fase 4)**
> MVP fungsional sudah berjalan. Tambahkan Visual Office 2D bergaya pixel-art retro dengan alur Lead Agent → Lead Engineer → OpenCode. Ruang wajib: Workspace (agent bekerja) dan Lounge (agent idle). Gunakan status Working, Reviewing, Collaborating, Idle, Offline, Unknown; status kedaluwarsa menjadi Unknown, bukan Idle. Jangan menampilkan agent aktif tanpa data pendukung. Setiap agent punya nama, peran, avatar, status, ruangan, tugas saat ini, dan aktivitas terbaru bila ada; klik agent membuka panel info. Tampilkan ringkasan kru, Live Activity, dan status channel **hanya** jika datanya andal. Sebelum coding, definisikan singkat: data status yang tersedia, pemetaan status-ke-ruangan, struktur Workspace/Lounge, perilaku interaksi, logika ringkasan, sumber Live Activity, dan keterbatasan. Bangun bertahap sesuai urutan build Visual Office. Di akhir tampilkan: ruangan, penempatan agent aktif/idle, cara tiap status ditentukan, data nyata vs tidak tersedia, interaksi, perilaku Live Activity dan channel, keterbatasan, dan perbaikan berikutnya.

**Prompt 4: Review dan perbaiki (Fase 5, tanpa fitur baru)**
> Tinjau seluruh Mission Control tanpa menambah fitur. Lead Agent menilai kesesuaian dengan tujuan bisnis; Lead Engineer melakukan tinjauan produk dan teknis; OpenCode dipakai untuk inspeksi repository, debugging, pengujian, dan perbaikan. Periksa semua modul, Visual Office, loading/empty state, data tidak tersedia, keandalan, dan risiko keamanan. Untuk setiap nilai penting, verifikasi asal datanya; jangan tampilkan data simulasi, tebakan, atau placeholder sebagai data nyata. Perbaiki dengan perubahan terkecil, lalu jalankan aplikasi dan uji ulang. Laporkan: CRITICAL, IMPORTANT, BERJALAN BAIK, KETERBATASAN DATA, STATUS VISUAL OFFICE, PERBAIKAN OPSIONAL, dan STATUS AKHIR (Siap Dipakai / Siap dengan Keterbatasan / Perlu Kerja Lanjutan).

**Prompt 5: Kustomisasi untuk bisnis saya (Fase 6, jangan implementasi dulu)**
> Sistem dasar sudah berjalan. Bantu sesuaikan dengan cara bisnis saya beroperasi. Alur: Lead Agent → Lead Engineer; OpenCode baru dipakai setelah saya menyetujui yang akan dibangun. Tinjau sistem saat ini, lalu ajukan pertanyaan seminimal mungkin (jenis bisnis, fungsi terpenting, pekerjaan berulang, informasi yang perlu sering dilihat, tindakan yang ingin dikelola, agent terpenting, kebutuhan ruangan tambahan). Rekomendasikan hanya modul dan ruangan yang jelas menyelesaikan masalah bisnis, dengan prioritas MUST HAVE / SHOULD HAVE / LATER / DO NOT BUILD. Keluarkan: 3 perbaikan teratas, masalah yang diselesaikan, data dan integrasi yang dibutuhkan, dampak ke Mission Control dan Visual Office, estimasi kompleksitas, serta alasan dibangun sekarang atau tidak. Jangan implementasi; tunggu persetujuan saya.
