// Passport, Visa, and ID Photo Presets Database
// All physical dimensions are calibrated for 300 DPI high-resolution printing by default.

const PHOTO_PRESETS = [
  // --- MOST POPULAR ---
  {
    id: 'us-passport',
    name: 'US Passport / Visa (2x2 in)',
    country: 'United States',
    category: 'popular',
    unit: 'in',
    width: 2,
    height: 2,
    dpi: 300,
    pixelWidth: 600,
    pixelHeight: 600,
    aspectRatio: 1,
    bgRecommendation: 'White or Off-White',
    bgColor: '#ffffff',
    headRatioMin: 0.50, // 1 inch
    headRatioMax: 0.69, // 1 3/8 inches
    maxFileSizeKB: 240,
    description: 'US State Dept & DV Lottery standard. 2x2" (51x51mm). Head must occupy 50-69% of image.'
  },
  {
    id: 'uk-schengen-passport',
    name: 'UK / Schengen Visa / Europe (35x45 mm)',
    country: 'United Kingdom / European Union',
    category: 'popular',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Light Grey or Cream',
    bgColor: '#f0f0f2',
    headRatioMin: 0.70, // 32mm
    headRatioMax: 0.80, // 36mm
    description: 'Standard for UK, Germany, France, Italy, and 27 Schengen countries. 35x45mm.'
  },
  {
    id: 'ph-2x2',
    name: 'Philippine 2x2 ID Photo',
    country: 'Philippines',
    category: 'popular',
    unit: 'in',
    width: 2,
    height: 2,
    dpi: 300,
    pixelWidth: 600,
    pixelHeight: 600,
    aspectRatio: 1,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.55,
    headRatioMax: 0.70,
    hasNametagOption: true,
    description: 'Standard 2x2 ID photo for Philippine government, PRC, Civil Service, school & employment.'
  },
  {
    id: 'ph-1x1',
    name: 'Philippine 1x1 ID Photo',
    country: 'Philippines',
    category: 'popular',
    unit: 'in',
    width: 1,
    height: 1,
    dpi: 300,
    pixelWidth: 300,
    pixelHeight: 300,
    aspectRatio: 1,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.55,
    headRatioMax: 0.75,
    description: 'Standard 1x1 inch ID photo for job applications, school IDs, and clearances.'
  },
  {
    id: 'ca-passport',
    name: 'Canada Passport (50x70 mm)',
    country: 'Canada',
    category: 'popular',
    unit: 'mm',
    width: 50,
    height: 70,
    dpi: 300,
    pixelWidth: 591,
    pixelHeight: 827,
    aspectRatio: 50 / 70,
    bgRecommendation: 'Plain White or Light-Coloured',
    bgColor: '#ffffff',
    headRatioMin: 0.44, // 31mm
    headRatioMax: 0.51, // 36mm
    description: 'Passport Canada official: 50x70mm (2x2.75 in). Head height 31-36mm from chin to crown.'
  },
  {
    id: 'in-passport',
    name: 'India Passport / OCI / Visa (2x2 in)',
    country: 'India',
    category: 'popular',
    unit: 'in',
    width: 2,
    height: 2,
    dpi: 300,
    pixelWidth: 600,
    pixelHeight: 600,
    aspectRatio: 1,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.60,
    headRatioMax: 0.70,
    description: 'Passport Seva & OCI standard: 2x2 inches (51x51mm) with plain white background.'
  },
  {
    id: 'au-nz-passport',
    name: 'Australia / New Zealand Passport (35x45 mm)',
    country: 'Australia / NZ',
    category: 'popular',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Plain White or Light Grey',
    bgColor: '#f5f5f7',
    headRatioMin: 0.71, // 32mm
    headRatioMax: 0.80, // 36mm
    description: 'Official Australian & NZ Passport standard: 35x45mm. Head size 32mm to 36mm.'
  },
  {
    id: 'cn-passport',
    name: 'China Passport / Visa (33x48 mm)',
    country: 'China',
    category: 'popular',
    unit: 'mm',
    width: 33,
    height: 48,
    dpi: 300,
    pixelWidth: 390,
    pixelHeight: 567,
    aspectRatio: 33 / 48,
    bgRecommendation: 'White or Light Blue',
    bgColor: '#ffffff',
    headRatioMin: 0.58, // 28mm
    headRatioMax: 0.69, // 33mm
    description: 'Official Chinese National Immigration Administration standard: 33x48mm.'
  },
  {
    id: 'jp-passport',
    name: 'Japan Passport (35x45 mm)',
    country: 'Japan',
    category: 'popular',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Plain White or Off-White',
    bgColor: '#ffffff',
    headRatioMin: 0.71, // 32mm
    headRatioMax: 0.80, // 36mm
    description: 'Japanese Ministry of Foreign Affairs passport format: 35x45mm.'
  },

  // --- PHILIPPINES SPECIFIC ---
  {
    id: 'ph-prc',
    name: 'Philippine PRC / Civil Service (Passport size + Nametag)',
    country: 'Philippines',
    category: 'ph',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.55,
    headRatioMax: 0.65,
    hasNametagOption: true,
    description: 'PRC Board Exam / Civil Service: Passport size with white background and name tag.'
  },
  {
    id: 'ph-dfa-passport',
    name: 'Philippine DFA Passport (35x45 mm)',
    country: 'Philippines',
    category: 'ph',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Royal Blue Background',
    bgColor: '#0038a8',
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    description: 'Philippine Department of Foreign Affairs e-Passport standard with Royal Blue background.'
  },

  // --- UNITED STATES ---
  {
    id: 'us-dv-lottery',
    name: 'US Diversity Visa (Green Card Lottery)',
    country: 'United States',
    category: 'us',
    unit: 'in',
    width: 2,
    height: 2,
    dpi: 300,
    pixelWidth: 600,
    pixelHeight: 600,
    aspectRatio: 1,
    bgRecommendation: 'Plain White / Off-White',
    bgColor: '#ffffff',
    headRatioMin: 0.50,
    headRatioMax: 0.69,
    maxFileSizeKB: 240,
    description: 'Strict DV Lottery requirements: Exactly 600x600 px, max 240 KB file size, 24-bit color.'
  },

  // --- CANADA ---
  {
    id: 'ca-visa',
    name: 'Canada Visa / PR Card (35x45 mm)',
    country: 'Canada',
    category: 'ca',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Pure White',
    bgColor: '#ffffff',
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    description: 'Immigration, Refugees and Citizenship Canada (IRCC) standard for Visa and PR applications.'
  },

  // --- ASIA / PACIFIC ---
  {
    id: 'sg-passport',
    name: 'Singapore Passport (35x45 mm)',
    country: 'Singapore',
    category: 'asia',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.74, // 35mm
    headRatioMax: 0.84, // 38mm
    description: 'ICA Singapore official passport: 35x45mm, head height 35mm to 38mm.'
  },
  {
    id: 'my-passport',
    name: 'Malaysia Passport (35x50 mm)',
    country: 'Malaysia',
    category: 'asia',
    unit: 'mm',
    width: 35,
    height: 50,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 591,
    aspectRatio: 35 / 50,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.60,
    headRatioMax: 0.70,
    description: 'Malaysian Immigration Department passport photo format (35x50mm).'
  },
  {
    id: 'kr-passport',
    name: 'South Korea Passport (35x45 mm)',
    country: 'South Korea',
    category: 'asia',
    unit: 'mm',
    width: 35,
    height: 45,
    dpi: 300,
    pixelWidth: 413,
    pixelHeight: 531,
    aspectRatio: 35 / 45,
    bgRecommendation: 'Plain White',
    bgColor: '#ffffff',
    headRatioMin: 0.71,
    headRatioMax: 0.80,
    description: 'Korean Ministry of Foreign Affairs passport photo standard.'
  },

  // --- STANDARD SIZES ---
  {
    id: 'std-2x2',
    name: 'Standard 2 x 2 Inches (Square)',
    country: 'Universal',
    category: 'standard',
    unit: 'in',
    width: 2,
    height: 2,
    dpi: 300,
    pixelWidth: 600,
    pixelHeight: 600,
    aspectRatio: 1,
    bgRecommendation: 'Any',
    bgColor: '#ffffff',
    headRatioMin: 0.50,
    headRatioMax: 0.70,
    description: 'Universal 2x2 inch square ID format (50.8 x 50.8 mm).'
  },
  {
    id: 'std-1x1',
    name: 'Standard 1 x 1 Inch (Square)',
    country: 'Universal',
    category: 'standard',
    unit: 'in',
    width: 1,
    height: 1,
    dpi: 300,
    pixelWidth: 300,
    pixelHeight: 300,
    aspectRatio: 1,
    bgRecommendation: 'Any',
    bgColor: '#ffffff',
    headRatioMin: 0.55,
    headRatioMax: 0.75,
    description: 'Universal 1x1 inch mini square format (25.4 x 25.4 mm).'
  },
  {
    id: 'std-wallet-2x3',
    name: 'Wallet Size (2 x 3 Inches)',
    country: 'Universal',
    category: 'standard',
    unit: 'in',
    width: 2,
    height: 3,
    dpi: 300,
    pixelWidth: 600,
    pixelHeight: 900,
    aspectRatio: 2 / 3,
    bgRecommendation: 'Any',
    bgColor: '#ffffff',
    headRatioMin: 0.45,
    headRatioMax: 0.65,
    description: 'Classic portrait wallet print size: 2 x 3 inches (51 x 76 mm).'
  },
  {
    id: 'std-30x40',
    name: '30 x 40 mm (3 x 4 cm)',
    country: 'Universal',
    category: 'standard',
    unit: 'mm',
    width: 30,
    height: 40,
    dpi: 300,
    pixelWidth: 354,
    pixelHeight: 472,
    aspectRatio: 30 / 40,
    bgRecommendation: 'Any',
    bgColor: '#ffffff',
    headRatioMin: 0.60,
    headRatioMax: 0.75,
    description: 'Standard 3x4 cm ID photo used in many European, Asian, and Latin American documents.'
  },
  {
    id: 'std-40x60',
    name: '40 x 60 mm (4 x 6 cm)',
    country: 'Universal',
    category: 'standard',
    unit: 'mm',
    width: 40,
    height: 60,
    dpi: 300,
    pixelWidth: 472,
    pixelHeight: 709,
    aspectRatio: 40 / 60,
    bgRecommendation: 'Any',
    bgColor: '#ffffff',
    headRatioMin: 0.55,
    headRatioMax: 0.70,
    description: 'Common 4x6 cm visa and student card size.'
  }
];

// Paper print sheet presets for multiple photos per sheet
const SHEET_PRESETS = [
  {
    id: 'sheet-4x6',
    name: '4" x 6" Photo Paper (10 x 15 cm)',
    widthInches: 4,
    heightInches: 6,
    widthMm: 101.6,
    heightMm: 152.4,
    widthPx: 1200, // 4" * 300 DPI
    heightPx: 1800, // 6" * 300 DPI
    orientation: 'portrait',
    description: 'Standard photo print size available at CVS, Walgreens, Walmart, and photo kiosks.'
  },
  {
    id: 'sheet-5x7',
    name: '5" x 7" Photo Paper (13 x 18 cm)',
    widthInches: 5,
    heightInches: 7,
    widthMm: 127.0,
    heightMm: 177.8,
    widthPx: 1500,
    heightPx: 2100,
    orientation: 'portrait',
    description: 'Medium portrait photo sheet.'
  },
  {
    id: 'sheet-a4',
    name: 'A4 Document Paper (210 x 297 mm)',
    widthInches: 8.27,
    heightInches: 11.69,
    widthMm: 210,
    heightMm: 297,
    widthPx: 2480,
    heightPx: 3508,
    orientation: 'portrait',
    description: 'Standard international printer paper for home or office printing.'
  },
  {
    id: 'sheet-letter',
    name: 'US Letter Paper (8.5" x 11")',
    widthInches: 8.5,
    heightInches: 11,
    widthMm: 215.9,
    heightMm: 279.4,
    widthPx: 2550,
    heightPx: 3300,
    orientation: 'portrait',
    description: 'Standard North American home printer paper.'
  }
];

// Common background color options
const BACKGROUND_COLORS = [
  { id: 'white', name: 'Pure White', hex: '#FFFFFF', border: '#D1D5DB', note: 'Standard for US, PH, CA, AU' },
  { id: 'off-white', name: 'Off-White / Light Cream', hex: '#FAF9F6', border: '#D1D5DB', note: 'Accepted for Schengen' },
  { id: 'light-gray', name: 'Light Grey', hex: '#E5E7EB', border: '#D1D5DB', note: 'Accepted for UK, Schengen' },
  { id: 'ph-blue', name: 'Royal Blue', hex: '#0047AB', border: '#0047AB', note: 'PH DFA Passport, Singapore' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#00A3E0', border: '#00A3E0', note: 'China, Malaysia, Taiwan' },
  { id: 'red', name: 'Red', hex: '#D21034', border: '#D21034', note: 'Indonesia, Vietnam' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PHOTO_PRESETS, SHEET_PRESETS, BACKGROUND_COLORS };
}
