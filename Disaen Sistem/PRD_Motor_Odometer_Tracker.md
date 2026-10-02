# PRD: Motor Odometer Tracker (ESP32 + BLE + Web)

| | |
|---|---|
| **Versi** | 0.1 (Draft) |
| **Tanggal** | 2 Oktober 2026 |
| **Status** | Draft untuk review |
| **Platform** | ESP32 (firmware), Web App (Web Bluetooth), Backend API |

---

## 1. Ringkasan

Motor Odometer Tracker adalah perangkat IoT berbasis ESP32 yang dipasang di motor untuk menghitung **total jarak tempuh** menggunakan GPS. Data jarak disinkronkan ke website melalui **BLE (Bluetooth Low Energy)** lewat HP pengguna. Website menggunakan data tersebut sebagai dasar **pengingat servis berkala** (ganti oli, filter udara, dan lainnya) dengan interval yang bisa diatur sendiri oleh pengguna.

## 2. Latar Belakang & Masalah

- Banyak pengendara lupa kapan terakhir ganti oli atau servis karena hanya mengandalkan ingatan atau catatan manual.
- Odometer bawaan motor tidak bisa diakses secara digital dan tidak punya fitur pengingat.
- Pengingat berbasis waktu (misal "tiap 2 bulan") kurang tepat karena intensitas pemakaian tiap orang berbeda. Pengingat berbasis **jarak tempuh** lebih akurat.

## 3. Tujuan & Non-Tujuan

### 3.1 Tujuan (Goals)

1. Menghitung jarak tempuh motor secara otomatis dan tahan mati listrik.
2. Menyinkronkan data ke website melalui BLE tanpa kabel dan tanpa modul SIM.
3. Memungkinkan pengguna mengatur item servis dan interval jaraknya sendiri.
4. Memberi tahu pengguna ketika servis hampir jatuh tempo atau sudah terlewat.

### 3.2 Non-Tujuan (Out of Scope untuk MVP)

- Pelacakan posisi motor real-time dari jarak jauh (anti-maling).
- Peta rute dan riwayat perjalanan detail.
- Dukungan iOS/Safari (lihat bagian Batasan).
- Koneksi WiFi atau modul SIM/GSM.
- Integrasi dengan ECU atau OBD motor.
- Multi-kendaraan dalam satu perangkat.

## 4. Target Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Pengendara harian** | Memakai motor untuk komuter, jarang mencatat servis | Diingatkan otomatis kapan ganti oli |
| **Hobiis / modifikator** | Suka otak-atik, ingin data sendiri | Interval servis fleksibel, data akurat |
| **Driver ojol / kurir** | Jarak tempuh harian tinggi | Servis tepat waktu agar motor tidak mogok |

## 5. User Stories

| ID | Sebagai... | Saya ingin... | Agar... |
|---|---|---|---|
| US-01 | Pengguna | Perangkat menghitung jarak otomatis saat motor jalan | Saya tidak perlu mencatat manual |
| US-02 | Pengguna | Menyambungkan HP ke perangkat lewat tombol di website | Data odometer masuk ke akun saya |
| US-03 | Pengguna | Menambah item servis (misal oli, rantai, busi) | Saya bisa memantau semua perawatan |
| US-04 | Pengguna | Mengatur interval km tiap item servis | Sesuai rekomendasi pabrikan atau kebiasaan saya |
| US-05 | Pengguna | Melihat sisa km menuju servis berikutnya | Saya bisa merencanakan waktu ke bengkel |
| US-06 | Pengguna | Menandai servis sudah dilakukan | Hitungan interval dimulai ulang dari odometer saat ini |
| US-07 | Pengguna | Mengatur nilai awal odometer | Sesuai dengan angka di speedometer motor saya |
| US-08 | Pengguna | Odometer tidak hilang saat aki dicopot atau mati | Datanya tetap valid |

## 6. Ruang Lingkup MVP

### 6.1 Hardware & Firmware

- Membaca data GPS dari NEO-6M dan menghitung jarak.
- Menyimpan odometer di memori non-volatil.
- Menyediakan layanan BLE (GATT server) untuk baca odometer dan baca/tulis konfigurasi.
- Indikator status sederhana via LED.

### 6.2 Web App

- Koneksi ke perangkat via Web Bluetooth.
- Dashboard: total odometer, status koneksi, status GPS.
- Manajemen item servis dan interval.
- Pengingat servis di dalam web (status: Aman, Segera, Terlewat).
- Riwayat servis.

### 6.3 Backend

- Autentikasi pengguna.
- Penyimpanan data odometer, item servis, dan riwayat servis.
- API untuk sinkronisasi dari web app.

## 7. Kebutuhan Fungsional

### 7.1 Firmware (ESP32)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FW-01 | Membaca NMEA dari NEO-6M via UART dan mem-parsing posisi, kecepatan, HDOP, jumlah satelit | P0 |
| FW-02 | Menghitung jarak antar titik GPS dengan rumus Haversine | P0 |
| FW-03 | Memfilter noise GPS (lihat bagian 9) | P0 |
| FW-04 | Menyimpan odometer ke NVS secara berkala (tiap ±500 m atau saat motor berhenti) | P0 |
| FW-05 | Menyediakan BLE GATT service dengan karakteristik odometer, status, dan konfigurasi | P0 |
| FW-06 | Mendukung set nilai awal odometer dari web | P0 |
| FW-07 | Tetap menghitung jarak walaupun tidak ada HP yang terhubung | P0 |
| FW-08 | Indikator LED: GPS belum fix, GPS fix, BLE terhubung | P1 |
| FW-09 | Mode deep sleep atau hemat daya saat motor mati (deteksi via tegangan atau gerakan) | P1 |
| FW-10 | Update firmware via OTA | P2 |

### 7.2 Web App

| ID | Kebutuhan | Prioritas |
|---|---|---|
| WEB-01 | Registrasi dan login pengguna | P0 |
| WEB-02 | Tombol "Hubungkan Perangkat" (Web Bluetooth) dan pairing | P0 |
| WEB-03 | Membaca dan menampilkan total odometer dari perangkat | P0 |
| WEB-04 | Sinkronisasi odometer ke backend setelah dibaca | P0 |
| WEB-05 | CRUD item servis (nama, interval km, km servis terakhir) | P0 |
| WEB-06 | Perhitungan sisa km dan status tiap item servis | P0 |
| WEB-07 | Tombol "Servis sudah dilakukan" untuk reset hitungan | P0 |
| WEB-08 | Template item servis bawaan (oli mesin, oli gardan, filter udara, busi, rantai/CVT, kampas rem) dengan interval default yang bisa diubah | P1 |
| WEB-09 | Riwayat servis (tanggal, km, catatan) | P1 |
| WEB-10 | Notifikasi browser/push saat servis mendekati jatuh tempo | P2 |
| WEB-11 | Ekspor data ke CSV | P2 |

### 7.3 Backend

| ID | Kebutuhan | Prioritas |
|---|---|---|
| BE-01 | API autentikasi (token berbasis JWT atau session) | P0 |
| BE-02 | API sinkronisasi odometer (idempotent, menolak nilai yang lebih kecil dari sebelumnya kecuali di-reset manual) | P0 |
| BE-03 | API CRUD item servis dan riwayat servis | P0 |
| BE-04 | Validasi dan sanitasi input | P0 |

## 8. Aturan Status Servis

Untuk setiap item servis:

```
sisa_km = (km_servis_terakhir + interval_km) - odometer_saat_ini
```

| Status | Kondisi |
|---|---|
| **Aman** | sisa_km > 20% dari interval |
| **Segera** | 0 < sisa_km ≤ 20% dari interval |
| **Terlewat** | sisa_km ≤ 0 |

Ambang 20% dibuat konfigurasi (default 20%).

## 9. Spesifikasi Teknis

### 9.1 Arsitektur Sistem

```
┌─────────────────────────┐        BLE         ┌──────────────────┐       HTTPS       ┌───────────┐
│ ESP32 + GPS NEO-6M      │ ◄────────────────► │ HP (Chrome       │ ◄───────────────► │ Backend   │
│ - Hitung jarak          │   (Web Bluetooth)  │ Android) + Web   │                   │ + Database│
│ - Simpan odometer (NVS) │                    │ App              │                   │           │
└─────────────────────────┘                    └──────────────────┘                   └───────────┘
```

Alur sinkronisasi:

1. Motor berjalan, ESP32 menghitung dan menyimpan odometer secara lokal.
2. Pengguna membuka web app di dekat motor dan menekan "Hubungkan".
3. Web app membaca odometer dari ESP32 via BLE.
4. Web app mengirim nilai ke backend dan menghitung status servis.

### 9.2 Algoritma Perhitungan Jarak

1. Ambil titik GPS valid pada interval 1 Hz.
2. Hitung jarak Haversine dari titik valid sebelumnya.
3. Tambahkan ke odometer **hanya jika semua kondisi terpenuhi**:
   - Fix GPS valid dan jumlah satelit ≥ 4
   - HDOP ≤ 2.5 (nilai awal, bisa disetel)
   - Kecepatan ≥ 5 km/jam (menghindari drift saat diam)
   - Lonjakan jarak antar titik masuk akal (tidak melebihi kecepatan maksimum wajar × selisih waktu)
4. Akumulasi di RAM dalam satuan meter, tulis ke NVS tiap ±500 m atau saat kecepatan nol lebih dari beberapa detik.

### 9.3 Spesifikasi BLE GATT

Nama perangkat: `MotorTracker-XXXX` (XXXX = 4 digit terakhir MAC).

| Characteristic | Properti | Tipe Data | Keterangan |
|---|---|---|---|
| `odometer_m` | Read, Notify | uint32 | Total jarak dalam meter |
| `status` | Read, Notify | struct | Fix GPS (1 byte), jumlah satelit (1 byte), tegangan (uint16, mV) |
| `set_odometer` | Write | uint32 | Mengatur nilai awal odometer (meter) |
| `device_info` | Read | string | Versi firmware dan ID perangkat |

UUID service dan characteristic bersifat custom (128-bit) dan akan ditentukan saat implementasi.

Keamanan BLE (MVP): pairing dengan passkey atau tombol fisik untuk mode pairing, agar `set_odometer` tidak bisa ditulis oleh sembarang perangkat di sekitar.

### 9.4 Model Data (Backend)

**users**: `id`, `email`, `password_hash`, `created_at`

**vehicles**: `id`, `user_id`, `name`, `device_id`, `odometer_m`, `updated_at`

**service_items**: `id`, `vehicle_id`, `name`, `interval_km`, `last_service_km`, `warn_percent`, `created_at`

**service_logs**: `id`, `service_item_id`, `odometer_km`, `performed_at`, `notes`

### 9.5 Hardware (BOM Awal)

| Komponen | Keterangan |
|---|---|
| ESP32 DevKit (ESP32-WROOM-32) | Mikrokontroler dengan BLE |
| GPS NEO-6M + antena eksternal | Penghitung posisi dan kecepatan |
| Buck converter 12V → 5V | Input dari aki, dengan proteksi |
| Fuse + dioda proteksi polaritas + TVS | Proteksi lonjakan tegangan motor |
| LED status | Indikator |
| Casing tahan air dan getaran | Untuk pemasangan di motor |

Catatan pemasangan: antena GPS harus menghadap langit dan tidak tertutup logam.

## 10. Kebutuhan Non-Fungsional

| Aspek | Target |
|---|---|
| **Akurasi odometer** | Selisih ≤ 5% dibanding speedometer/jarak referensi pada uji 50 km |
| **Ketahanan data** | Kehilangan odometer maksimum ±500 m saat daya terputus mendadak |
| **Konsumsi daya** | Rata-rata < 150 mA saat aktif (target awal) |
| **Waktu sinkronisasi** | Koneksi BLE dan pembacaan data < 10 detik |
| **Keamanan** | HTTPS wajib, password di-hash, perangkat dilindungi pairing |
| **Kompatibilitas** | Chrome/Edge di Android dan desktop dengan Web Bluetooth |
| **Lingkungan** | Tahan getaran, suhu panas, dan percikan air |

## 11. Batasan & Asumsi

- **Web Bluetooth tidak didukung Safari/iOS.** Pengguna iPhone belum bisa memakai MVP. Solusi lanjutan: aplikasi pembungkus (misal Capacitor atau React Native).
- Web Bluetooth mewajibkan **HTTPS** dan interaksi pengguna (klik tombol) untuk memulai koneksi.
- Sinkronisasi hanya bisa dilakukan saat HP berada dalam jangkauan BLE (±10 m).
- NEO-6M punya akurasi terbatas dan bisa kurang baik di area terhalang (terowongan, gedung tinggi). Jarak yang hilang saat tidak ada fix tidak dihitung.
- Perangkat dipasang permanen di satu motor.

## 12. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Selisih odometer vs referensi (uji 50 km) | ≤ 5% |
| Keberhasilan koneksi BLE dari web | ≥ 95% percobaan |
| Odometer tetap benar setelah daya diputus 10 kali | 100% |
| Pengguna uji berhasil mengatur dan memakai pengingat servis tanpa bantuan | ≥ 80% |

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Drift GPS menambah jarak palsu saat diam | Odometer tidak akurat | Filter kecepatan minimum, HDOP, dan jumlah satelit |
| Sinyal GPS lemah/tertutup | Jarak kurang terhitung | Antena eksternal, posisi pemasangan yang tepat; opsi sensor roda di versi berikutnya |
| Daya terputus mendadak | Kehilangan data | Simpan ke NVS berkala dan deteksi penurunan tegangan |
| Aki tekor karena perangkat menyala terus | Motor sulit distarter | Deep sleep saat motor mati, ambil daya dari jalur kunci kontak (ACC) |
| Pengguna iOS tidak bisa memakai | Pasar terbatas | Roadmap aplikasi pembungkus |
| Penulisan odometer oleh pihak tidak berwenang | Data dimanipulasi | Pairing dengan passkey, validasi di backend |
| Flash NVS aus karena terlalu sering menulis | Perangkat rusak | Batasi frekuensi penulisan (tiap ±500 m) |

## 14. Rencana Rilis (Milestone)

| Fase | Cakupan | Estimasi |
|---|---|---|
| **M1: Prototipe hardware** | ESP32 + GPS terbaca, jarak terhitung, tampil di serial monitor | Minggu 1–2 |
| **M2: Odometer andal** | Filter GPS, penyimpanan NVS, uji jalan | Minggu 3–4 |
| **M3: BLE** | GATT service, uji baca/tulis dari web | Minggu 5–6 |
| **M4: Web & Backend** | Login, sinkronisasi, CRUD servis, status pengingat | Minggu 7–9 |
| **M5: Uji lapangan & perbaikan** | Uji pemasangan di motor, kalibrasi, bug fix | Minggu 10–11 |
| **M6: MVP Release** | Rilis internal/beta | Minggu 12 |

## 15. Rencana Pengembangan Lanjutan (Post-MVP)

- Sensor roda atau pulsa speedometer (fusion dengan GPS untuk akurasi lebih tinggi).
- Dukungan iOS lewat aplikasi pembungkus.
- WiFi atau modul SIM untuk sinkronisasi otomatis dan pelacakan jarak jauh.
- Riwayat perjalanan dan peta rute.
- Notifikasi push.
- OTA firmware update.
- Dukungan multi-kendaraan.

## 16. Pertanyaan Terbuka

1. Stack website dan backend apa yang akan dipakai (misal Next.js, Laravel, Firebase)?
2. Daya perangkat diambil dari jalur mana (aki langsung atau lewat kunci kontak)?
3. Apakah satu akun boleh punya lebih dari satu motor sejak awal?
4. Apakah perlu mode offline untuk web app (PWA) saat HP tidak punya internet?
5. Bagaimana kebijakan privasi data lokasi, mengingat MVP hanya menyimpan jarak dan bukan koordinat?
