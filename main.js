const GAS_URL = "https://script.google.com/macros/s/AKfycbxvA-9qZDvzaXpegwBiYWhy0F54pt1TdsUb1RsCb6PckoA3tO4Z5z9m45amJ8Vsg-2z/exec";
const shops = [
  "MARUGO窶船", "MARUGO窶前TTO", "蜈�･悶←縺ｪ縺�ｄ譁ｰ螳ｿ荳我ｸ∫岼", "魄ｨ縺薙ｋ繧�",
  "MARUGO", "MARUGO2", "MARUGO GRANDE", "MARUGO MARUNOUCHI",
  "繝槭Ν繧ｴ譁ｰ讖�", "MARUGO YOTSUYA", "371BAR", "荳我ｸ我ｺ比ｺ�",
  "BAR PELOTA", "Claudia2", "BISTRO CAVACAVA", "eric'S",
  "MITAN", "辟ｼ閧峨�繝ｫ繧ｴ", "SOBA窶遷U", "Bar Violet",
  "X&C", "繝医Λ繝�ヨ繝ｪ繧｢ 繝悶Μ繝�さ繝ｩ"
];

// 蠎苓�繝��繧ｿ縺ｧ雋ｸ荳ｻ繝ｻ蛟滉ｸｻ縺ｮ繧ｪ繝励す繝ｧ繝ｳ繧定ｨｭ螳�
function populateShops() {
  const lenderSelect = document.getElementById("lender");
  const borrowerSelect = document.getElementById("borrower");

  shops.forEach(shop => {
    const option1 = document.createElement("option");
    option1.value = shop;
    option1.textContent = shop;
    lenderSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = shop;
    option2.textContent = shop;
    borrowerSelect.appendChild(option2);
  });
}

// DOM隕∫ｴ 縺ｮ蛻晄悄蛹�
function initializeElements() {
  // 莉頑律縺ｮ譌･莉倥ｒ閾ｪ蜍戊ｨｭ螳�
  document.getElementById('date').valueAsDate = new Date();

  // 繧ｫ繝�ざ繝ｪ繝ｼ驕ｸ謚槭�蜃ｦ逅�
  const categoryOptions = document.querySelectorAll('.category-option');
  const categoryInput = document.getElementById('category');

  categoryOptions.forEach(option => {
    option.addEventListener('click', () => {
      categoryOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      categoryInput.value = option.dataset.value;
    });
  });

  // 驥鷹｡榊�蜉帙�閾ｪ蜍輔ヵ繧ｩ繝ｼ繝槭ャ繝�
  const amountInput = document.getElementById('amount');
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      value = parseInt(value).toLocaleString('ja-JP');
    }
    e.target.value = value;
  });

  // 繝輔か繝ｼ繝 騾∽ｿ｡蜃ｦ逅�
  const form = document.getElementById('loanForm');
  const submitBtn = document.querySelector('.submit-btn');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 繝舌Μ繝��繧ｷ繝ｧ繝ｳ
    if (!categoryInput.value) {
      alert('繧ｫ繝�ざ繝ｪ繝ｼ繧帝∈謚槭＠縺ｦ縺上□縺輔＞');
      return;
    }

    // 繝ｭ繝ｼ繝�ぅ繝ｳ繧ｰ迥ｶ諷矩幕蟋�
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-text').textContent = '騾∽ｿ｡荳ｭ...';
    submitBtn.disabled = true;

    try {
      // 驥鷹｡阪�豁｣隕丞喧�亥�隗呈焚蟄励ｒ蜊願ｧ偵↓螟画鋤��
      const amountRaw = document.getElementById("amount").value;
      const normalizedAmount = amountRaw.replace(/[��-�兢/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));

      const userAgent = navigator.userAgent;

      const data = {
        date: document.getElementById("date").value,
        name: document.getElementById("name").value,
        lender: document.getElementById("lender").value,
        borrower: document.getElementById("borrower").value,
        category: document.getElementById("category").value,
        item: document.getElementById("item").value,
        amount: normalizedAmount,
        displayName: "",
        userId: "",
        userAgent: userAgent
      };

      // Google Apps Script縺ｫ騾∽ｿ｡
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      // 謌仙粥蜃ｦ逅�
      setTimeout(() => {
        // 繝ｭ繝ｼ繝�ぅ繝ｳ繧ｰ迥ｶ諷狗ｵゆｺ�
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = '鐙 騾∽ｿ｡縺吶ｋ';
        submitBtn.disabled = false;

        // 謌仙粥繝｡繝�そ繝ｼ繧ｸ陦ｨ遉ｺ
        successMessage.classList.add('show');
        setTimeout(() => {
          successMessage.classList.remove('show');
        }, 3000);

        // 繝輔か繝ｼ繝 繝ｪ繧ｻ繝�ヨ
        form.reset();
        categoryOptions.forEach(opt => opt.classList.remove('selected'));
        document.getElementById('date').valueAsDate = new Date();
      }, 1000);

    } catch (error) {
      console.error('騾∽ｿ｡繧ｨ繝ｩ繝ｼ:', error);

      // 繧ｨ繝ｩ繝ｼ蜃ｦ逅�
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = '鐙 騾∽ｿ｡縺吶ｋ';
      submitBtn.disabled = false;

      alert('騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ょ�蠎ｦ縺願ｩｦ縺励￥縺 縺輔＞縲�');
    }
  });
}

// 蛻晄悄蛹門�逅�
function initialize() {
  populateShops();
  initializeElements();
}

// 繝壹�繧ｸ縺悟ｮ悟�縺ｫ隱ｭ縺ｿ霎ｼ縺ｾ繧後◆蠕後↓螳溯｡�
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
