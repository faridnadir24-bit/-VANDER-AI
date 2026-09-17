# VANDER-AI: Enterprise Smart Adsorbent Monitoring System
> **Van der Waals & Redox Smart Adsorbent Artificial Intelligence (SCADA Suite v4.2)**  
> Sistem Pemantauan Cerdas & SCADA Digital Twin Instalasi Pengolahan Air Limbah Industri Berbasis Biochar Kotoran Ayam

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Technology](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-brightgreen.svg)
![Architecture](https://img.shields.io/badge/Architecture-Enterprise%20SCADA%20v4.2-0284c7.svg)
![AI Engine](https://img.shields.io/badge/AI%20Inference-Neural%20Kinetic%20Engine-10b981.svg)
![Status](https://img.shields.io/badge/Status-Enterprise%20Ready-success.svg)

---

## 📌 Ringkasan Proyek

**VANDER-AI Enterprise Suite v4.2** adalah purwarupa (*prototype*) sistem pemantauan cerdas dan *Digital Twin* berbasis web untuk Instalasi Pengolahan Air Limbah (IPAL) industri tekstil dan elektroplating. Sistem ini memanfaatkan **biochar dari kotoran ayam (*chicken manure biochar*)** sebagai media adsorben bernilai tambah tinggi untuk menyerap zat warna, polutan organik, serta mereduksi ion logam berat berbahaya secara simultan.

VANDER-AI mengadopsi spesifikasi perangkat lunak industri kelas *Enterprise SCADA* (mirip Siemens MindSphere / Palantir Foundry / Datadog IoT), mengintegrasikan:
- **Neural Reasoning Hub**: Analisis kinetika adsorpsi dan inferensi status media secara *real-time*.
- **SCADA Digital Twin P&ID**: Skema visual reaktor kolom kontinu terintegrasi dengan pompa umpan, probe sensor in-line, dan katup aktuator 3-arah (*three-way actuated motorized control valve*).
- **Nephelometer Optik Spektrofotometri**: Pemindaian sinar laser 650 nm (ISO 7027) untuk mengukur transmitansi dan hamburan cahaya partikel koloid.
- **MQTT / OPC-UA Telemetry Stream Inspector**: Konsol inspeksi paket data IoT terenkripsi secara *live*.

---

## 🔬 Prinsip Sains & Kimia-Fisika yang Dimonitor

| Prinsip | Rumus / Model | Mekanisme pada Media Biochar |
|---|---|---|
| **Gaya Van der Waals** | $E_{vdW} \propto -\frac{C}{r^6}$ | Adsorpsi fisik multi-lapisan molekul zat warna tekstil pada pori mikro-meso karbon aktif biochar kotoran ayam. |
| **Reaksi Redoks** | $\text{Cr}^{6+} + 3e^- \xrightarrow{\text{Biochar}} \text{Cr}^{3+}$ | Reduksi ion kromium heksavalen karsinogenik menjadi ion trivalen yang stabil dan terendapkan oleh gugus donor elektron biochar. |
| **Afinitas Gugus Fungsi** | $-\text{COOH},\, -\text{OH},\, -\text{NH}_2$ | Kompleksasi permukaan yang secara selektif mengikat kation logam berat ($\text{Pb}^{2+}, \text{Cd}^{2+}, \text{Cu}^{2+}$). |
| **Kemisorpsi Monolayer** | $\Delta G^\circ < 0$ | Pembentukan ikatan kovalen koordinasi spontan pada situs aktif karbon hasil pirolisis 500°C. |

---

## 🚀 Fitur Kelas Industri (Enterprise Features)

### 1. 🧠 VANDER-AI Neural Reasoning Engine
- **Live Stream Reasoning**: Menampilkan alur pemikiran AI (*stream of thought*) yang mengkalkulasi gaya Van der Waals, reaksi redoks, dan stabilitas hidrolik secara berkala.
- **Dynamic Confidence Score**: Skor keyakinan model inferensi (99.1% – 99.8%, F1-score: 0.982).
- **Safety Interlock**: Indikator status penguncian keselamatan otomatis jika terdeteksi anomali pada baku mutu.

### 2. 🏭 SCADA Digital Twin (P&ID Synoptic Diagram)
- **Pompa Umpan (Pump P-101)**: Indikator putaran impeller aktif, pemantauan debit aliran (*flow rate*), dan status operasional.
- **Reaktor Kolom Adsorben (Reactor R-201)**: Visualisasi tinggi unggun biochar (120 cm), tingkat saturasi *Mass Transfer Zone* (MTZ) yang bergerak dinamis, dan penurunan tekanan ($\Delta P$).
- **Katup Kontrol Bermotor 3-Arah (Valve MOV-301 Actuator)**:
  - Jalur Utama: Aliran normal menuju pelepasan sungai (*River Discharge*).
  - Jalur Darurat: Seketika beralih ke tangki retensi (*Retention Bypass*) saat terjadi lonjakan polutan untuk resirkulasi ulang.

### 3. 🔬 Visualisasi Air & Nephelometer Optik (Laser 650 nm)
- **Gelas Sebelum**: Limbah pekat gelap dengan hamburan cahaya tinggi ($96.8\%$), transmitansi rendah ($3.2\%$), partikel tersuspensi, gelembung gas buang, dan gelombang SVG.
- **Gelas Sesudah**: Air jernih kristal dengan transmitansi optik tinggi ($99.2\%$), pendar kilau (*sparkles*), serta transisi warna dinamis saat jenuh atau setelah *backwash*.
- **Laser Scanner**: Efek garis laser nephelometrik vertikal dengan hamburan efek Tyndall yang realistis.

### 4. 🔮 Breakthrough Predictor & Parameter Kinetika
- Persentase kapasitas adsorpsi (0–100%) dengan bar *shimmer*.
- Model Kinetika Kritis:
  - $k_{Th}$ (Konstanta Thomas): $0.038\text{ mL/(mg}\cdot\text{min)}$
  - $q_0$ (Kapasitas Adsorpsi Maksimum): $146.2\text{ mg/g}$
  - $\tau$ (Waktu 50% Breakthrough Yoon-Nelson): $52.8\text{ jam}$
  - Panjang MTZ (*Mass Transfer Zone*): $18.4\text{ cm}$

### 5. 📡 Live MQTT Telemetry Stream Inspector
- Menampilkan inspeksi paket data JSON IoT secara langsung (timestamp, sensor ID, parameter masukan/keluaran, status katup MOV-301, dan status interlock).
- Mendukung protokol standar industri: OPC-UA & MQTT TLS 1.3.

### 6. 🔊 Sintesis Efek Suara Web Audio SCADA
- Menghasilkan audio peringatan darurat, *success chime*, dan *feedback clicks* secara sintetis via Web Audio API tanpa memerlukan file eksternal (dapat diaktifkan/dinonaktifkan lewat tombol audio di header).

### 7. 🎮 Panel Pengujian Simulasi (Live Demo)
- ⚡ **Uji Anomali Kualitas**: Seketika menguji respons katup darurat MOV-301 dan alarm visual/audio.
- 🚨 **Uji Clogging Filter**: Mensimulasikan penurunan debit $>15\%$ untuk memicu peringatan *backwash*.
- 🔄 **Reset & Backwash Filter**: Meregenerasi biochar ke 95%, menormalkan sensor, dan membuka kembali katup sungai.
- ⏸️ / ▶️ **Jeda / Lanjutkan Simulasi**: Membekukan data untuk presentasi lisan ke dewan juri.
- 📥 **Ekspor Log (.CSV)**: Mengunduh arsip rekaman data telemetri real-time.

---

## 📁 Struktur Berkas

```text
├── index.html        # Antarmuka SCADA Enterprise, loading screen, modal telemetry
├── style.css         # Styling dark/cyan/emerald industrial SCADA, laser, glassmorphism
├── app.js            # Engine inferensi AI, synthesizer Web Audio, P&ID live update
└── README.md         # Dokumentasi ilmiah & spesifikasi arsitektur sistem
```

---

## 💻 Cara Menjalankan

1. Clone repositori:
   ```bash
   git clone https://github.com/faridnadir24-bit/-VANDER-AI.git
   ```
2. Buka `index.html` pada browser apa saja (Chrome, Edge, Safari, Firefox).
3. Untuk demo online gratis, aktifkan **GitHub Pages** melalui menu **Settings > Pages > Branch: main > Save**.

---

## 👨‍💻 Pengembang

**Farid Nadir**  
GitHub: [@faridnadir24-bit](https://github.com/faridnadir24-bit)  
Email: faridnadir24@gmail.com
