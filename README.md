# VANDER-AI: Smart Adsorbent Monitoring System
> **Van der Waals & Redox Smart Adsorbent Artificial Intelligence**  
> Sistem Pemantauan Cerdas Instalasi Pengolahan Air Limbah Industri Berbasis Adsorben Biochar Kotoran Ayam

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Technology](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-brightgreen.svg)
![Charts](https://img.shields.io/badge/Visualization-Chart.js%20v4-orange.svg)
![Status](https://img.shields.io/badge/Status-Prototype%20Ready-success.svg)

---

## 📌 Ringkasan Proyek

**VANDER-AI** adalah purwarupa (*prototype*) sistem pemantauan cerdas berbasis web untuk Instalasi Pengolahan Air Limbah (IPAL) industri, khususnya industri tekstil dan elektroplating. Sistem ini memanfaatkan **biochar dari kotoran ayam (*chicken manure biochar*)** sebagai media adsorben bernilai tambah tinggi untuk menyerap zat warna, polutan organik, serta mereduksi logam berat berbahaya.

Melalui integrasi sensor IoT, model kinetika adsorpsi AI, dan visualisasi interaktif *real-time*, VANDER-AI membantu operator mengontrol proses filtrasi, memprediksi kejenuhan media biochar (*breakthrough curve*), mendeteksi penyumbatan secara otomatis (*clogging detection*), serta menjamin mutu air keluaran melalui simulasi katup pintar (*automated emergency shut-off valve*).

---

## 🔬 Prinsip Sains & Kimia-Fisika yang Dimonitor

| Prinsip | Rumus / Model | Mekanisme pada Media Biochar |
|---|---|---|
| **Gaya Van der Waals** | $E_{vdW} \propto -\frac{C}{r^6}$ | Adsorpsi fisik multi-lapisan zat warna tekstil pada pori mikro-meso karbon aktif biochar. |
| **Reaksi Redoks** | $\text{Cr}^{6+} + 3e^- \xrightarrow{\text{Biochar}} \text{Cr}^{3+}$ | Reduksi ion kromium heksavalen karsinogenik menjadi bentuk trivalen yang stabil dan aman oleh gugus donor elektron biochar. |
| **Afinitas Gugus Fungsi** | $-\text{COOH},\, -\text{OH},\, -\text{NH}_2$ | Kompleksasi permukaan yang secara selektif mengikat kation logam berat ($\text{Pb}^{2+}, \text{Cd}^{2+}, \text{Cu}^{2+}$). |
| **Kemisorpsi Monolayer** | $\Delta G^\circ < 0$ | Pembentukan ikatan kovalen koordinasi spontan pada situs aktif karbon hasil pirolisis 500°C. |

---

## 🚀 Fitur Utama

### 1. 🧪 Visualisasi Perbandingan Kualitas Air (*Before vs After*)
- **Gelas Sebelum**: Menampilkan air limbah mentah dengan gradien pekat, partikel koloid organik melayang (*floating particles*), animasi gelembung gas buang, dan gelombang air.
- **Gelas Sesudah**: Menampilkan air hasil filtrasi yang bening (*crystal clean*) dengan kilau air (*sparkle*). 
- **Transisi Warna Dinamis**: Air bersih akan memudar menjadi keruh secara bertahap saat terjadi anomali atau biochar jenuh, dan kembali bening setelah proses *backwash*.
- **Pipa Aliran Teranimasi**: Mengilustrasikan alur air limbah mentah masuk ke dalam reaktor biochar hingga keluar sebagai air bersih.

### 2. 🤖 4 Modul Cerdas Bertenaga AI
1. **🔮 Breakthrough Predictor**:
   - Menampilkan persentase kapasitas adsorpsi biochar (0–100%) dengan indikator *OPTIMAL / WARNING / CRITICAL*.
   - Hitung mundur perkiraan waktu hingga filter jenuh (*Yoon-Nelson & Thomas Kinetic Model*).
   - Grafik tren penurunan kapasitas biochar.
2. **⚖️ Mass Balance & Volume Tracker**:
   - Akumulasi total volume air masuk vs keluar (Liter).
   - Efisiensi volumetrik sistem (%).
   - Alarm otomatis deteksi penyumbatan pori (*clogging*) jika debit air keluar turun >15%.
3. **🛡️ Automated Quality Assurance & Smart Valve**:
   - Pemantauan kesesuaian baku mutu air (pH, Kekeruhan/Turbidity, dan Daya Hantar Listrik/EC).
   - **Simulasi Katup Otomatis**: Jika air keluaran melampaui ambang batas, katup pembuangan ke sungai seketika ditutup dan dialihkan ke tangki retensi, disertai indikator lampu merah berkedip kencang.
4. **🌱 Smart Eco-Efficiency Calculator**:
   - Total volume air daur ulang (L).
   - Estimasi penghematan biaya pembelian air komersial (Rp 15/L).
   - Pengurangan jejak emisi karbon (kg CO2).

### 3. 📊 Instrumen Dashboard & Grafik Real-Time
- **6 Kartu Ringkasan Metrik**: Data agregat waktu operasi, volume, dan efisiensi.
- **3 Gauge Meter Analog**: Pengukur analog melengkung untuk pH, Turbidity, dan EC.
- **4 Grafik Garis Interaktif (Chart.js)**: Membandingkan sensor masukan (*Input*) vs keluaran (*Output*) setiap 3 detik.
- **Bilah Efisiensi Removal**: Menghitung persentase eliminasi kekeruhan, logam berat, dan penyesuaian pH secara *live*.
- **Status 8 Sensor**: Indikator status koneksi pH meter, sensor kekeruhan, EC, dan flow meter.
- **Log Notifikasi & Alert**: Riwayat peristiwa berstatus INFO (biru), WARNING (kuning), dan EMERGENCY (merah).

### 4. 🎮 Panel Pengujian Simulasi (Live Demo)
Dirancang khusus untuk mempermudah demonstrasi dan presentasi ke dewan juri:
- ⚡ **Uji Anomali Kualitas**: Seketika memicu lonjakan parameter air untuk menguji respons katup darurat dan sirine visual.
- 🚨 **Uji Clogging Filter**: Mensimulasikan penurunan debit >15% untuk memicu peringatan *backwash*.
- 🔄 **Reset & Backwash Filter**: Mengembalikan kapasitas biochar ke 95%, menormalkan sensor, dan membuka kembali katup sungai.
- ⏸️ / ▶️ **Jeda / Lanjutkan Simulasi**: Membekukan data di layar untuk memudahkan penjelasan lisan ke juri.
- 📥 **Ekspor Log Telemetri (.CSV)**: Mengunduh arsip rekaman data sensor ke dalam format spreadsheet.

---

## 📁 Struktur Direktori

```text
├── index.html        # Struktur antarmuka semantik, loading screen, dan panel modul
├── style.css         # Styling modern bertema ocean blue-green, glassmorphism, animasi
├── app.js            # Engine simulasi sensor 3 detik, Chart.js, katup darurat, ekspor data
└── README.md         # Dokumentasi resmi proyek
```

---

## 💻 Cara Menjalankan Proyek

### Opsi 1: Menjalankan Langsung di Komputer Lokal
1. Unduh atau clone repositori ini:
   ```bash
   git clone https://github.com/faridnadir24-bit/-VANDER-AI.git
   ```
2. Buka file `index.html` dengan klik dua kali atau melalui browser apa saja (Google Chrome, Edge, Safari, Firefox).
3. Dashboard akan langsung berjalan otomatis tanpa memerlukan instalasi server atau dependensi tambahan!

### Opsi 2: Mengaktifkan GitHub Pages (Online Demo)
1. Buka repositori ini di GitHub.
2. Masuk ke menu **Settings** > **Pages**.
3. Pada bagian **Build and deployment > Branch**, pilih branch `main` dan folder `/ (root)`.
4. Klik **Save**. Dalam beberapa menit, dashboard Anda akan aktif online di:
   ```text
   https://faridnadir24-bit.github.io/-VANDER-AI/
   ```

---

## 👨‍💻 Pengembang

**Farid Nadir**  
GitHub: [@faridnadir24-bit](https://github.com/faridnadir24-bit)  
Email: faridnadir24@gmail.com

---

*Proyek ini dikembangkan sebagai purwarupa inovasi teknologi ramah lingkungan berbasis Artificial Intelligence dan material maju untuk kompetisi esai ilmiah.*
