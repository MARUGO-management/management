const GAS_URL = "https://script.google.com/macros/s/AKfycbxvA-9qZDvzaXpegwBiYWhy0F54pt1TdsUb1RsCb6PckoA3tO4Z5z9m45amJ8Vsg-2z/exec";
const shops = [
  "MARUGO‑D", "MARUGO‑OTTO", "元祖どないや新宿三丁目", "鮨こるり",
  "MARUGO", "MARUGO2", "MARUGO GRANDE", "MARUGO MARUNOUCHI",
  "マルゴ新橋", "MARUGO YOTSUYA", "371BAR", "三三五五",
  "BAR PELOTA", "Claudia2", "BISTRO CAVA,CAVA", "eric'S",
  "MITAN", "焼肉マルゴ", "SOBA‑JU", "Bar Violet",
  "X&C", "トラットリア ブリッコラ"
];

// 店舗データで貸主・借主のオプションを設定
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

// LIFF初期化
async function initLiff() {
  // LIFF SDKが利用可能かチェック
  if (typeof liff === 'undefined') {
    console.warn('LIFF SDK not available - running in standalone mode');
    return;
  }

  try {
    await liff.init({ liffId: "2007681083-B3Z2RkAv" });

    if (!liff.isLoggedIn()) {
      // LINE環境外では自動ログインを試行しない
      if (liff.isInClient()) {
        liff.login();
      } else {
        console.log('LINE環境外で実行中 - ログインをスキップ');
      }
      return;
    }

    const profile = await liff.getProfile();
    window.userProfile = {
      displayName: profile.displayName,
      userId: profile.userId
    };

    // 自動補完 - ユーザー名に一致する店舗を借主に設定
    const borrowerSelect = document.getElementById("borrower");
    for (let option of borrowerSelect.options) {
      if (option.value.includes(profile.displayName)) {
        borrowerSelect.value = option.value;
        break;
      }
    }

    console.log('LIFF初期化成功:', profile.displayName);
  } catch (error) {
    console.error('LIFF初期化エラー:', error);

    // 具体的なエラーメッセージ
    if (error.code === 'INIT_FAILED') {
      console.error('LIFF ID が無効または設定に問題があります');
    } else if (error.code === 'FORBIDDEN') {
      console.error('このLIFFアプリへのアクセスが拒否されました');
    } else if (error.code === 'UNAUTHORIZED') {
      console.error('認証に失敗しました');
    }

    // LIFF環境外でも動作するように継続
    console.log('LIFF無しで動作を継続します');
  }
}

// DOM要素の初期化
function initializeElements() {
  // 今日の日付を自動設定
  document.getElementById('date').valueAsDate = new Date();

  // カテゴリー選択の処理
  const categoryOptions = document.querySelectorAll('.category-option');
  const categoryInput = document.getElementById('category');

  categoryOptions.forEach(option => {
    option.addEventListener('click', () => {
      categoryOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      categoryInput.value = option.dataset.value;
    });
  });

  // 金額入力の自動フォーマット
  const amountInput = document.getElementById('amount');
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      value = parseInt(value).toLocaleString('ja-JP');
    }
    e.target.value = value;
  });

  // フォーム送信処理
  const form = document.getElementById('loanForm');
  const submitBtn = document.querySelector('.submit-btn');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // バリデーション
    if (!categoryInput.value) {
      alert('カテゴリーを選択してください');
      return;
    }

    // ローディング状態開始
    submitBtn.classList.add('loading');
    submitBtn.querySelector('.btn-text').textContent = '送信中...';
    submitBtn.disabled = true;

    try {
      // 金額の正規化（全角数字を半角に変換）
      const amountRaw = document.getElementById("amount").value;
      const normalizedAmount = amountRaw.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 65248));

      const userAgent = navigator.userAgent;

      const data = {
        date: document.getElementById("date").value,
        name: document.getElementById("name").value,
        lender: document.getElementById("lender").value,
        borrower: document.getElementById("borrower").value,
        category: document.getElementById("category").value,
        item: document.getElementById("item").value,
        amount: normalizedAmount,
        displayName: window.userProfile?.displayName || "",
        userId: window.userProfile?.userId || "",
        userAgent: userAgent
      };

      // Google Apps Scriptに送信
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      // 成功処理
      setTimeout(() => {
        // ローディング状態終了
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.btn-text').textContent = '📨 送信する';
        submitBtn.disabled = false;

        // 成功メッセージ表示
        successMessage.classList.add('show');
        setTimeout(() => {
          successMessage.classList.remove('show');
        }, 3000);

        // フォームリセット
        form.reset();
        categoryOptions.forEach(opt => opt.classList.remove('selected'));
        document.getElementById('date').valueAsDate = new Date();

        // LIFFウィンドウを閉じる（LINEアプリ内の場合のみ）
        if (typeof liff !== 'undefined' && liff.isInClient && liff.isInClient()) {
          setTimeout(() => {
            try {
              liff.closeWindow();
            } catch (liffError) {
              console.warn('ウィンドウクローズに失敗:', liffError);
            }
          }, 2000);
        }
      }, 1000);

    } catch (error) {
      console.error('送信エラー:', error);

      // エラー処理
      submitBtn.classList.remove('loading');
      submitBtn.querySelector('.btn-text').textContent = '📨 送信する';
      submitBtn.disabled = false;

      alert('送信に失敗しました。再度お試しください。');
    }
  });
}

// 初期化処理
function initialize() {
  populateShops();
  initializeElements();

  // LIFF初期化は非同期で実行
  initLiff().catch(error => {
    console.error('LIFF初期化で予期しないエラー:', error);
  });
}

// ページが完全に読み込まれた後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
