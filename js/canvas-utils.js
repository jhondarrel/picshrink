// High-Precision Canvas and Image Processing Utilities for Passport/ID Photos

const CanvasUtils = {
  // Convert any physical or digital unit to pixels at specified DPI
  unitToPixels(value, unit, dpi = 300) {
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) return 0;
    switch (unit.toLowerCase()) {
      case 'in':
      case 'inch':
      case 'inches':
        return Math.round(val * dpi);
      case 'mm':
      case 'millimeter':
      case 'millimeters':
        return Math.round((val / 25.4) * dpi);
      case 'cm':
      case 'centimeter':
      case 'centimeters':
        return Math.round((val / 2.54) * dpi);
      case 'px':
      case 'pixel':
      case 'pixels':
      default:
        return Math.round(val);
    }
  },

  // Apply visual adjustments (brightness, contrast, saturation, sharpness, warmth)
  applyAdjustments(sourceCanvas, options = {}) {
    const {
      brightness = 0, // -50 to +50
      contrast = 0,   // -50 to +50
      saturation = 0, // -50 to +50
      sharpness = 0,  // 0 to 80
      warmth = 0      // -40 to +40
    } = options;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = sourceCanvas.width;
    outCanvas.height = sourceCanvas.height;
    const ctx = outCanvas.getContext('2d');

    // Build CSS filter string for high-speed hardware-accelerated processing
    const bVal = 100 + brightness;
    const cVal = 100 + contrast;
    const sVal = 100 + saturation;
    ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%)`;
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.filter = 'none';

    // Apply color warmth or sharpness if specified
    if (warmth !== 0 || sharpness > 0) {
      const imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
      const data = imgData.data;

      // Color warmth adjustment
      if (warmth !== 0) {
        for (let i = 0; i < data.length; i += 4) {
          if (warmth > 0) {
            // warmer: increase red, decrease blue
            data[i] = Math.min(255, data[i] + warmth * 0.4);
            data[i + 2] = Math.max(0, data[i + 2] - warmth * 0.3);
          } else {
            // cooler: increase blue, decrease red
            data[i] = Math.max(0, data[i] + warmth * 0.3);
            data[i + 2] = Math.min(255, data[i + 2] - warmth * 0.4);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Unsharp mask convolution filter for sharpness
      if (sharpness > 0) {
        this.applySharpenKernel(ctx, outCanvas.width, outCanvas.height, (sharpness / 100) * 0.7);
      }
    }

    return outCanvas;
  },

  // 3x3 Sharpen Kernel Convolution
  applySharpenKernel(ctx, width, height, amount = 0.5) {
    const srcData = ctx.getImageData(0, 0, width, height);
    const src = srcData.data;
    const outData = ctx.createImageData(width, height);
    const dst = outData.data;

    // Convolution weight calculation
    const center = 1 + 4 * amount;
    const edge = -amount;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          const up = ((y - 1) * width + x) * 4 + c;
          const down = ((y + 1) * width + x) * 4 + c;
          const left = (y * width + (x - 1)) * 4 + c;
          const right = (y * width + (x + 1)) * 4 + c;

          const val =
            src[idx + c] * center +
            (src[up] + src[down] + src[left] + src[right]) * edge;

          dst[idx + c] = Math.max(0, Math.min(255, val));
        }
        dst[idx + 3] = src[idx + 3];
      }
    }

    // Copy border pixels directly
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          const idx = (y * width + x) * 4;
          dst[idx] = src[idx];
          dst[idx + 1] = src[idx + 1];
          dst[idx + 2] = src[idx + 2];
          dst[idx + 3] = src[idx + 3];
        }
      }
    }

    ctx.putImageData(outData, 0, 0);
  },

  // Smart Background Color Replacement with Perimeter-Connected Seed Fill
  // This ensures that the subject's face, eyes, and interior clothing are protected
  // and only contiguous background connected to the borders is replaced.
  replaceBackground(sourceCanvas, options = {}) {
    const {
      targetColor = '#ffffff',
      sampleColor = null,
      tolerance = 28,
      feather = 2
    } = options;

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const targetRgb = this.hexToRgb(targetColor) || { r: 255, g: 255, b: 255 };

    // Determine seed background color
    let bgR = 0, bgG = 0, bgB = 0;
    if (sampleColor) {
      const s = this.hexToRgb(sampleColor);
      bgR = s.r; bgG = s.g; bgB = s.b;
    } else {
      // Sample 6 perimeter points (top corners and upper sides)
      const samplePoints = [
        [3, 3],
        [width - 4, 3],
        [8, 8],
        [width - 9, 8],
        [Math.floor(width / 2), 3],
        [3, Math.floor(height * 0.25)],
        [width - 4, Math.floor(height * 0.25)]
      ];
      let count = 0;
      samplePoints.forEach(([x, y]) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
          count++;
        }
      });
      bgR = Math.round(bgR / count);
      bgG = Math.round(bgG / count);
      bgB = Math.round(bgB / count);
    }

    const tolSq = tolerance * tolerance * 3;
    const mask = new Uint8Array(width * height); // 0 = foreground, 255 = background

    // Breadth-First-Search from perimeter seeds
    const queueX = [];
    const queueY = [];

    // Push top border, upper left and upper right borders as initial seeds
    for (let x = 0; x < width; x++) {
      queueX.push(x);
      queueY.push(0);
      mask[x] = 1;
    }
    for (let y = 1; y < Math.floor(height * 0.85); y++) {
      queueX.push(0);
      queueY.push(y);
      mask[y * width] = 1;

      queueX.push(width - 1);
      queueY.push(y);
      mask[y * width + (width - 1)] = 1;
    }

    let head = 0;
    while (head < queueX.length) {
      const cx = queueX[head];
      const cy = queueY[head];
      head++;

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let n = 0; n < 4; n++) {
        const nx = neighbors[n][0];
        const ny = neighbors[n][1];

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (mask[nIdx] === 0) {
            const pIdx = nIdx * 4;
            const r = data[pIdx];
            const g = data[pIdx + 1];
            const b = data[pIdx + 2];

            const diffR = r - bgR;
            const diffG = g - bgG;
            const diffB = b - bgB;
            const distSq = diffR * diffR + diffG * diffG + diffB * diffB;

            if (distSq <= tolSq) {
              mask[nIdx] = 1;
              queueX.push(nx);
              queueY.push(ny);
            }
          }
        }
      }
    }

    // Blend background pixels with target color
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const mIdx = y * width + x;
        if (mask[mIdx] === 1) {
          const idx = mIdx * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const diffR = r - bgR;
          const diffG = g - bgG;
          const diffB = b - bgB;
          const distSq = diffR * diffR + diffG * diffG + diffB * diffB;
          const ratio = Math.min(1, Math.sqrt(distSq / tolSq));
          const blend = Math.pow(1 - ratio * 0.4, 1.5);

          data[idx] = Math.round(r * (1 - blend) + targetRgb.r * blend);
          data[idx + 1] = Math.round(g * (1 - blend) + targetRgb.g * blend);
          data[idx + 2] = Math.round(b * (1 - blend) + targetRgb.b * blend);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  },

  // Philippine PRC / Civil Service standard name tag banner
  applyNameTag(sourceCanvas, nameText, titleText = '') {
    if (!nameText || !nameText.trim()) return sourceCanvas;

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0);

    // Name tag occupies ~16% of photo height at bottom
    const tagHeight = Math.round(height * 0.16);
    const tagY = height - tagHeight;

    // White tag background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, tagY, width, tagHeight);

    // Top border line
    ctx.lineWidth = Math.max(1, Math.round(width * 0.005));
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, tagY);
    ctx.lineTo(width, tagY);
    ctx.stroke();

    // Text formatting
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const hasTitle = titleText && titleText.trim().length > 0;

    if (hasTitle) {
      // Two lines: Name on top, Title/Date on bottom
      const nameFontSize = Math.round(tagHeight * 0.38);
      const titleFontSize = Math.round(tagHeight * 0.28);

      ctx.font = `bold ${nameFontSize}px Arial, "Helvetica Neue", sans-serif`;
      ctx.fillText(nameText.toUpperCase().trim(), width / 2, tagY + tagHeight * 0.38);

      ctx.font = `normal ${titleFontSize}px Arial, "Helvetica Neue", sans-serif`;
      ctx.fillStyle = '#333333';
      ctx.fillText(titleText.toUpperCase().trim(), width / 2, tagY + tagHeight * 0.74);
    } else {
      // Single line: centered name
      const nameFontSize = Math.round(tagHeight * 0.48);
      ctx.font = `bold ${nameFontSize}px Arial, "Helvetica Neue", sans-serif`;
      ctx.fillText(nameText.toUpperCase().trim(), width / 2, tagY + tagHeight * 0.52);
    }

    return canvas;
  },

  // Print Sheet Tiling Engine
  // Arranges multiple copies of photoCanvas on a sheetCanvas with cut guides
  generatePrintSheet(photoCanvas, sheetPreset, options = {}) {
    const {
      maxPhotos = null,
      addCutLines = true,
      addBorders = true,
      borderColor = '#D1D5DB',
      marginInches = 0.25,
      gapInches = 0.12
    } = options;

    const dpi = 300;
    const sheetW = sheetPreset.widthPx || Math.round(sheetPreset.widthInches * dpi);
    const sheetH = sheetPreset.heightPx || Math.round(sheetPreset.heightInches * dpi);

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;
    const ctx = sheetCanvas.getContext('2d');

    // Solid white paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const photoW = photoCanvas.width;
    const photoH = photoCanvas.height;

    const marginPx = Math.round(marginInches * dpi);
    const gapPx = Math.round(gapInches * dpi);

    const printableW = sheetW - 2 * marginPx;
    const printableH = sheetH - 2 * marginPx;

    // Calculate grid capacity
    const cols = Math.floor((printableW + gapPx) / (photoW + gapPx));
    const rows = Math.floor((printableH + gapPx) / (photoH + gapPx));

    if (cols <= 0 || rows <= 0) {
      ctx.drawImage(photoCanvas, 0, 0, Math.min(sheetW, photoW), Math.min(sheetH, photoH));
      return { canvas: sheetCanvas, totalPhotos: 1, cols: 1, rows: 1 };
    }

    const totalCapacity = cols * rows;
    const count = maxPhotos ? Math.min(maxPhotos, totalCapacity) : totalCapacity;

    // Center the grid on the sheet
    const actualGridW = cols * photoW + (cols - 1) * gapPx;
    const actualGridH = rows * photoH + (rows - 1) * gapPx;
    const startX = Math.round((sheetW - actualGridW) / 2);
    const startY = Math.round((sheetH - actualGridH) / 2);

    const photoPlacements = [];

    let placed = 0;
    for (let r = 0; r < rows && placed < count; r++) {
      for (let c = 0; c < cols && placed < count; c++) {
        const x = startX + c * (photoW + gapPx);
        const y = startY + r * (photoH + gapPx);

        // Draw photo
        ctx.drawImage(photoCanvas, x, y, photoW, photoH);

        // Optional photo border (for easy cutting on white paper)
        if (addBorders) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 0.5, y - 0.5, photoW + 1, photoH + 1);
        }

        photoPlacements.push({ x, y, w: photoW, h: photoH });
        placed++;
      }
    }

    // Draw Cutting Guides
    if (addCutLines) {
      this.drawCutGuidelines(ctx, sheetW, sheetH, photoPlacements);
    }

    // Watermark info
    ctx.save();
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.fillText(
      `picshrink • ${sheetPreset.name} • 300 DPI Print-Ready • Print at 100% Scale (Actual Size / No Fit)`,
      sheetW / 2,
      sheetH - Math.max(16, marginPx / 2)
    );
    ctx.restore();

    return {
      canvas: sheetCanvas,
      totalPhotos: placed,
      cols,
      rows,
      capacity: totalCapacity
    };
  },

  // Draw clean scissor cut lines and tick marks
  drawCutGuidelines(ctx, sheetW, sheetH, placements) {
    if (!placements.length) return;

    ctx.save();
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    placements.forEach(p => {
      const tick = 12;

      ctx.beginPath();
      // Top-Left corner ticks
      ctx.moveTo(p.x - tick, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.moveTo(p.x, p.y - tick);
      ctx.lineTo(p.x, p.y);

      // Top-Right corner ticks
      ctx.moveTo(p.x + p.w + tick, p.y);
      ctx.lineTo(p.x + p.w);
      ctx.moveTo(p.x + p.w, p.y - tick);
      ctx.lineTo(p.x + p.w);

      // Bottom-Left corner ticks
      ctx.moveTo(p.x - tick, p.y + p.h);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.moveTo(p.x, p.y + p.h + tick);
      ctx.lineTo(p.x, p.y + p.h);

      // Bottom-Right corner ticks
      ctx.moveTo(p.x + p.w + tick, p.y + p.h);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.moveTo(p.x + p.w, p.y + p.h + tick);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.stroke();
    });

    ctx.restore();
  },

  // Export canvas to Blob with target file size limit (e.g. max 240 KB for US State Dept)
  async exportWithTargetSize(canvas, targetMaxKB = 240, format = 'image/jpeg') {
    let quality = 0.95;
    let blob = await this.canvasToBlob(canvas, format, quality);

    if (!targetMaxKB || blob.size <= targetMaxKB * 1024) {
      return { blob, quality, sizeKB: Math.round(blob.size / 1024) };
    }

    // Iteratively decrease quality until file size matches target
    while (quality > 0.2 && blob.size > targetMaxKB * 1024) {
      quality -= 0.08;
      blob = await this.canvasToBlob(canvas, format, quality);
    }

    return { blob, quality, sizeKB: Math.round(blob.size / 1024) };
  },

  canvasToBlob(canvas, mimeType = 'image/jpeg', quality = 0.92) {
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), mimeType, quality);
    });
  },

  // Utility to parse hex color to { r, g, b }
  hexToRgb(hex) {
    if (!hex) return null;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasUtils;
}
