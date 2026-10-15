/**
 * 智光商職 資處一仁【多媒體製作與應用】學習數位通 互動邏輯腳本
 * 包含：主題切換、關鍵字檢索、段考三大計算機、視覺實驗室、高頻段考刷題系統
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSearch();
  initNavScroll();
  initImageCalculator();
  initPrintCalculator();
  initAudioCalculator();
  initVisualLab();
  initQuizSystem();
  initPrintTrigger();
});

/* ==========================================================================
   1. 深淺主題切換 (Theme Toggle)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('zk_theme') || 'dark';

  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }

  toggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('zk_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('zk_theme', 'light');
    }
  });
}

/* ==========================================================================
   2. 全域關鍵字搜尋 (Global Search & Filter)
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const unitCards = document.querySelectorAll('.unit-card');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length > 0) {
      clearBtn.style.display = 'block';
    } else {
      clearBtn.style.display = 'none';
    }

    unitCards.forEach(card => {
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const text = card.textContent.toLowerCase();

      if (query === '' || keywords.includes(query) || text.includes(query)) {
        card.style.display = '';
        if (query !== '') {
          card.classList.add('highlight-matched');
        } else {
          card.classList.remove('highlight-matched');
        }
      } else {
        card.style.display = 'none';
        card.classList.remove('highlight-matched');
      }
    });
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    unitCards.forEach(card => {
      card.style.display = '';
      card.classList.remove('highlight-matched');
    });
    searchInput.focus();
  });
}

/* ==========================================================================
   3. 快速分頁導覽與捲動 (Navigation Pills)
   ========================================================================== */
function initNavScroll() {
  const navPills = document.querySelectorAll('.nav-pill');

  navPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      navPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // 捲動監聽更新 Active 狀態
  window.addEventListener('scroll', () => {
    const sections = ['units', 'calculators', 'interactive-lab', 'quiz-zone', 'cheat-sheet'];
    const scrollPos = window.scrollY + 160;

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          navPills.forEach(p => {
            if (p.getAttribute('data-target') === id) {
              p.classList.add('active');
            } else {
              p.classList.remove('active');
            }
          });
        }
      }
    });
  });
}

/* ==========================================================================
   4. 段考計算機 1：點陣圖未壓縮檔案容量計算
   ========================================================================== */
function initImageCalculator() {
  const wInput = document.getElementById('imgWidth');
  const hInput = document.getElementById('imgHeight');
  const dSelect = document.getElementById('imgColorDepth');

  function calculate() {
    const w = parseFloat(wInput.value) || 0;
    const h = parseFloat(hInput.value) || 0;
    const depth = parseInt(dSelect.value, 10) || 24;

    const totalPixels = w * h;
    const totalBits = totalPixels * depth;
    const totalBytes = totalBits / 8;
    const totalKB = totalBytes / 1024;
    const totalMB = totalKB / 1024;

    const displayEl = document.getElementById('imgResultDisplay');
    const stepsEl = document.getElementById('imgResultSteps');

    let formattedResult = '';
    if (totalMB >= 1) {
      formattedResult = `${totalMB.toFixed(2)} MB`;
    } else if (totalKB >= 1) {
      formattedResult = `${totalKB.toFixed(2)} KB`;
    } else {
      formattedResult = `${totalBytes.toFixed(0)} Bytes`;
    }

    displayEl.textContent = formattedResult;

    stepsEl.innerHTML = `
      <strong>🧮 詳細計算推導過程：</strong><br>
      1. 總像素量：${w} × ${h} = <strong>${totalPixels.toLocaleString()} 像素 (px)</strong><br>
      2. 總位元數：${totalPixels.toLocaleString()} × ${depth} bits = <strong>${totalBits.toLocaleString()} bits</strong><br>
      3. 轉成位元組 (Bytes)：${totalBits.toLocaleString()} ÷ 8 = <strong>${totalBytes.toLocaleString()} Bytes</strong><br>
      4. 轉成 KB：${totalBytes.toLocaleString()} ÷ 1024 = <strong>${totalKB.toFixed(2)} KB</strong><br>
      5. 轉成 MB：${totalKB.toFixed(2)} ÷ 1024 = <strong>${totalMB.toFixed(2)} MB</strong>
    `;
  }

  wInput.addEventListener('input', calculate);
  hInput.addEventListener('input', calculate);
  dSelect.addEventListener('change', calculate);

  // 初始化首次計算
  calculate();
}

window.setImgPreset = function(w, h, depth) {
  document.getElementById('imgWidth').value = w;
  document.getElementById('imgHeight').value = h;
  document.getElementById('imgColorDepth').value = depth;
  document.getElementById('imgWidth').dispatchEvent(new Event('input'));
};

/* ==========================================================================
   5. 段考計算機 2：照片印刷尺寸與 DPI 換算
   ========================================================================== */
let currentPrintMode = 'pxToInch';

function initPrintCalculator() {
  renderPrintForm();
}

window.switchPrintMode = function(mode) {
  currentPrintMode = mode;
  document.getElementById('btnModePxToInch').classList.toggle('active', mode === 'pxToInch');
  document.getElementById('btnModeInchToPx').classList.toggle('active', mode === 'inchToPx');
  renderPrintForm();
};

function renderPrintForm() {
  const container = document.getElementById('printFormFields');
  if (currentPrintMode === 'pxToInch') {
    container.innerHTML = `
      <div class="form-row">
        <label for="printWidthPx">照片寬度 (像素 px)</label>
        <input type="number" id="printWidthPx" value="1200" min="1">
      </div>
      <div class="form-row">
        <label for="printHeightPx">照片高度 (像素 px)</label>
        <input type="number" id="printHeightPx" value="1800" min="1">
      </div>
      <div class="form-row">
        <label for="printDpiVal">印刷解析度 (DPI)</label>
        <input type="number" id="printDpiVal" value="300" min="1">
      </div>
    `;
    const w = document.getElementById('printWidthPx');
    const h = document.getElementById('printHeightPx');
    const dpi = document.getElementById('printDpiVal');

    function calcPxToInch() {
      const wPx = parseFloat(w.value) || 0;
      const hPx = parseFloat(h.value) || 0;
      const d = parseFloat(dpi.value) || 300;

      const wInch = wPx / d;
      const hInch = hPx / d;
      const wCm = wInch * 2.54;
      const hCm = hInch * 2.54;

      document.getElementById('printResultDisplay').textContent = `${wInch.toFixed(1)} × ${hInch.toFixed(1)} 英吋 (${wCm.toFixed(1)} × ${hCm.toFixed(1)} 公分)`;
      document.getElementById('printResultSteps').innerHTML = `
        <strong>🧮 印刷英吋換算過程：</strong><br>
        1. 印刷寬度：${wPx} px ÷ ${d} DPI = <strong>${wInch.toFixed(2)} 吋</strong> (約 ${wCm.toFixed(2)} cm)<br>
        2. 印刷高度：${hPx} px ÷ ${d} DPI = <strong>${hInch.toFixed(2)} 吋</strong> (約 ${hCm.toFixed(2)} cm)<br>
        💡 提示：1 英吋 (Inch) = 2.54 公分 (cm)；高品質相片沖洗標準為 300 DPI。
      `;
    }

    w.addEventListener('input', calcPxToInch);
    h.addEventListener('input', calcPxToInch);
    dpi.addEventListener('input', calcPxToInch);
    calcPxToInch();

  } else {
    container.innerHTML = `
      <div class="form-row">
        <label for="printWidthInch">想要沖洗的相片寬度 (英吋)</label>
        <input type="number" id="printWidthInch" value="4" min="0.1" step="0.5">
      </div>
      <div class="form-row">
        <label for="printHeightInch">想要沖洗的相片高度 (英吋)</label>
        <input type="number" id="printHeightInch" value="6" min="0.1" step="0.5">
      </div>
      <div class="form-row">
        <label for="printDpiReq">要求解析度 (DPI)</label>
        <input type="number" id="printDpiReq" value="300" min="1">
      </div>
    `;
    const w = document.getElementById('printWidthInch');
    const h = document.getElementById('printHeightInch');
    const dpi = document.getElementById('printDpiReq');

    function calcInchToPx() {
      const wInch = parseFloat(w.value) || 0;
      const hInch = parseFloat(h.value) || 0;
      const d = parseFloat(dpi.value) || 300;

      const wPx = Math.round(wInch * d);
      const hPx = Math.round(hInch * d);
      const totalPixels = wPx * hPx;
      const megaPixels = totalPixels / 1000000;

      document.getElementById('printResultDisplay').textContent = `${wPx} × ${hPx} 像素 (約 ${megaPixels.toFixed(1)} 萬畫素)`;
      document.getElementById('printResultSteps').innerHTML = `
        <strong>🧮 所需像素換算過程：</strong><br>
        1. 寬度所需像素：${wInch} 吋 × ${d} DPI = <strong>${wPx} px</strong><br>
        2. 高度所需像素：${hInch} 吋 × ${d} DPI = <strong>${hPx} px</strong><br>
        3. 總像素總量：${wPx} × ${hPx} = <strong>${totalPixels.toLocaleString()} 像素</strong> (約 ${(totalPixels/10000).toFixed(0)} 萬畫素)<br>
        💡 結論：相機拍照只要達 ${megaPixels.toFixed(1)} 萬畫素以上，即可無損印出 ${wInch}×${hInch} 吋 300 DPI 照片！
      `;
    }

    w.addEventListener('input', calcInchToPx);
    h.addEventListener('input', calcInchToPx);
    dpi.addEventListener('input', calcInchToPx);
    calcInchToPx();
  }
}

window.setPrintPreset = function(w, h, dpi) {
  if (currentPrintMode === 'pxToInch') {
    if (w < 50) {
      // 傳入的是英吋，切換至 inchToPx
      switchPrintMode('inchToPx');
      document.getElementById('printWidthInch').value = w;
      document.getElementById('printHeightInch').value = h;
      document.getElementById('printDpiReq').value = dpi;
      document.getElementById('printWidthInch').dispatchEvent(new Event('input'));
    } else {
      document.getElementById('printWidthPx').value = w;
      document.getElementById('printHeightPx').value = h;
      document.getElementById('printDpiVal').value = dpi;
      document.getElementById('printWidthPx').dispatchEvent(new Event('input'));
    }
  } else {
    if (w > 50) {
      switchPrintMode('pxToInch');
      document.getElementById('printWidthPx').value = w;
      document.getElementById('printHeightPx').value = h;
      document.getElementById('printDpiVal').value = dpi;
      document.getElementById('printWidthPx').dispatchEvent(new Event('input'));
    } else {
      document.getElementById('printWidthInch').value = w;
      document.getElementById('printHeightInch').value = h;
      document.getElementById('printDpiReq').value = dpi;
      document.getElementById('printWidthInch').dispatchEvent(new Event('input'));
    }
  }
};

/* ==========================================================================
   6. 段考計算機 3：未壓縮音訊 (WAV) 容量計算
   ========================================================================== */
function initAudioCalculator() {
  const rateSelect = document.getElementById('audioSampleRate');
  const depthSelect = document.getElementById('audioBitDepth');
  const channelSelect = document.getElementById('audioChannels');
  const minInput = document.getElementById('audioMinutes');
  const secInput = document.getElementById('audioSeconds');

  function calculateAudio() {
    const rate = parseFloat(rateSelect.value) || 44100;
    const depth = parseInt(depthSelect.value, 10) || 16;
    const channels = parseInt(channelSelect.value, 10) || 2;
    const mins = parseFloat(minInput.value) || 0;
    const secs = parseFloat(secInput.value) || 0;

    const totalSeconds = (mins * 60) + secs;
    const totalBytes = (rate * depth * channels * totalSeconds) / 8;
    const totalKB = totalBytes / 1024;
    const totalMB = totalKB / 1024;

    const displayEl = document.getElementById('audioResultDisplay');
    const stepsEl = document.getElementById('audioResultSteps');

    displayEl.textContent = `約 ${totalMB.toFixed(2)} MB (${totalBytes.toLocaleString()} Bytes)`;

    stepsEl.innerHTML = `
      <strong>🧮 音訊容量推導過程：</strong><br>
      1. 錄音時間總秒數：(${mins} 分 × 60) + ${secs} 秒 = <strong>${totalSeconds} 秒</strong><br>
      2. 聲道數：${channels === 2 ? '立體聲 (Stereo = 2)' : '單聲道 (Mono = 1)'}<br>
      3. 公式計算 Bytes：(${rate.toLocaleString()} Hz × ${depth} bits × ${channels} × ${totalSeconds} 秒) ÷ 8<br>
         = <strong>${totalBytes.toLocaleString()} Bytes</strong><br>
      4. 換算成 MB：${totalBytes.toLocaleString()} ÷ 1024 ÷ 1024 = <strong>${totalMB.toFixed(2)} MB</strong>
    `;
  }

  rateSelect.addEventListener('change', calculateAudio);
  depthSelect.addEventListener('change', calculateAudio);
  channelSelect.addEventListener('change', calculateAudio);
  minInput.addEventListener('input', calculateAudio);
  secInput.addEventListener('input', calculateAudio);

  calculateAudio();
}

window.setAudioPreset = function(rate, depth, channels, mins, secs) {
  document.getElementById('audioSampleRate').value = rate;
  document.getElementById('audioBitDepth').value = depth;
  document.getElementById('audioChannels').value = channels;
  document.getElementById('audioMinutes').value = mins;
  document.getElementById('audioSeconds').value = secs;
  document.getElementById('audioMinutes').dispatchEvent(new Event('input'));
};

/* ==========================================================================
   7. 視覺觀念實驗室 (Interactive Lab)
   ========================================================================== */
function initVisualLab() {
  // 實驗 1: 點陣圖 vs 向量圖縮放
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomText = document.getElementById('zoomLevelText');
  const bitmapCanvas = document.getElementById('bitmapCanvas');
  const vectorSvg = document.getElementById('vectorSvg');

  // 在低解析度點陣 Canvas 上繪製幾何圖案以凸顯像素顆粒
  function drawBaseBitmap() {
    const ctx = bitmapCanvas.getContext('2d');
    ctx.clearRect(0, 0, 220, 180);
    
    // 繪製背景漸層圓
    const grad = ctx.createLinearGradient(0, 0, 220, 180);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(110, 90, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // 繪製星星
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(110, 45);
    ctx.lineTo(125, 75);
    ctx.lineTo(160, 80);
    ctx.lineTo(135, 105);
    ctx.lineTo(140, 140);
    ctx.lineTo(110, 120);
    ctx.lineTo(80, 140);
    ctx.lineTo(85, 105);
    ctx.lineTo(60, 80);
    ctx.lineTo(95, 75);
    ctx.closePath();
    ctx.fill();
  }
  drawBaseBitmap();

  zoomSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    zoomText.textContent = `${val}%`;
    const scale = val / 100;

    // 點陣圖利用 CSS 放大並啟用 pixelated 呈現鋸齒破圖
    bitmapCanvas.style.transform = `scale(${scale})`;
    bitmapCanvas.style.imageRendering = 'pixelated';
    bitmapCanvas.style.transformOrigin = 'center center';

    // 向量圖放大永遠銳利
    vectorSvg.style.transform = `scale(${scale})`;
    vectorSvg.style.transformOrigin = 'center center';
  });

  // 實驗 2: RGB 混色器
  const sliderR = document.getElementById('sliderR');
  const sliderG = document.getElementById('sliderG');
  const sliderB = document.getElementById('sliderB');
  const rVal = document.getElementById('rVal');
  const gVal = document.getElementById('gVal');
  const bVal = document.getElementById('bVal');
  const colorCircle = document.getElementById('rgbColorCircle');
  const hexDisplay = document.getElementById('rgbHexDisplay');
  const descDisplay = document.getElementById('rgbDescDisplay');

  function updateRGB() {
    const r = parseInt(sliderR.value, 10);
    const g = parseInt(sliderG.value, 10);
    const b = parseInt(sliderB.value, 10);

    rVal.textContent = r;
    gVal.textContent = g;
    bVal.textContent = b;

    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    colorCircle.style.backgroundColor = rgbColor;

    // 轉成 Hex
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    hexDisplay.textContent = hex;

    let desc = '';
    if (r === 255 && g === 255 && b === 255) {
      desc = '✨ 全開為純白 (光線全疊加，加色法極致)';
    } else if (r === 0 && g === 0 && b === 0) {
      desc = '🌑 無光為純黑';
    } else if (r === 255 && g === 255 && b === 0) {
      desc = '🟡 紅光 + 綠光 = 黃色 (Yellow)';
    } else if (r === 0 && g === 255 && b === 255) {
      desc = '🔷 綠光 + 藍光 = 青色 (Cyan)';
    } else if (r === 255 && g === 0 && b === 255) {
      desc = '🟣 紅光 + 藍光 = 洋紅色 (Magenta)';
    } else {
      desc = `動態加色混光 (${r}, ${g}, ${b})`;
    }
    descDisplay.textContent = desc;
  }

  sliderR.addEventListener('input', updateRGB);
  sliderG.addEventListener('input', updateRGB);
  sliderB.addEventListener('input', updateRGB);
  updateRGB();

  window.setRGB = function(r, g, b) {
    sliderR.value = r;
    sliderG.value = g;
    sliderB.value = b;
    updateRGB();
  };

  // 實驗 3: 遮色片「白顯、黑遮、灰半透」
  const maskSlider = document.getElementById('maskSlider');
  const maskValText = document.getElementById('maskValText');
  const maskTopLayer = document.getElementById('maskTopLayer');
  const maskExpText = document.getElementById('maskExpText');

  maskSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    const opacity = (val / 255).toFixed(2);
    maskTopLayer.style.opacity = opacity;

    if (val === 255) {
      maskValText.textContent = `純白 (${val})`;
      maskExpText.innerHTML = `目前狀態：遮色片為<strong>純白色 (255)</strong>，上層圖層 100% 完整顯示。`;
    } else if (val === 0) {
      maskValText.textContent = `純黑 (${val})`;
      maskExpText.innerHTML = `目前狀態：遮色片為<strong>純黑色 (0)</strong>，上層圖層完全隱藏透明，直接露出底層棋盤格！<strong>（口訣：黑遮）</strong>`;
    } else {
      const pct = Math.round((val / 255) * 100);
      maskValText.textContent = `灰色 (${val})`;
      maskExpText.innerHTML = `目前狀態：遮色片為<strong>灰色 (${val})</strong>，上層呈現 <strong>${pct}% 半透明</strong>！<strong>（口訣：灰半透）</strong>`;
    }
  });
}

/* ==========================================================================
   8. 高一上學期 段考實戰刷題系統 (Quiz System)
   ========================================================================== */
const quizQuestions = [
  {
    category: "多媒體概論",
    question: "下列哪一種多媒體元素，在傳遞訊息時最精確、直接，且佔用的儲存空間通常最小？",
    options: ["文字 (Text)", "音訊 (Audio)", "影像 (Image)", "視訊 (Video)"],
    answerIndex: 0,
    explanation: "文字是多媒體最基礎且容量最小的媒介，傳達概念最精準直接。"
  },
  {
    category: "數位文字",
    question: "在設計投影片簡報、看板大標題或手機 App 介面時，通常推薦優先選用何種字型以提升螢幕易讀性？",
    options: ["新細明體（襯線體）", "標楷體（襯線體）", "微軟正黑體（無襯線體）", "Times New Roman"],
    answerIndex: 2,
    explanation: "無襯線體（如微軟正黑體、Arial）筆畫粗細均勻、無額外裝飾端點，在低解析度或手機螢幕上清晰易讀。"
  },
  {
    category: "影像處理",
    question: "資處科小仁要為班級園遊會繪製商標 (Logo) 與吉祥物圖示，希望日後輸出無論放大多少倍都不失真，應選擇何種檔案格式？",
    options: ["JPG", "SVG", "PNG", "GIF"],
    answerIndex: 1,
    explanation: "SVG 是基於 XML 語法的向量圖格式，利用數學方程式記錄路徑，放大縮小永遠不失真。"
  },
  {
    category: "色彩原理",
    question: "電腦螢幕或智慧型手機顯示畫面時，所採用的色彩模式與原理為何？",
    options: [
      "CMYK 模式，為減色法",
      "RGB 模式，為加色法，三色光疊加時為白色",
      "RGB 模式，為減色法，三色光疊加時為黑色",
      "HSB 模式，無法調整亮度"
    ],
    answerIndex: 1,
    explanation: "螢幕自己會發光，採用光的三原色 RGB（加色法），數值全為 255 時疊加為純白光。"
  },
  {
    category: "色彩深度",
    question: "一張 24 位元全彩 (True Color) 的數位影像，其每個像素理論上最多能呈現多少種顏色？",
    options: ["256 色", "65,536 色", "約 1,677 萬色", "32 萬色"],
    answerIndex: 2,
    explanation: "24-bit 即 2 的 24 次方（R、G、B 各佔 8 bits，共 256×256×256 = 16,777,216 色），約 1677 萬色。"
  },
  {
    category: "影像格式",
    question: "在網頁設計中，若需要製作一個「背景透明、邊緣平滑無鋸齒」的按鈕圖案，最適合儲存為何種格式？",
    options: ["JPEG", "BMP", "PNG", "MP3"],
    answerIndex: 2,
    explanation: "PNG 支援 Alpha 通道半透明與非破壞性壓縮，為網頁透明去背按鈕首選；JPEG 則完全不支援透明。"
  },
  {
    category: "Photoshop 實務",
    question: "在 Photoshop 的圖層遮色片 (Layer Mask) 編輯中，下列關於色彩功能的敘述何者完全正確？",
    options: [
      "塗白色會遮蔽隱藏該圖層內容",
      "塗黑色代表將圖像染成黑色顏料",
      "「白顯、黑遮、灰半透」：遮色片塗黑處會變透明隱藏並透出底層",
      "遮色片不能調整灰階透明度"
    ],
    answerIndex: 2,
    explanation: "圖層遮色片為非破壞性編輯，白代表顯示、黑代表遮蔽隱藏（變透明露出底層）、灰代表半透明。"
  },
  {
    category: "聲音原理",
    question: "當我們聆聽管弦樂團演奏時，能清楚分辨「鋼琴」與「小提琴」即使發出相同音高與音量，是因為兩者的何者不同？",
    options: ["響度 (振幅)", "音調 (頻率)", "音色 (波形)", "聲道數"],
    answerIndex: 2,
    explanation: "音色由音波的「波形」與諧波泛音決定，是分辨發音體特質的唯一依據。"
  },
  {
    category: "數位音訊",
    question: "標準音樂 CD 的取樣頻率訂為 44.1 kHz，其背後遵循的學理基礎為何？",
    options: [
      "奈奎斯特取樣定理：取樣頻率必須大於最高頻率 (20 kHz) 的 2 倍以上",
      "摩爾定律：每 18 個月翻倍",
      "香農極限：音量必須放大 44 倍",
      "立體聲原則：左右聲道各需 22.05 kHz"
    ],
    answerIndex: 0,
    explanation: "奈奎斯特定理指出取樣頻率需大於訊號最高頻率的 2 倍。人耳極限約 20 kHz，故 44.1 kHz > 40 kHz。"
  },
  {
    category: "音訊格式",
    question: "下列關於 MIDI 格式檔 (`.mid`) 的敘述，何者是「錯誤」的？",
    options: [
      "MIDI 檔案記錄的是音符演奏指令而非真實聲音波形",
      "MIDI 檔案體積非常小，通常僅數十 KB",
      "可以用 MIDI 格式完整錄製歌手清唱的人聲歌聲",
      "MIDI 的播放音質取決於播放設備音效卡的波表合成器"
    ],
    answerIndex: 2,
    explanation: "MIDI 是「數位樂譜」，只記錄音高、音長、力道等指令，無法記錄人聲講話或唱歌波形。"
  },
  {
    category: "動畫原理",
    question: "電影與動畫能讓觀眾感受到流暢連續的動作畫面，主要是利用人眼的何種生理生理特質？",
    options: ["視覺暫留（殘影約停留 1/16 秒）", "色彩恆常性", "瞳孔縮放反射", "視差雙眼效應"],
    answerIndex: 0,
    explanation: "人眼視網膜會保留光線殘影約 1/16 秒（視覺暫留），快速切換每秒 24 格以上靜態圖片即形成連續動態。"
  },
  {
    category: "創用 CC 授權",
    question: "在創用 CC (Creative Commons) 授權標章中，哪兩個授權核心條件具有「完全互斥性」，絕對不可能出現在同一個授權條款中？",
    options: [
      "BY（姓名標示）與 NC（非商業性）",
      "ND（禁止改作）與 SA（相同方式分享）",
      "BY（姓名標示）與 ND（禁止改作）",
      "NC（非商業性）與 SA（相同方式分享）"
    ],
    answerIndex: 1,
    explanation: "ND 規定「禁止修改」，而 SA 規定「改作後需以同條件分享」。既然不能改，就永遠不會產生衍生作品，故兩者互斥！"
  },
  {
    category: "智財權法規",
    question: "關於我國著作權法之規定，下列敘述何者「錯誤」？",
    options: [
      "採創作完成主義，作品完成即享有著作權，不需登記註冊",
      "著作人格權可以透過合約全數讓與或買斷給他人",
      "著作財產權之保護期間通常為著作人終身加死後 50 年",
      "著作人格權包含姓名表示權、同一性保持權與公開發表權"
    ],
    answerIndex: 1,
    explanation: "著作人格權專屬於創作者本人，具有不可讓與性與不可繼承性，不能簽約買斷！"
  },
  {
    category: "段考計算題",
    question: "一張解析度為 1024 × 768、色彩深度為 24 位元 (True Color) 的未壓縮影像，檔案大小約為多少？",
    options: ["768 KB", "2.25 MB", "18 MB", "2.35 GB"],
    answerIndex: 1,
    explanation: "(1024 × 768 × 24) ÷ 8 = 2,359,296 Bytes；除以 1024 ÷ 1024 = 2.25 MB。"
  },
  {
    category: "段考計算題",
    question: "若欲沖洗一張 4 × 6 英吋的照片，沖印店要求解析度至少需達 300 DPI，請問數位相機所拍攝的照片像素尺寸至少需為多少？",
    options: ["800 × 600 px", "1024 × 768 px", "1200 × 1800 px", "1920 × 1080 px"],
    answerIndex: 2,
    explanation: "寬度 = 4 × 300 = 1200 像素；高度 = 6 × 300 = 1800 像素，故為 1200 × 1800 px。"
  }
];

let currentQIndex = 0;
let userScore = 0;
let userAnswers = new Array(quizQuestions.length).fill(null);

function initQuizSystem() {
  document.getElementById('totalQNum').textContent = quizQuestions.length;
  renderQuestion(currentQIndex);

  document.getElementById('prevQBtn').addEventListener('click', () => {
    if (currentQIndex > 0) {
      currentQIndex--;
      renderQuestion(currentQIndex);
    }
  });

  document.getElementById('nextQBtn').addEventListener('click', () => {
    if (currentQIndex < quizQuestions.length - 1) {
      currentQIndex++;
      renderQuestion(currentQIndex);
    } else {
      showQuizSummary();
    }
  });

  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    currentQIndex = 0;
    userScore = 0;
    userAnswers = new Array(quizQuestions.length).fill(null);
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('restartQuizBtn').style.display = 'none';
    renderQuestion(currentQIndex);
  });
}

function renderQuestion(idx) {
  const q = quizQuestions[idx];
  document.getElementById('currentQNum').textContent = idx + 1;
  document.getElementById('qCategory').textContent = q.category;
  document.getElementById('qQuestionText').textContent = `${idx + 1}. ${q.question}`;

  const progressPct = ((idx + 1) / quizQuestions.length) * 100;
  document.getElementById('quizProgressBar').style.width = `${progressPct}%`;

  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];
  const hasAnswered = userAnswers[idx] !== null;

  q.options.forEach((optText, optIdx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${letters[optIdx]}</span> <span>${optText}</span>`;

    if (hasAnswered) {
      btn.disabled = true;
      if (optIdx === q.answerIndex) {
        btn.classList.add('correct');
      } else if (optIdx === userAnswers[idx]) {
        btn.classList.add('wrong');
      }
    } else {
      btn.addEventListener('click', () => handleOptionClick(optIdx));
    }

    container.appendChild(btn);
  });

  const expBox = document.getElementById('qExplanationBox');
  if (hasAnswered) {
    expBox.style.display = 'block';
    const isCorrect = userAnswers[idx] === q.answerIndex;
    const expStatus = document.getElementById('expStatusText');
    const expContent = document.getElementById('expContentText');

    if (isCorrect) {
      expStatus.textContent = '🎉 答對了！恭喜！';
      expStatus.className = 'exp-status correct-text';
    } else {
      expStatus.textContent = `❌ 答錯了！正確答案是 (${letters[q.answerIndex]})`;
      expStatus.className = 'exp-status wrong-text';
    }
    expContent.innerHTML = q.explanation;
  } else {
    expBox.style.display = 'none';
  }

  // 按鈕顯示邏輯
  document.getElementById('prevQBtn').style.display = idx > 0 ? 'inline-flex' : 'none';
  document.getElementById('nextQBtn').style.display = hasAnswered ? 'inline-flex' : 'none';
  document.getElementById('nextQBtn').textContent = idx === quizQuestions.length - 1 ? '查看總分 🏆' : '下一題 ➔';
}

function handleOptionClick(selectedOptIdx) {
  const q = quizQuestions[currentQIndex];
  userAnswers[currentQIndex] = selectedOptIdx;

  if (selectedOptIdx === q.answerIndex) {
    const pointsPerQ = Math.round(100 / quizQuestions.length);
    userScore += pointsPerQ;
    if (currentQIndex === quizQuestions.length - 1 && userScore > 90) userScore = 100;
  }

  document.getElementById('currentScore').textContent = userScore;
  renderQuestion(currentQIndex);
}

function showQuizSummary() {
  const card = document.getElementById('questionCard');
  let praise = '';
  if (userScore >= 90) {
    praise = '🌟 太強了！資處一仁 多媒體學霸就是你！段考穩拿滿分！';
  } else if (userScore >= 70) {
    praise = '👏 表現相當優異！大部分核心觀念皆已掌握，考前多複習計算題！';
  } else {
    praise = '💪 還有進步空間，建議多利用上方的「三大計算機」與「觀念實驗室」加強複習！';
  }

  card.innerHTML = `
    <div style="text-align: center; padding: 2rem 1rem;">
      <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">🏆</div>
      <h3 style="font-size: 1.8rem; margin-bottom: 0.5rem;">測驗圓滿完成！</h3>
      <div style="font-size: 2.8rem; font-weight: 800; color: var(--primary-glow); margin: 0.8rem 0;">
        ${userScore} <span style="font-size: 1.2rem; color: var(--text-muted);">/ 100 分</span>
      </div>
      <p style="font-size: 1.05rem; margin-bottom: 2rem; color: var(--text-main); font-weight: 600;">
        ${praise}
      </p>
      <button type="button" class="action-btn-primary" onclick="location.reload()">
        🔄 再測驗一次
      </button>
    </div>
  `;
}

/* ==========================================================================
   9. 列印觸發按鈕
   ========================================================================== */
function initPrintTrigger() {
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
