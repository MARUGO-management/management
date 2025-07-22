const GAS_URL = "AKfycbx_8A0X_x_dzJWcFMdzMlS0yC1IKcjgeC-FdEaYklbBvR70UrYaB7pT2hkZ97JXTNo";

const shops = [
  "MARUGO‑D", "MARUGO‑OTTO", "元祖どないや新宿三丁目", "鮨こるり",
  "MARUGO", "MARUGO2", "MARUGO GRANDE", "MARUGO MARUNOUCHI",
  "マルゴ新橋", "MARUGO YOTSUYA", "371BAR", "三三五五",
  "BAR PELOTA", "Claudia2", "BISTRO CAVACAVA", "eric'S",
  "MITAN", "焼肉マルゴ", "SOBA‑JU", "Bar Violet",
  "X&C", "トラットリア ブリッコラ"
];

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

function detectDeviceInfo() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Macintosh/.test(ua)) return "macOS";
  return "Other";
}

function initializeElements() {
  document.getElementById('date').valueAsDate = new Date();
  const categoryOptions = document.querySelectorAll('.category-option');
  const categoryInput = document.getElementById('category');

  categoryOptions.forEach(option => {
    option.addEventListener('click', () => {
      categoryOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      categoryInput.value = option.dataset.value;
    });
  });

  const amountInput = document.getElementById('amount');
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      value = parseInt(value).toLocaleString('ja-JP');
    }
    e.target.value = value;
  });

  const form = document.getElementById('loanForm');
  const submitBtn = document.querySelector('.submit-btn');
  const successMessage = document.getElementById('successMessage');

  // device をセット
  const deviceField = document.getElementById("device");
  if (deviceField) {
    deviceField.value = detectDeviceInfo();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!categoryInput.value) {
      alert('カテゴリーを選択してください');
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-text').textContent = '送信中...';
    submitBtn.disabled = true;

    try {
      const amountRaw = document.getElementById("amount").value;
      const normalizedAmount = amountRaw.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/,/g, '');

      const data = {
        date: document.getElementById("date").value,
        name: document.getElementById("name").value,
        lender: document.getElementById("lender").value,
        borrower: document.getElementById("borrower").value,
        category: document.getElementById("category").value,
        item: document.getElementById("item").value,
        amount: normalizedAmount,
        device: document.getElementById("device").value
      };

      await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(data)
      });

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = '📨 送信する';
        submitBtn.disabled = false;

        successMessage.classList.add('show');
        setTimeout(() => {
          successMessage.classList.remove('show');
        }, 3000);

        form.reset();
        categoryOptions.forEach(opt => opt.classList.remove('selected'));
        document.getElementById('date').valueAsDate = new Date();
        deviceField.value = detectDeviceInfo(); // 再設定

      }, 1000);

    } catch (error) {
      console.error('送信エラー:', error);
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = '📨 送信する';
      submitBtn.disabled = false;
      alert('送信に失敗しました。再度お試しください。');
    }
  });
}

function initialize() {
  populateShops();
  initializeElements();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  setTimeout(initialize, 0);
}
