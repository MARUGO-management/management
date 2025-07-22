const GAS_URL = "https://script.google.com/macros/s/AKfycbwPGw22--eubipb0a1lQeRC0fVf4zn7cMYrhgHbnhi4679C-Uih_gjv_ytahG27eqRf/exec";

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
    lenderSelect.appendChild(new Option(shop, shop));
    borrowerSelect.appendChild(new Option(shop, shop));
  });
}

function initializeElements() {
  document.getElementById('date').valueAsDate = new Date();

  const deviceField = document.getElementById("device");
  if (deviceField) {
    deviceField.value = detectDeviceInfo();
  }

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
      const normalizedAmount = amountRaw.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248)).replace(/,/g, "");

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
        userAgent: navigator.userAgent,
        device: document.getElementById("device")?.value || ""
      };

      console.log("送信データ:", data); // 確認用

      await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = '📨 送信する';
        submitBtn.disabled = false;
        alert("✅ 送信完了しました！");
        form.reset();
        categoryOptions.forEach(opt => opt.classList.remove('selected'));
        document.getElementById('date').valueAsDate = new Date();
        deviceField.value = detectDeviceInfo(); // リセット後も再設定
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

function detectDeviceInfo() {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const width = window.screen?.width;
  const height = window.screen?.height;

  let os = "Other";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Win/i.test(ua)) os = "Windows";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/CriOS|Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  return `${os}/${browser} ${width}x${height} ${platform}`;
}

function initialize() {
  populateShops();
  initializeElements();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  setTimeout(initialize, 0); // 念のため非同期遅延
}
console.log("🧪 device:", document.getElementById("device")?.value);
