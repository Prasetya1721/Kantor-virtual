# Divisi Engineering: Struktur Peran & Pedoman Delegasi

Dokumen ini mengatur struktur peran dan arsitektur kerja **Divisi Engineering** di dalam AI Team Kantor Virtual, dipimpin oleh **Lead Engineer** dan ditenagai oleh **OpenCode**.

---

## 1. Prinsip Efisiensi Sumber Daya (2-Core CPU Host)

Host infrastruktur beroperasi pada lingkungan **2-Core CPU**. Menjalankan 6 atau lebih *daemon/gateway* latar belakang yang terus melakukan polling akan memicu *CPU starvation*, memperlambat antarmuka dan menimbulkan *timeout*.

Oleh karena itu, seluruh peran dalam Divisi Engineering diimplementasikan dengan model **On-Demand Sub-Agent / Task-Driven Delegation**:
1. **Lead Engineer** bertindak sebagai arsitek teknis, perencana, dan koordinator utama.
2. **Sub-peran spesialis** diaktifkan hanya saat ada tiket tugas terkait (Kanban) atau giliran percakapan (*turn-based invocation*).
3. **OpenCode** mengeksekusi kode, pengujian, dan refaktorisasi pada tingkat repositori secara deterministik.
4. **Cyber Security** melakukan pemindaian statis dan validasi keamanan sebelum kode masuk ke tahap persetujuan.

---

## 2. Matriks Peran Spesialis

### A. Peran Utama (Core Roles)

#### 1. Front-End Developer
* **Fokus:** Antarmuka Pengguna (UI), State Management, Responsive Design.
* **Tanggung Jawab:**
  * Membangun komponen UI modern berbasis React dan Vite.
  * Menghubungkan komponen layar ke endpoint REST API dengan penanganan status jujur (*loading*, *empty*, *failed*).
  * Menjaga performa render dan konsistensi token tema.
* **Skill Rekomendasi:** `vibe-coding-pms`, `popular-web-designs`, `vibe-ui-ux-pms`.
* **Alias Penugasan Kanban:** `frontend`, `front-end`, `ui-dev`.

#### 2. Back-End Developer
* **Fokus:** REST API, Arsitektur Server, Basis Data PostgreSQL.
* **Tanggung Jawab:**
  * Merancang skema tabel relasional, indeks, dan integritas data (PostgreSQL).
  * Membangun endpoint Express/Node.js yang aman, tahan uji, dan berkinerja tinggi.
  * Menerapkan pembatasan konkurensi (FIFO gate) dan caching andal (*stale-while-revalidate*).
* **Skill Rekomendasi:** `vibe-coding-pms`, `node-inspect-debugger`, `systematic-debugging`.
* **Alias Penugasan Kanban:** `backend`, `back-end`, `api-dev`.

#### 3. Full-Stack Developer
* **Fokus:** Fitur End-to-End, Sinkronisasi Kontrak Tipe Data, Pipeline Build.
* **Tanggung Jawab:**
  * Menjaga alur data dari basis data hingga rendering antarmuka pengguna tanpa celah tipe.
  * Sinkronisasi kontrak TypeScript (`src/types.ts` dan modul server).
  * Menjalankan build produksi (`tsc -b && vite build`) serta memastikan nol error/warning.
* **Skill Rekomendasi:** `vibe-coding-pms`, `test-driven-development`, `project-handoff`.
* **Alias Penugasan Kanban:** `fullstack`, `full-stack`.

---

### B. Peran Pendukung & Tim (Supporting & Team Roles)

#### 4. UI/UX Designer
* **Fokus:** Desain Sistem Maritim, Tata Letak Pixel-Art Retro, Aksesibilitas.
* **Tanggung Jawab:**
  * Menjaga estetika visual retro pixel-art maritim yang fungsional (*surface-first, data-dense*).
  * Merancang hierarki informasi yang nyaman bagi staf operasional dan operator non-teknis.
  * Menguji keterbacaan kontras warna pada Mode Terang dan Mode Gelap.
* **Skill Rekomendasi:** `vibe-ui-ux-pms`, `claude-design`, `design-md`.
* **Alias Penugasan Kanban:** `ui/ux`, `designer`.

#### 5. Project Manager (PM)
* **Fokus:** WBS (Work Breakdown Structure), Triage Kanban, Alur Persetujuan.
* **Tanggung Jawab:**
  * Memecah sasaran besar menjadi tiket tugas kecil yang terukur dan berurutan.
  * Menetapkan prioritas tugas (P1 Kritis, P2 Penting, P3 Normal).
  * Mengawal gerbang persetujuan (*approval gates*) sebelum perubahan besar diterapkan.
* **Skill Rekomendasi:** `weekly-review-planning`, `document-to-action-items`.
* **Alias Penugasan Kanban:** `pm`, `project-manager`.

#### 6. QA (Quality Assurance) Tester
* **Fokus:** TDD (Test-Driven Development), Vitest Suites, Verifikasi AC.
* **Tanggung Jawab:**
  * Menulis dan menjalankan unit test serta pengujian integrasi (Vitest).
  * Memastikan kepatuhan terhadap Acceptance Criteria (AC).
  * Mencegah terjadinya regresi kode dan memverifikasi perbaikan bug.
* **Skill Rekomendasi:** `test-driven-development`, `dogfood`, `systematic-debugging`.
* **Alias Penugasan Kanban:** `qa`, `tester`, `qa-tester`.

---

## 3. Protokol Alur Kerja & Delegasi

```
           [Persetujuan Oppa]
                   │
                   ▼
             [Lead Agent]
         (Tujuan Bisnis & Arah)
                   │
                   ▼
            [Lead Engineer]
       (Arsitektur & WBS Tiket)
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
  [Peran Utama]       [Peran Pendukung]
  (FE / BE / FS)       (UI/UX / PM / QA)
       │                       │
       └───────────┬───────────┘
                   ▼
            [Cyber Security]
      (Audit Keamanan & Kepatuhan)
                   │
                   ▼
              [OpenCode]
       (Eksekusi Kode di Repo)
                   │
                   ▼
              [QA Tester]
          (Verifikasi Vitest)
```

1. **Rencana:** Lead Engineer menyusun spesifikasi dan membaginya ke peran yang tepat.
2. **Kajian Desain & Keamanan:** UI/UX menyelaraskan tata letak, Cyber Security memindai risiko.
3. **Eksekusi:** OpenCode menuliskan perubahan terkecil yang dibutuhkan.
4. **Verifikasi:** QA Tester memastikan 100% tes lulus sebelum diserahkan ke Oppa.
