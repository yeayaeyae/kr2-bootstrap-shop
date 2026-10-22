// Данные товаров: используются страницей товара и формой заказа
const products = {
    "phone-pro": {
        category: "Смартфоны",
        title: "Смартфон Pro X",
        description: "Современный смартфон для работы, общения и развлечений. Яркий экран, быстрая зарядка и камера 50 Мп.",
        price: "49 990 ₽",
        oldPrice: "54 990 ₽",
        badge: ["Хит", "text-bg-danger"],
        image: "📱",
        features: [
            ["Экран", "6.5 дюйма"],
            ["Разрешение", "2400 × 1080"],
            ["Процессор", "8 ядер"],
            ["Оперативная память", "8 ГБ"],
            ["Память", "256 ГБ"],
            ["Камера", "50 Мп"],
            ["Аккумулятор", "5000 мА·ч"]
        ]
    },
    "phone-lite": {
        category: "Смартфоны",
        title: "Смартфон Lite",
        description: "Практичный смартфон для повседневных задач с ёмким аккумулятором.",
        price: "29 990 ₽",
        badge: ["Скидка", "text-bg-warning"],
        oldPrice: "33 990 ₽",
        image: "📱",
        features: [
            ["Экран", "6.4 дюйма"],
            ["Разрешение", "2400 × 1080"],
            ["Процессор", "8 ядер"],
            ["Оперативная память", "6 ГБ"],
            ["Память", "128 ГБ"],
            ["Камера", "48 Мп"],
            ["Аккумулятор", "4500 мА·ч"]
        ]
    },
    "laptop-air": {
        category: "Ноутбуки",
        title: "Ноутбук Air 15",
        description: "Лёгкий ноутбук для учёбы, работы и повседневных задач.",
        price: "79 990 ₽",
        badge: ["Новинка", "text-bg-success"],
        image: "💻",
        features: [
            ["Экран", "15.6 дюйма"],
            ["Разрешение", "1920 × 1080"],
            ["Процессор", "8 ядер"],
            ["Оперативная память", "16 ГБ"],
            ["Память", "512 ГБ SSD"],
            ["Видеокарта", "Встроенная"],
            ["Вес", "1.6 кг"]
        ]
    },
    "laptop-pro": {
        category: "Ноутбуки",
        title: "Notebook Pro 16",
        description: "Производительный ноутбук для работы и творчества.",
        price: "109 990 ₽",
        badge: ["Хит", "text-bg-danger"],
        image: "💻",
        features: [
            ["Экран", "16 дюймов"],
            ["Разрешение", "2560 × 1600"],
            ["Процессор", "12 ядер"],
            ["Оперативная память", "32 ГБ"],
            ["Память", "1 ТБ SSD"],
            ["Видеокарта", "Дискретная"],
            ["Вес", "1.9 кг"]
        ]
    },
    "sound-pro": {
        category: "Наушники",
        title: "Sound Pro",
        description: "Беспроводные наушники с качественным звуком и удобной посадкой.",
        price: "12 990 ₽",
        badge: ["Новинка", "text-bg-success"],
        image: "🎧",
        features: [
            ["Тип", "Беспроводные"],
            ["Подключение", "Bluetooth"],
            ["Шумоподавление", "Есть"],
            ["Время работы", "30 часов"],
            ["Микрофон", "Встроенный"],
            ["Вес", "250 г"],
            ["Гарантия", "1 год"]
        ]
    },
    "sound-mini": {
        category: "Наушники",
        title: "Sound Mini",
        description: "Компактные беспроводные наушники на каждый день.",
        price: "7 990 ₽",
        image: "🎧",
        features: [
            ["Тип", "Беспроводные"],
            ["Подключение", "Bluetooth"],
            ["Шумоподавление", "Нет"],
            ["Время работы", "20 часов"],
            ["Микрофон", "Встроенный"],
            ["Вес", "180 г"],
            ["Гарантия", "1 год"]
        ]
    }
};

const params = new URLSearchParams(window.location.search);

// Страница товара: подставляем данные по ?product=
function initProductPage() {
    const page = document.querySelector("[data-product-page]");
    if (!page) return;

    const id = products[params.get("product")] ? params.get("product") : "phone-pro";
    const product = products[id];

    page.querySelectorAll("[data-field]").forEach(el => {
        el.textContent = product[el.dataset.field] || "";
    });

    const badge = page.querySelector("[data-badge]");
    if (product.badge) {
        badge.textContent = product.badge[0];
        badge.className = `badge ${product.badge[1]}`;
    } else {
        badge.remove();
    }

    page.querySelector("[data-features]").innerHTML = product.features
        .map(([name, value]) => `<tr><th scope="row">${name}</th><td>${value}</td></tr>`)
        .join("");

    page.querySelectorAll("[data-order-link]").forEach(link => {
        link.href = `order.html?product=${id}`;
    });

    // Значение по умолчанию, чтобы reset() формы не стирал название товара
    document.getElementById("quick-product").defaultValue = product.title;
    document.title = `${product.title} — TechStore`;
}

// Форма заказа: выбираем товар, пришедший из ?product=
function initOrderPage() {
    const select = document.getElementById("order-product");
    const id = params.get("product");
    if (select && products[id]) {
        select.querySelector(`option[value="${id}"]`).defaultSelected = true;
    }
}

// Каталог: фильтр по категории и цене, сортировка, пагинация
function initCatalog() {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return;

    const PAGE_SIZE = 4;
    const items = Array.from(grid.querySelectorAll("[data-category]"));
    const form = document.getElementById("catalog-filter");
    const sort = document.getElementById("catalog-sort");
    const count = document.getElementById("catalog-count");
    const empty = document.getElementById("catalog-empty");
    const pagination = document.getElementById("catalog-pagination");
    let page = 1;

    function getFiltered() {
        const categories = Array.from(form.querySelectorAll("[name=category]:checked")).map(i => i.value);
        const [min, max] = form.querySelector("[name=price]:checked").value.split("-").map(Number);

        const filtered = items.filter(item => {
            const price = Number(item.dataset.price);
            const byCategory = categories.length === 0 || categories.includes(item.dataset.category);
            return byCategory && price >= min && price <= max;
        });

        if (sort.value === "price-asc") filtered.sort((a, b) => a.dataset.price - b.dataset.price);
        if (sort.value === "price-desc") filtered.sort((a, b) => b.dataset.price - a.dataset.price);
        return filtered;
    }

    function renderPagination(pages) {
        pagination.innerHTML = "";
        pagination.closest("nav").classList.toggle("d-none", pages <= 1);

        for (let i = 1; i <= pages; i++) {
            const li = document.createElement("li");
            li.className = `page-item${i === page ? " active" : ""}`;
            li.innerHTML = `<button class="page-link" type="button"${i === page ? ' aria-current="page"' : ""}>${i}</button>`;
            li.querySelector("button").addEventListener("click", () => {
                page = i;
                render();
                grid.scrollIntoView({ behavior: "smooth" });
            });
            pagination.appendChild(li);
        }
    }

    function render() {
        const filtered = getFiltered();
        const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        page = Math.min(page, pages);

        items.forEach(item => item.classList.add("d-none"));
        filtered.forEach(item => grid.appendChild(item));
        filtered
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .forEach(item => item.classList.remove("d-none"));

        count.textContent = filtered.length;
        empty.classList.toggle("d-none", filtered.length > 0);
        renderPagination(filtered.length ? pages : 0);
    }

    form.addEventListener("change", () => { page = 1; render(); });
    form.addEventListener("reset", () => setTimeout(() => { page = 1; render(); }));
    sort.addEventListener("change", render);
    render();
}

// Формы: проверка Bootstrap-валидации и уведомление toast
function initForms() {
    const toastEl = document.getElementById("form-toast");
    const toast = toastEl ? bootstrap.Toast.getOrCreateInstance(toastEl) : null;

    document.querySelectorAll(".needs-validation").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                return;
            }

            form.reset();
            form.classList.remove("was-validated");

            const modal = form.closest(".modal");
            if (modal) bootstrap.Modal.getInstance(modal).hide();
            if (toast) toast.show();
        });
    });
}

// Кнопка «Наверх» появляется после прокрутки
function initScrollTop() {
    const button = document.querySelector(".scroll-top");
    if (!button) return;

    const toggle = () => button.classList.toggle("d-none", window.scrollY < 400);
    window.addEventListener("scroll", toggle, { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    toggle();
}

initProductPage();
initOrderPage();
initCatalog();
initForms();
initScrollTop();
