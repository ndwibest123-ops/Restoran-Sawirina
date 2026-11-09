// ===== Data Menu =====
const menus = [
  {
    id: 1, name: "Nasi Goreng Telor", category: "Main Food", price: 18000, img: "asset/Nasi-Goreng-telor.jpg",
    desc: "Nasi goreng bumbu rumahan dengan telur mata sapi, kerupuk, dan acar.",
  },
  {
    id: 2, name: "Ayam Goreng Lengkuas", category: "Main Food", price: 22000, img: "asset/ayam-goreng-lengkuas.jpg",
    desc: "Ayam goreng berbumbu kuning dengan taburan serundeng lengkuas yang gurih.",
  },
  {
    id: 3, name: "Ikan Bakar", category: "Main Food", price: 35000, img: "asset/ikan-barang.jpeg",
    desc: "Ikan bakar bumbu merah manis pedas, disajikan dengan lalapan dan sambal.",
  },
  {
    id: 4, name: "Sate", category: "Main Food", price: 25000, img: "asset/Sate.jpeg",
    desc: "Sate daging bakar bumbu kecap dengan sambal kecap, lalapan, dan jeruk nipis.",
  },
  {
    id: 5, name: "Kentang Goreng", category: "Snack", price: 15000, img: "asset/Kentang-.jpeg",
    desc: "Kentang goreng renyah di luar, lembut di dalam, dengan saus tomat.",
  },
  {
    id: 6, name: "Es Jeruk", category: "Minuman", price: 8000, img: "asset/es jeruk.jpeg",
    desc: "Perasan jeruk segar dengan es batu, manisnya pas.",
  },
  {
    id: 7, name: "Es Lemon Tea", category: "Minuman", price: 8000, img: "asset/es lemon tea.jpeg",
    desc: "Teh dingin dengan irisan lemon segar, asam manis menyegarkan.",
  },
  {
    id: 8, name: "Jus Alpukat", category: "Minuman", price: 15000, img: "asset/just-alpukat.jpeg",
    desc: "Jus alpukat kental dan creamy dengan susu kental manis.",
  },
  {
    id: 9, name: "Kopi", category: "Minuman", price: 10000, img: "asset/kopi.jpeg",
    desc: "Kopi susu racikan sendiri, bisa panas atau dingin.",
  },
  {
    id: 10, name: "Matcha", category: "Minuman", price: 20000, img: "asset/matcha.jpeg",
    desc: "Matcha latte lembut dengan rasa teh hijau yang khas.",
  },
];

const categories = ["All", ...new Set(menus.map((m) => m.category))];

// ===== State =====
let activeCategory = "All";
let cart = []; // { id, qty }

// ===== Elemen =====
const el = (id) => document.getElementById(id);
const categoriesEl = el("categories");
const menuGridEl = el("menuGrid");
const orderListEl = el("orderList");
const discountEl = el("discount");
const cashEl = el("cash");
const messageEl = el("message");

const MAX_QTY = 99;

// ===== Helper =====
const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
const findMenu = (id) => menus.find((m) => m.id === id);
// img bisa emoji atau path gambar (mis. "asset/xxx.jpg")
const menuImg = (m) => (m.img.includes("/") ? `<img src="${encodeURI(m.img)}" alt="${m.name}">` : m.img);

function getTotals() {
  const subtotal = cart.reduce((sum, item) => sum + findMenu(item.id).price * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  let percent = Number(discountEl.value) || 0;
  percent = Math.min(Math.max(percent, 0), 100);

  const discount = (subtotal * percent) / 100;
  const total = subtotal - discount;
  const cash = Number(cashEl.value) || 0;
  const change = cash - total;

  return { subtotal, itemCount, percent, discount, total, cash, change };
}

// ===== Validasi =====
function validate() {
  const errors = {};

  const d = Number(discountEl.value);
  if (discountEl.validity.badInput) errors.discount = "Diskon harus berupa angka.";
  else if (d < 0 || d > 100) errors.discount = "Diskon harus antara 0–100%.";

  const c = Number(cashEl.value);
  if (cashEl.validity.badInput) errors.cash = "Uang bayar harus berupa angka.";
  else if (c < 0) errors.cash = "Uang bayar tidak boleh negatif.";
  else if (!Number.isInteger(c)) errors.cash = "Uang bayar tidak boleh desimal.";

  return errors;
}

function showFieldError(input, errorEl, text) {
  errorEl.textContent = text || "";
  input.classList.toggle("invalid", Boolean(text));
}

// ===== Render =====
el("today").textContent = new Date().toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function renderCategories() {
  categoriesEl.innerHTML = categories
    .map(
      (c) => `<button class="${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`
    )
    .join("");
}

function renderMenus() {
  const list = activeCategory === "All" ? menus : menus.filter((m) => m.category === activeCategory);

  menuGridEl.innerHTML = list
    .map(
      (m) => `
      <div class="card">
        <div class="img">${menuImg(m)}</div>
        <div class="top">
          <span class="name">${m.name}</span>
          <span class="price">${rupiah(m.price)}</span>
        </div>
        <p class="desc">${m.desc}</p>
        <div class="bottom">
          <span class="rating"><i class="fi fi-sr-star"></i> 5.0</span>
          <button class="add" data-id="${m.id}"><i class="fi fi-rr-shopping-cart-add"></i> Tambah</button>
        </div>
      </div>`
    )
    .join("");
}

function renderCart() {
  if (cart.length === 0) {
    orderListEl.innerHTML = `<p class="empty">Belum ada pesanan</p>`;
  } else {
    orderListEl.innerHTML = cart
      .map((item) => {
        const m = findMenu(item.id);
        return `
        <div class="order-item">
          <div class="thumb">${menuImg(m)}</div>
          <div class="info">
            <div class="name">${m.name}</div>
            <div class="price">${rupiah(m.price * item.qty)}</div>
          </div>
          <div class="right">
            <button class="remove" data-action="remove" data-id="${m.id}" title="Hapus"><i class="fi fi-rr-trash"></i></button>
            <div class="qty">
              <button data-action="minus" data-id="${m.id}" title="Kurangi"><i class="fi fi-rr-minus-small"></i></button>
              <span>${String(item.qty).padStart(2, "0")}</span>
              <button data-action="plus" data-id="${m.id}" title="Tambah"><i class="fi fi-rr-plus-small"></i></button>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }
  renderSummary();
}

function renderSummary() {
  const t = getTotals();
  el("itemCount").textContent = t.itemCount;
  el("subtotal").textContent = rupiah(t.subtotal);
  el("discountAmount").textContent = "-" + rupiah(t.discount);
  el("total").textContent = rupiah(t.total);

  const changeEl = el("change");
  if (cashEl.value === "" || t.total === 0) {
    changeEl.textContent = rupiah(0);
    changeEl.className = "";
  } else if (t.change < 0) {
    changeEl.textContent = "Kurang " + rupiah(-t.change);
    changeEl.className = "red";
  } else {
    changeEl.textContent = rupiah(t.change);
    changeEl.className = "green";
  }

  const errors = validate();
  showFieldError(discountEl, el("discountError"), errors.discount);
  showFieldError(cashEl, el("cashError"), errors.cash);
  messageEl.textContent = "";
}

// ===== Aksi Keranjang =====
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item && item.qty >= MAX_QTY) return showMaxQty();
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (item.qty + delta > MAX_QTY) return showMaxQty();
  item.qty += delta;
  if (item.qty <= 0) removeItem(id);
  else renderCart();
}

function removeItem(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function showMaxQty() {
  messageEl.textContent = `Maksimal ${MAX_QTY} porsi per menu.`;
}

// ===== Event =====
categoriesEl.addEventListener("click", (e) => {
  const cat = e.target.dataset.cat;
  if (!cat) return;
  activeCategory = cat;
  renderCategories();
  renderMenus();
});

menuGridEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".add");
  if (btn) addToCart(Number(btn.dataset.id));
});

orderListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "plus") changeQty(id, 1);
  if (btn.dataset.action === "minus") changeQty(id, -1);
  if (btn.dataset.action === "remove") removeItem(id);
});

discountEl.addEventListener("input", renderSummary);
cashEl.addEventListener("input", renderSummary);

// Cegah karakter yang tidak valid di input angka (e, +, -, koma, titik)
[discountEl, cashEl].forEach((input) =>
  input.addEventListener("keydown", (e) => {
    if (["e", "E", "+", "-", ",", "."].includes(e.key)) e.preventDefault();
  })
);

el("quickCash").addEventListener("click", (e) => {
  const value = e.target.dataset.cash;
  if (!value) return;
  cashEl.value = value === "exact" ? Math.ceil(getTotals().total) : value;
  renderSummary();
});

el("checkout").addEventListener("click", () => {
  const t = getTotals();

  if (cart.length === 0) {
    messageEl.textContent = "Pilih menu terlebih dahulu.";
    return;
  }
  if (Object.keys(validate()).length > 0) {
    messageEl.textContent = "Periksa kembali isian yang ditandai merah.";
    return;``
  }
  if (cashEl.value === "") {
    messageEl.textContent = "Masukkan jumlah uang bayar.";
    return;
  }
  if (t.change < 0) {
    messageEl.textContent = "Uang bayar kurang " + rupiah(-t.change) + ".";
    return;
  }

  const lines = cart
    .map((item) => {
      const m = findMenu(item.id);
      return `<div class="row"><span>${m.name} x${item.qty}</span><span>${rupiah(m.price * item.qty)}</span></div>`;
    })
    .join("");

  el("receiptBody").innerHTML = `
    ${lines}
    <hr>
    <div class="row"><span>Subtotal</span><span>${rupiah(t.subtotal)}</span></div>
    <div class="row"><span>Diskon (${t.percent}%)</span><span class="red">-${rupiah(t.discount)}</span></div>
    <div class="row"><strong>Total</strong><strong>${rupiah(t.total)}</strong></div>
    <hr>
    <div class="row"><span>Bayar</span><span>${rupiah(t.cash)}</span></div>
    <div class="row"><strong>Kembalian</strong><strong class="green">${rupiah(t.change)}</strong></div>
  `;
  el("modal").classList.add("show");
});

el("newOrder").addEventListener("click", () => {
  cart = [];
  discountEl.value = 0;
  cashEl.value = "";
  el("modal").classList.remove("show");
  renderCart();
});

// ===== Init =====
renderCategories();
renderMenus();
renderCart();
