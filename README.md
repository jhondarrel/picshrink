# picshrink — 2x2, 1x1 & Passport Photo Resizer

A fast, compliant, and **100% private in-browser** web application to crop, resize, align, and print official ID and passport photos (including standard 2x2 inches, 1x1 inch, 35x45mm Schengen/UK, and custom dimensions).

All photo processing is performed directly in your web browser via HTML5 Canvas. **No images are ever uploaded to any external server.**

---

## 🚀 Quick Start

### Option 1: Direct Browser Launch
Simply double-click `index.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: 1-Click Windows Launcher
Double-click `start.bat` in this folder. It will start a local server and automatically open the application in your browser.

### Option 3: Terminal / Command Line
```powershell
python server.py
```
Then visit `http://localhost:8080/`.

---

## ✨ Features & Capabilities

### 1. Official Standard Sizes & Presets
- **2" x 2" (51 x 51 mm / 600 x 600 px @ 300 DPI)**:
  - United States Passport & Visa
  - US Green Card / Diversity Visa (DV) Lottery (strictly under 240 KB)
  - Philippines 2x2 ID Photo
  - India Passport, OCI & Visa
- **1" x 1" (25.4 x 25.4 mm / 300 x 300 px @ 300 DPI)**:
  - Philippines 1x1 ID Photo
  - Universal 1x1 small ID badge format
- **35 x 45 mm (413 x 531 px @ 300 DPI)**:
  - Schengen Visa (all 27 European countries)
  - United Kingdom Passport
  - Australia & New Zealand Passport
  - Japan Passport
  - Singapore Passport
  - Canada Visa / Permanent Resident
  - Philippine DFA e-Passport
- **Canada Passport (50 x 70 mm / 591 x 827 px @ 300 DPI)**
- **China Passport & Visa (33 x 48 mm)**
- **Malaysia Passport (35 x 50 mm)**
- **Standard Photo Sizes**:
  - Wallet size (2" x 3")
  - 30 x 40 mm (3 x 4 cm)
  - 40 x 60 mm (4 x 6 cm)
- **Custom Size Builder**:
  - Choose any width and height in **Inches (in)**, **Millimeters (mm)**, **Centimeters (cm)**, or **Pixels (px)**.
  - Select print DPI (300 DPI print standard, 600 DPI ultra-sharp, 150 DPI, or 72 DPI web).

### 2. Biometric Face Alignment Guide
- **Head Height Bounds**: Displays official crown and chin bounds (e.g. 50% to 69% of photo height for US & Philippines standards).
- **Eye Level Guideline**: Horizontal guide line to ensure eyes are positioned in the upper half of the photo.
- **Biometric Oval**: Real-time oval outline that scales and moves dynamically with the crop box to frame the face accurately.

### 3. Background Color Replacement & Fill
- Official background options:
  - **Pure White** (`#FFFFFF`) — standard for US, Philippines, Canada, Australia.
  - **Off-White / Light Cream** (`#FAF9F6`) — accepted for Schengen and UK.
  - **Light Grey** (`#E5E7EB`) — standard for UK.
  - **Royal Blue** (`#0047AB`) — Philippine DFA passport, Singapore.
  - **Sky Blue** (`#00A3E0`) — China, Malaysia.
  - **Red** (`#D21034`) — Indonesia, Vietnam.
- **Edge-Connected Seed Fill Algorithm**: Automatically identifies outer background borders while protecting the subject's face, eyes, and interior clothing.
- Adjustable **Color Tolerance** and **Edge Softness** sliders.

### 4. Philippine PRC / Board Exam Nametag Strip
- Optional white name strip at the bottom of the photo.
- Formatted in bold uppercase (e.g. `DELA CRUZ, JUAN P.`) with optional subtitle/profession (`REGISTERED NURSE`).

### 5. Multi-Photo Printable Sheet Generator (Tiling)
- Print multiple photos on standard photo paper to save money at CVS, Walgreens, Walmart, or home printers:
  - **4" x 6" Photo Paper** (fits 6 copies of 2x2 photos!)
  - **5" x 7" Photo Paper**
  - **A4 Document Paper**
  - **US Letter Paper**
- Includes **Scissor Cut Guidelines** (dashed lines and corner marks) and thin borders for cutting white photos on white paper.
- **1-Click Direct Print** at true 100% scale without printer scaling distortion.
- **Download as 300 DPI JPEG** or **Print-Ready PDF**.

### 6. Photo Adjustments & Webcam
- Fine rotation slider (-45° to +45° with 0.5° increments) to correct head tilt.
- 90° clockwise and counter-clockwise rotation, horizontal flip.
- Brightness, Contrast, Sharpness/Clarity, and Color Warmth sliders.
- **Built-in Webcam Capture** with live biometric alignment oval and 3-second countdown timer.

---

## 📄 License & Privacy
- Runs 100% locally in your client browser.
- No network requests with your personal photos.
