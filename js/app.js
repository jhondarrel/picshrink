// picshrink - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    imageSrc: null,
    cropper: null,
    currentPreset: PHOTO_PRESETS[0], // US 2x2 by default
    activeCategory: 'all',
    searchQuery: '',
    adjustments: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      warmth: 0
    },
    background: {
      enabled: false,
      color: '#ffffff',
      tolerance: 28,
      feather: 2
    },
    nametag: {
      enabled: false,
      fullName: '',
      profession: ''
    },
    sheet: {
      presetId: 'sheet-4x6',
      addCutLines: true,
      addBorders: true
    },
    biometricGuide: true,
    fineRotateDeg: 0,
    activeTab: 'single', // 'single' or 'sheet'
    singleCanvasResult: null,
    sheetCanvasResult: null,
    cameraStream: null
  };

  // DOM Elements Cache
  const uploadSection = document.getElementById('uploadSection');
  const editorSection = document.getElementById('editorSection');
  const fileInput = document.getElementById('fileInput');
  const cropperImage = document.getElementById('cropperImage');
  const singlePhotoCanvas = document.getElementById('singlePhotoCanvas');
  const printSheetCanvas = document.getElementById('printSheetCanvas');
  const presetListContainer = document.getElementById('presetListContainer');
  const categoryChips = document.getElementById('categoryChips');
  const presetSearch = document.getElementById('presetSearch');
  const activePresetBadge = document.getElementById('activePresetBadge');

  // Preview elements
  const specDimText = document.getElementById('specDimText');
  const specResolutionText = document.getElementById('specResolutionText');
  const specDpiText = document.getElementById('specDpiText');
  const specFileSizeText = document.getElementById('specFileSizeText');
  const complianceText = document.getElementById('complianceText');
  const sheetInfoText = document.getElementById('sheetInfoText');
  const selectSheetPreset = document.getElementById('selectSheetPreset');

  // Initialize UI
  populatePresets();
  populateSheetPresets();
  populateColorPalette();
  setupEventListeners();

  // -------------------------------------------------------------
  // Preset Management
  // -------------------------------------------------------------
  function populatePresets() {
    presetListContainer.innerHTML = '';
    const query = state.searchQuery.toLowerCase().trim();

    const filtered = PHOTO_PRESETS.filter(p => {
      const matchCat = state.activeCategory === 'all' || p.category === state.activeCategory;
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.country.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      presetListContainer.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No matching presets found. Try the Custom Size Builder below!
        </div>
      `;
      return;
    }

    filtered.forEach(preset => {
      const card = document.createElement('div');
      card.className = `preset-card ${preset.id === state.currentPreset?.id ? 'active' : ''}`;
      card.dataset.id = preset.id;

      card.innerHTML = `
        <div class="preset-card-top">
          <span class="preset-card-name">${preset.name}</span>
          <span class="preset-card-dim">${preset.width}x${preset.height} ${preset.unit}</span>
        </div>
        <div class="preset-card-desc">${preset.description}</div>
      `;

      card.addEventListener('click', () => {
        selectPreset(preset);
      });

      presetListContainer.appendChild(card);
    });
  }

  function selectPreset(preset) {
    state.currentPreset = preset;

    // Update active card styling
    document.querySelectorAll('.preset-card').forEach(c => {
      c.classList.toggle('active', c.dataset.id === preset.id);
    });

    // Update active badge in header
    activePresetBadge.textContent = `${preset.name} (${preset.pixelWidth}x${preset.pixelHeight} px)`;

    // Update recommended background
    const bgNote = document.getElementById('bgRecommendationNote');
    if (bgNote) {
      bgNote.textContent = `Recommended: ${preset.bgRecommendation || 'Pure White'}`;
    }

    // Set background color if preset defines a specific background (e.g. DFA Blue)
    if (preset.bgColor) {
      state.background.color = preset.bgColor;
      updateColorSwatchSelection(preset.bgColor);
    }

    // Show/hide nametag option if preset is Philippine PRC/Civil Service
    if (preset.hasNametagOption && !state.nametag.enabled) {
      const nametagContent = document.getElementById('nametagSectionContent');
      if (nametagContent && nametagContent.classList.contains('hidden')) {
        nametagContent.classList.remove('hidden');
      }
    }

    // Update cropper aspect ratio if cropper is initialized
    if (state.cropper) {
      state.cropper.setAspectRatio(preset.aspectRatio);
      drawBiometricOverlay();
      debouncedUpdatePreview();
    }
  }

  function populateSheetPresets() {
    selectSheetPreset.innerHTML = '';
    SHEET_PRESETS.forEach(sheet => {
      const opt = document.createElement('option');
      opt.value = sheet.id;
      opt.textContent = sheet.name;
      selectSheetPreset.appendChild(opt);
    });
  }

  function populateColorPalette() {
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';

    BACKGROUND_COLORS.forEach((col, idx) => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${idx === 0 ? 'active' : ''}`;
      swatch.style.backgroundColor = col.hex;
      swatch.title = `${col.name} - ${col.note}`;
      swatch.dataset.hex = col.hex;

      swatch.addEventListener('click', () => {
        state.background.color = col.hex;
        updateColorSwatchSelection(col.hex);
        debouncedUpdatePreview();
      });

      palette.appendChild(swatch);
    });

    // Custom color picker input
    const customPicker = document.createElement('input');
    customPicker.type = 'color';
    customPicker.value = '#ffffff';
    customPicker.style.width = '30px';
    customPicker.style.height = '30px';
    customPicker.style.borderRadius = '50%';
    customPicker.style.border = '1px solid #cbd5e1';
    customPicker.style.cursor = 'pointer';
    customPicker.title = 'Choose custom color';
    customPicker.addEventListener('input', e => {
      state.background.color = e.target.value;
      updateColorSwatchSelection(e.target.value);
      debouncedUpdatePreview();
    });
    palette.appendChild(customPicker);
  }

  function updateColorSwatchSelection(hex) {
    document.querySelectorAll('.color-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.hex?.toLowerCase() === hex.toLowerCase());
    });
  }

  // -------------------------------------------------------------
  // Photo Loading & Cropper Setup
  // -------------------------------------------------------------
  function loadPhoto(src) {
    state.imageSrc = src;
    cropperImage.src = src;

    // Transition UI
    uploadSection.classList.add('hidden');
    editorSection.classList.remove('hidden');
    document.getElementById('btnHeaderUpload').classList.remove('hidden');
    document.getElementById('btnHeaderCamera').classList.remove('hidden');

    // Destroy existing cropper if any
    if (state.cropper) {
      state.cropper.destroy();
      state.cropper = null;
    }

    // Initialize Cropper.js
    state.cropper = new Cropper(cropperImage, {
      aspectRatio: state.currentPreset.aspectRatio,
      viewMode: 1, // Restrict crop box to container
      dragMode: 'move',
      autoCropArea: 0.85,
      restore: false,
      guides: false, // Replaced by custom Biometric Guide
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      ready() {
        drawBiometricOverlay();
        updatePreviews();
      },
      crop() {
        drawBiometricOverlay();
        debouncedUpdatePreview();
      },
      zoom() {
        drawBiometricOverlay();
        debouncedUpdatePreview();
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Draw Biometric Guide Overlay directly inside the active Cropper Crop Box!
  function drawBiometricOverlay() {
    const cropBox = document.querySelector('.cropper-crop-box');
    if (!cropBox) return;

    let guideCanvas = cropBox.querySelector('#cropBiometricCanvas');
    if (!guideCanvas) {
      guideCanvas = document.createElement('canvas');
      guideCanvas.id = 'cropBiometricCanvas';
      guideCanvas.style.position = 'absolute';
      guideCanvas.style.top = '0';
      guideCanvas.style.left = '0';
      guideCanvas.style.width = '100%';
      guideCanvas.style.height = '100%';
      guideCanvas.style.pointerEvents = 'none';
      guideCanvas.style.zIndex = '15';
      cropBox.appendChild(guideCanvas);
    }

    if (!state.biometricGuide) {
      guideCanvas.style.display = 'none';
      return;
    }
    guideCanvas.style.display = 'block';

    const w = cropBox.clientWidth;
    const h = cropBox.clientHeight;
    if (w <= 0 || h <= 0) return;

    guideCanvas.width = w;
    guideCanvas.height = h;

    const ctx = guideCanvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    const preset = state.currentPreset;
    const minRatio = preset?.headRatioMin || 0.50;
    const maxRatio = preset?.headRatioMax || 0.69;

    const centerX = w / 2;
    const crownTopY = h * 0.08;
    const avgHeadHeight = h * ((minRatio + maxRatio) / 2);
    const chinY = crownTopY + avgHeadHeight;
    const eyesY = crownTopY + avgHeadHeight * 0.42;

    const minChinY = crownTopY + h * minRatio;
    const maxChinY = crownTopY + h * maxRatio;

    ctx.save();

    // 1. Center vertical guideline (Brand blue: #2f92c4)
    ctx.strokeStyle = 'rgba(47, 146, 196, 0.55)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.stroke();

    // 2. Crown line (Brand gold: #dcb040)
    ctx.strokeStyle = '#dcb040';
    ctx.lineWidth = 1.75;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(w * 0.15, crownTopY);
    ctx.lineTo(w * 0.85, crownTopY);
    ctx.stroke();

    // 3. Eye Level line (Brand primary: #2f92c4)
    ctx.strokeStyle = '#2f92c4';
    ctx.lineWidth = 1.75;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(w * 0.1, eyesY);
    ctx.lineTo(w * 0.9, eyesY);
    ctx.stroke();

    // 4. Chin Zone (Brand purple: #a170b2)
    ctx.fillStyle = 'rgba(161, 112, 178, 0.15)';
    ctx.fillRect(w * 0.15, minChinY, w * 0.7, maxChinY - minChinY);

    ctx.strokeStyle = '#a170b2';
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(w * 0.15, chinY);
    ctx.lineTo(w * 0.85, chinY);
    ctx.stroke();

    // 5. Oval Face Contour (Brand primary: #2f92c4)
    const ovalWidth = w * 0.52;
    const ovalHeight = avgHeadHeight;
    const ovalCenterY = crownTopY + ovalHeight / 2;

    ctx.strokeStyle = '#2f92c4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.ellipse(centerX, ovalCenterY, ovalWidth / 2, ovalHeight / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 6. Shoulders reference curve (Brand teal: #91bfc9)
    ctx.strokeStyle = 'rgba(145, 191, 201, 0.85)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.95);
    ctx.quadraticCurveTo(centerX, chinY + h * 0.14, w, h * 0.95);
    ctx.stroke();

    // 7. Text Labels
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';

    ctx.fillStyle = '#2f92c4';
    ctx.fillText('Eye Level', w - 6, eyesY - 4);

    ctx.fillStyle = '#dcb040';
    ctx.fillText('Top of Head', w - 6, crownTopY - 4);

    ctx.fillStyle = '#a170b2';
    ctx.fillText('Chin Level', w - 6, chinY + 12);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // Rendering Previews (Single Photo & Printable Sheet)
  // -------------------------------------------------------------
  let updateDebounceTimer = null;
  function debouncedUpdatePreview() {
    clearTimeout(updateDebounceTimer);
    updateDebounceTimer = setTimeout(updatePreviews, 100);
  }

  async function updatePreviews() {
    if (!state.cropper) return;

    const preset = state.currentPreset;
    const targetW = preset.pixelWidth || 600;
    const targetH = preset.pixelHeight || 600;

    // 1. Get high-quality cropped canvas from Cropper.js
    const cropped = state.cropper.getCroppedCanvas({
      width: targetW,
      height: targetH,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    if (!cropped) return;

    // 2. Apply adjustments (brightness, contrast, saturation, sharpness, warmth)
    let processed = CanvasUtils.applyAdjustments(cropped, state.adjustments);

    // 3. Apply background replacement if enabled
    if (state.background.enabled) {
      processed = CanvasUtils.replaceBackground(processed, {
        targetColor: state.background.color,
        tolerance: state.background.tolerance,
        feather: state.background.feather
      });
    }

    // 4. Apply Philippine Name Tag Strip if enabled
    if (state.nametag.enabled && state.nametag.fullName) {
      processed = CanvasUtils.applyNameTag(
        processed,
        state.nametag.fullName,
        state.nametag.profession
      );
    }

    // Cache processed canvas
    state.singleCanvasResult = processed;

    // 5. Render onto Single Photo preview canvas
    singlePhotoCanvas.width = processed.width;
    singlePhotoCanvas.height = processed.height;
    const sCtx = singlePhotoCanvas.getContext('2d');
    sCtx.clearRect(0, 0, singlePhotoCanvas.width, singlePhotoCanvas.height);
    sCtx.drawImage(processed, 0, 0);

    // 6. Update Single Photo Specs readout
    specDimText.textContent = `${preset.width} x ${preset.height} ${preset.unit}`;
    specResolutionText.textContent = `${processed.width} x ${processed.height} px`;
    specDpiText.textContent = `${preset.dpi || 300} DPI (HQ)`;

    // Calculate approximate file size
    const blob = await CanvasUtils.canvasToBlob(processed, 'image/jpeg', 0.92);
    const sizeKB = Math.round(blob.size / 1024);
    specFileSizeText.textContent = `~${sizeKB} KB`;

    // Compliance message
    if (preset.maxFileSizeKB && sizeKB <= preset.maxFileSizeKB) {
      complianceText.textContent = `Complies with official ${preset.country} requirements & DV Lottery limit (≤ ${preset.maxFileSizeKB} KB)`;
    } else {
      complianceText.textContent = `Complies with official ${preset.name} dimensions (${preset.width}x${preset.height} ${preset.unit})`;
    }

    // 7. Update Printable Sheet Preview
    updateSheetPreview();
  }

  function updateSheetPreview() {
    if (!state.singleCanvasResult) return;

    const sheetPreset = SHEET_PRESETS.find(s => s.id === state.sheet.presetId) || SHEET_PRESETS[0];

    const result = CanvasUtils.generatePrintSheet(state.singleCanvasResult, sheetPreset, {
      addCutLines: state.sheet.addCutLines,
      addBorders: state.sheet.addBorders
    });

    state.sheetCanvasResult = result.canvas;

    printSheetCanvas.width = result.canvas.width;
    printSheetCanvas.height = result.canvas.height;
    const pCtx = printSheetCanvas.getContext('2d');
    pCtx.clearRect(0, 0, printSheetCanvas.width, printSheetCanvas.height);
    pCtx.drawImage(result.canvas, 0, 0);

    sheetInfoText.textContent = `Fills ${result.totalPhotos} photos on standard ${sheetPreset.name}. Print at CVS/Walgreens/Walmart to save $15+!`;
  }

  // -------------------------------------------------------------
  // Event Listeners Setup
  // -------------------------------------------------------------
  function setupEventListeners() {
    // File upload triggers
    const triggerUpload = () => fileInput.click();
    document.getElementById('btnUpload').addEventListener('click', triggerUpload);
    document.getElementById('btnHeaderUpload').addEventListener('click', triggerUpload);
    uploadSection.addEventListener('click', e => {
      if (!e.target.closest('button')) triggerUpload();
    });

    // Drag and drop handling
    ['dragenter', 'dragover'].forEach(name => {
      uploadSection.addEventListener(name, e => {
        e.preventDefault();
        uploadSection.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      uploadSection.addEventListener(name, e => {
        e.preventDefault();
        uploadSection.classList.remove('drag-over');
      });
    });

    uploadSection.addEventListener('drop', e => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });

    // Sample portrait buttons
    document.getElementById('btnSample1').addEventListener('click', e => {
      e.stopPropagation();
      loadPhoto('sample-1.jpg');
    });

    document.getElementById('btnSample2').addEventListener('click', e => {
      e.stopPropagation();
      loadPhoto('sample-2.jpg');
    });

    // Search and category chips
    presetSearch.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      populatePresets();
    });

    categoryChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      categoryChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeCategory = chip.dataset.category;
      populatePresets();
    });

    // Custom Size Builder
    document.getElementById('toggleCustomSize').addEventListener('click', () => {
      const content = document.getElementById('customSizeContent');
      content.classList.toggle('hidden');
    });

    document.getElementById('btnApplyCustom').addEventListener('click', () => {
      const w = parseFloat(document.getElementById('customWidth').value);
      const h = parseFloat(document.getElementById('customHeight').value);
      const unit = document.getElementById('customUnit').value;
      const dpi = parseInt(document.getElementById('customDpi').value, 10);

      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        alert('Please enter valid positive width and height dimensions.');
        return;
      }

      const pixelW = CanvasUtils.unitToPixels(w, unit, dpi);
      const pixelH = CanvasUtils.unitToPixels(h, unit, dpi);

      const customPreset = {
        id: `custom-${Date.now()}`,
        name: `Custom (${w}x${h} ${unit})`,
        country: 'Custom',
        category: 'standard',
        unit,
        width: w,
        height: h,
        dpi,
        pixelWidth: pixelW,
        pixelHeight: pixelH,
        aspectRatio: pixelW / pixelH,
        bgRecommendation: 'Any',
        bgColor: '#ffffff',
        description: `Custom format: ${w}x${h} ${unit} at ${dpi} DPI (${pixelW}x${pixelH} px)`
      };

      selectPreset(customPreset);
    });

    // Cropper Toolbar Controls
    document.getElementById('btnZoomIn').addEventListener('click', () => {
      state.cropper?.zoom(0.1);
    });

    document.getElementById('btnZoomOut').addEventListener('click', () => {
      state.cropper?.zoom(-0.1);
    });

    document.getElementById('btnResetCrop').addEventListener('click', () => {
      state.cropper?.reset();
      state.fineRotateDeg = 0;
      document.getElementById('rotateSlider').value = 0;
      document.getElementById('rotateValue').textContent = '0°';
    });

    document.getElementById('btnRotateCCW').addEventListener('click', () => {
      state.cropper?.rotate(-90);
    });

    document.getElementById('btnRotateCW').addEventListener('click', () => {
      state.cropper?.rotate(90);
    });

    let isFlippedH = false;
    document.getElementById('btnFlipH').addEventListener('click', () => {
      isFlippedH = !isFlippedH;
      state.cropper?.scaleX(isFlippedH ? -1 : 1);
    });

    // Fine rotation slider (-45 to +45)
    const rotateSlider = document.getElementById('rotateSlider');
    const rotateValue = document.getElementById('rotateValue');
    rotateSlider.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      rotateValue.textContent = `${val}°`;
      const delta = val - state.fineRotateDeg;
      state.cropper?.rotate(delta);
      state.fineRotateDeg = val;
    });

    // Biometric Guide Toggle
    document.getElementById('toggleBiometricGuide').addEventListener('change', e => {
      state.biometricGuide = e.target.checked;
      drawBiometricOverlay();
    });

    // Accordion Expand/Collapse
    ['Bg', 'Adj', 'Nametag'].forEach(key => {
      const title = document.getElementById(`toggle${key}Section`);
      const content = document.getElementById(`${key.toLowerCase()}SectionContent`);
      if (title && content) {
        title.addEventListener('click', () => content.classList.toggle('hidden'));
      }
    });

    // Background replacement toggles & sliders
    const toggleBgReplace = document.getElementById('toggleBgReplace');
    const bgToleranceControls = document.getElementById('bgToleranceControls');
    toggleBgReplace.addEventListener('change', e => {
      state.background.enabled = e.target.checked;
      bgToleranceControls.classList.toggle('hidden', !e.target.checked);
      debouncedUpdatePreview();
    });

    const toleranceSlider = document.getElementById('toleranceSlider');
    const toleranceVal = document.getElementById('toleranceVal');
    toleranceSlider.addEventListener('input', e => {
      state.background.tolerance = parseInt(e.target.value, 10);
      toleranceVal.textContent = e.target.value;
      debouncedUpdatePreview();
    });

    const featherSlider = document.getElementById('featherSlider');
    const featherVal = document.getElementById('featherVal');
    featherSlider.addEventListener('input', e => {
      state.background.feather = parseInt(e.target.value, 10);
      featherVal.textContent = e.target.value;
      debouncedUpdatePreview();
    });

    // Adjustments Sliders
    ['Brightness', 'Contrast', 'Sharpness', 'Warmth'].forEach(prop => {
      const slider = document.getElementById(`slider${prop}`);
      const valSpan = document.getElementById(`val${prop}`);
      if (slider) {
        slider.addEventListener('input', e => {
          const val = parseInt(e.target.value, 10);
          state.adjustments[prop.toLowerCase()] = val;
          valSpan.textContent = val;
          debouncedUpdatePreview();
        });
      }
    });

    // Auto Enhance
    document.getElementById('btnAutoEnhance').addEventListener('click', () => {
      state.adjustments.brightness = 6;
      state.adjustments.contrast = 10;
      state.adjustments.saturation = 8;
      state.adjustments.sharpness = 25;
      state.adjustments.warmth = 2;

      document.getElementById('sliderBrightness').value = 6;
      document.getElementById('sliderContrast').value = 10;
      document.getElementById('sliderSharpness').value = 25;
      document.getElementById('sliderWarmth').value = 2;

      document.getElementById('valBrightness').textContent = '6';
      document.getElementById('valContrast').textContent = '10';
      document.getElementById('valSharpness').textContent = '25';
      document.getElementById('valWarmth').textContent = '2';

      debouncedUpdatePreview();
    });

    // Reset Adjustments
    document.getElementById('btnResetAdjustments').addEventListener('click', () => {
      state.adjustments = { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, warmth: 0 };
      ['Brightness', 'Contrast', 'Sharpness', 'Warmth'].forEach(prop => {
        document.getElementById(`slider${prop}`).value = 0;
        document.getElementById(`val${prop}`).textContent = '0';
      });
      debouncedUpdatePreview();
    });

    // Nametag options
    const toggleNametag = document.getElementById('toggleNametag');
    const nametagInputs = document.getElementById('nametagInputs');
    toggleNametag.addEventListener('change', e => {
      state.nametag.enabled = e.target.checked;
      nametagInputs.classList.toggle('hidden', !e.target.checked);
      debouncedUpdatePreview();
    });

    document.getElementById('nametagFullName').addEventListener('input', e => {
      state.nametag.fullName = e.target.value;
      debouncedUpdatePreview();
    });

    document.getElementById('nametagProfession').addEventListener('input', e => {
      state.nametag.profession = e.target.value;
      debouncedUpdatePreview();
    });

    // Preview Tabs (Single vs Sheet)
    const tabSinglePhoto = document.getElementById('tabSinglePhoto');
    const tabPrintSheet = document.getElementById('tabPrintSheet');
    const viewSinglePhoto = document.getElementById('viewSinglePhoto');
    const viewPrintSheet = document.getElementById('viewPrintSheet');

    tabSinglePhoto.addEventListener('click', () => {
      tabSinglePhoto.classList.add('active');
      tabPrintSheet.classList.remove('active');
      viewSinglePhoto.classList.remove('hidden');
      viewPrintSheet.classList.add('hidden');
      state.activeTab = 'single';
    });

    tabPrintSheet.addEventListener('click', () => {
      tabPrintSheet.classList.add('active');
      tabSinglePhoto.classList.remove('active');
      viewPrintSheet.classList.remove('hidden');
      viewSinglePhoto.classList.add('hidden');
      state.activeTab = 'sheet';
      updateSheetPreview();
    });

    // Sheet Controls
    selectSheetPreset.addEventListener('change', e => {
      state.sheet.presetId = e.target.value;
      updateSheetPreview();
    });

    document.getElementById('toggleCutLines').addEventListener('change', e => {
      state.sheet.addCutLines = e.target.checked;
      updateSheetPreview();
    });

    document.getElementById('toggleBorder').addEventListener('change', e => {
      state.sheet.addBorders = e.target.checked;
      updateSheetPreview();
    });

    // Download Single Photo
    document.getElementById('btnDownloadSingle').addEventListener('click', () => {
      if (!state.singleCanvasResult) return;
      const format = document.getElementById('exportFormat').value;
      const ext = format === 'image/png' ? 'png' : 'jpg';
      const filename = `picshrink-${state.currentPreset.id}-${Date.now()}.${ext}`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = state.singleCanvasResult.toDataURL(format, 0.95);
      link.click();
    });

    // Download DV Lottery / US State Dept Compliant (<= 240 KB)
    document.getElementById('btnDownloadCompliant240').addEventListener('click', async () => {
      if (!state.singleCanvasResult) return;
      const result = await CanvasUtils.exportWithTargetSize(state.singleCanvasResult, 240, 'image/jpeg');
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.download = `picshrink-us-compliant-${Date.now()}.jpg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });

    // Download Sheet as JPG
    document.getElementById('btnDownloadSheetJpg').addEventListener('click', () => {
      if (!state.sheetCanvasResult) return;
      const link = document.createElement('a');
      link.download = `picshrink-sheet-${state.sheet.presetId}-${Date.now()}.jpg`;
      link.href = state.sheetCanvasResult.toDataURL('image/jpeg', 0.95);
      link.click();
    });

    // Download Sheet as PDF
    document.getElementById('btnDownloadSheetPdf').addEventListener('click', () => {
      if (!state.sheetCanvasResult) return;
      const sheetPreset = SHEET_PRESETS.find(s => s.id === state.sheet.presetId) || SHEET_PRESETS[0];

      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF generator library is loading, please try again in a moment.');
        return;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: sheetPreset.orientation,
        unit: 'in',
        format: [sheetPreset.widthInches, sheetPreset.heightInches]
      });

      const imgData = state.sheetCanvasResult.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, sheetPreset.widthInches, sheetPreset.heightInches);
      pdf.save(`picshrink-sheet-${state.sheet.presetId}.pdf`);
    });

    // Print Sheet Directly (100% scale)
    document.getElementById('btnPrintSheetNow').addEventListener('click', () => {
      if (!state.sheetCanvasResult) return;
      const printTarget = document.getElementById('printImageTarget');
      printTarget.src = state.sheetCanvasResult.toDataURL('image/jpeg', 0.95);
      window.print();
    });

    // Webcam Modal Setup
    setupCameraHandlers();
  }

  function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => loadPhoto(e.target.result);
    reader.readAsDataURL(file);
  }

  // -------------------------------------------------------------
  // Webcam Support
  // -------------------------------------------------------------
  function setupCameraHandlers() {
    const cameraModal = document.getElementById('cameraModal');
    const webcamVideo = document.getElementById('webcamVideo');
    const btnCamera = document.getElementById('btnCamera');
    const btnHeaderCamera = document.getElementById('btnHeaderCamera');
    const btnCloseCamera = document.getElementById('btnCloseCamera');
    const btnSnapPhoto = document.getElementById('btnSnapPhoto');
    const countdownEl = document.getElementById('cameraCountdown');
    const guideCanvas = document.getElementById('cameraGuideCanvas');

    const openCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        state.cameraStream = stream;
        webcamVideo.srcObject = stream;
        cameraModal.classList.add('active');

        // Draw camera alignment oval using #2f92c4
        setTimeout(() => {
          guideCanvas.width = webcamVideo.clientWidth || 600;
          guideCanvas.height = webcamVideo.clientHeight || 380;
          const ctx = guideCanvas.getContext('2d');
          const cx = guideCanvas.width / 2;
          const cy = guideCanvas.height / 2;
          ctx.strokeStyle = '#2f92c4';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.ellipse(cx, cy * 0.95, guideCanvas.width * 0.22, guideCanvas.height * 0.40, 0, 0, Math.PI * 2);
          ctx.stroke();
        }, 300);
      } catch (err) {
        alert('Could not access camera. Please check camera permissions or upload a photo.');
        console.error(err);
      }
    };

    const closeCamera = () => {
      if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(t => t.stop());
        state.cameraStream = null;
      }
      cameraModal.classList.remove('active');
      countdownEl.classList.add('hidden');
    };

    btnCamera.addEventListener('click', openCamera);
    btnHeaderCamera.addEventListener('click', openCamera);
    btnCloseCamera.addEventListener('click', closeCamera);

    btnSnapPhoto.addEventListener('click', () => {
      let count = 3;
      countdownEl.textContent = count;
      countdownEl.classList.remove('hidden');

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.textContent = count;
        } else {
          clearInterval(timer);
          countdownEl.classList.add('hidden');

          // Snap frame from video
          const snapCanvas = document.createElement('canvas');
          snapCanvas.width = webcamVideo.videoWidth;
          snapCanvas.height = webcamVideo.videoHeight;
          const sCtx = snapCanvas.getContext('2d');

          // Mirror correction
          sCtx.translate(snapCanvas.width, 0);
          sCtx.scale(-1, 1);
          sCtx.drawImage(webcamVideo, 0, 0);

          closeCamera();
          loadPhoto(snapCanvas.toDataURL('image/jpeg', 0.95));
        }
      }, 900);
    });
  }
});
