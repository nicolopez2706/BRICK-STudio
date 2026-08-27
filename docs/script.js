/* =====================================
   HABITARE — script.js
   Compartido entre todas las páginas
===================================== */

const WHATSAPP_NUMBER = "5493513320235"; // +54 9 351 332 0235
const CONTACT_EMAIL = "Habitare@gmail.com";

const LINEAS = {
    aqua:     { nombre: "Aqua",     color: "#9caea3" },
    ceniza:   { nombre: "Ceniza",   color: "#47433d" },
    mostaza:  { nombre: "Mostaza",  color: "#b6934f" },
    gres:     { nombre: "Gres",     color: "#ab8b6c" },
    hueso:    { nombre: "Hueso",    color: "#e9e1d2" },
    terra:    { nombre: "Terra",    color: "#5b4a37" },
};

/* =====================================
   MENÚ MÓVIL
===================================== */

const menuToggle = document.querySelector(".menu-toggle");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
    });

    document.querySelectorAll(".mobile-nav a").forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.remove("menu-open");
        });
    });
}

/* =====================================
   SELECCIÓN — almacenamiento local
===================================== */

const STORAGE_KEY = "habitare_seleccion";

function loadSelection() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveSelection(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        /* almacenamiento no disponible: la sesión sigue funcionando igual */
    }
}

let selection = loadSelection();

/* =====================================
   PANEL DE SELECCIÓN
===================================== */

const selectionContent = document.querySelector(".selection-content");
const selectionEmpty = document.querySelector(".selection-empty");
const selectionNumber = document.querySelector(".selection-number");
const selectionCountLine = document.querySelector(".selection-count-line");

function openSelection() {
    document.body.classList.add("selection-open");
}

function closeSelection() {
    document.body.classList.remove("selection-open");
}

document.querySelectorAll(".open-selection").forEach(btn => {
    btn.addEventListener("click", openSelection);
});

document.querySelectorAll(".close-selection").forEach(btn => {
    btn.addEventListener("click", closeSelection);
});

document.querySelectorAll(".selection-backdrop").forEach(el => {
    el.addEventListener("click", closeSelection);
});

function addToSelection(lineaKey, cantidad) {
    const existing = selection.find(item => item.linea === lineaKey);

    if (existing) {
        existing.cantidad += cantidad;
    } else {
        selection.push({
            id: Date.now() + Math.random(),
            linea: lineaKey,
            cantidad: cantidad,
        });
    }

    saveSelection(selection);
    renderSelection();
}

function changeSelectionQty(id, amount) {
    const item = selection.find(p => p.id === id);
    if (!item) return;

    item.cantidad += amount;

    if (item.cantidad <= 0) {
        selection = selection.filter(p => p.id !== id);
    }

    saveSelection(selection);
    renderSelection();
}

function removeSelectionItem(id) {
    selection = selection.filter(item => item.id !== id);
    saveSelection(selection);
    renderSelection();
}

function buildQuoteText() {
    if (selection.length === 0) {
        return "Hola HABITARE, quiero armar mi proyecto y me gustaría recibir asesoramiento.";
    }

    let lines = ["Hola HABITARE, quiero pedir una cotización para:"];

    selection.forEach(item => {
        const linea = LINEAS[item.linea];
        const nombre = linea ? linea.nombre : item.linea;
        lines.push(`- Pieza línea ${nombre} x${item.cantidad}`);
    });

    return lines.join("\n");
}

function renderSelection() {
    if (!selectionContent) return;

    selectionContent.innerHTML = "";

    let totalPiezas = 0;

    if (selection.length === 0) {
        if (selectionEmpty) selectionEmpty.style.display = "flex";
    } else {
        if (selectionEmpty) selectionEmpty.style.display = "none";
    }

    selection.forEach(item => {
        const linea = LINEAS[item.linea] || { nombre: item.linea, color: "#cccccc" };
        totalPiezas += item.cantidad;

        const el = document.createElement("div");
        el.className = "selection-item";

        el.innerHTML = `
            <div class="selection-item-dot" style="--swatch:${linea.color}"></div>
            <div>
                <h4>Pieza HABITARE</h4>
                <small style="display:block;margin-top:4px;font-size:9px;color:var(--muted);letter-spacing:1px;">
                    LÍNEA ${linea.nombre.toUpperCase()}
                </small>
                <div class="selection-item-controls">
                    <button aria-label="Restar" data-action="minus" data-id="${item.id}">−</button>
                    <span>${item.cantidad}</span>
                    <button aria-label="Sumar" data-action="plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="selection-remove" aria-label="Quitar" data-action="remove" data-id="${item.id}">×</button>
        `;

        selectionContent.appendChild(el);
    });

    selectionContent.querySelectorAll("[data-action]").forEach(btn => {
        const id = Number(btn.dataset.id);
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            if (action === "plus") changeSelectionQty(id, 1);
            if (action === "minus") changeSelectionQty(id, -1);
            if (action === "remove") removeSelectionItem(id);
        });
    });

    if (selectionNumber) selectionNumber.textContent = totalPiezas;

    if (selectionCountLine) {
        selectionCountLine.innerHTML = totalPiezas > 0
            ? `<span>PIEZAS SELECCIONADAS</span><span>${totalPiezas}</span>`
            : "";
    }

    document.querySelectorAll(".quote-btn.whatsapp").forEach(btn => {
        btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildQuoteText())}`;
    });

    document.querySelectorAll(".quote-btn.email").forEach(btn => {
        btn.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Cotización HABITARE")}&body=${encodeURIComponent(buildQuoteText())}`;
    });
}

/* =====================================
   TARJETAS DE LÍNEA (página Colección)
===================================== */

document.querySelectorAll(".linea-card").forEach(card => {
    const lineaKey = card.dataset.linea;
    const qtyLabel = card.querySelector(".linea-qty span");
    const minus = card.querySelector('[data-qty="minus"]');
    const plus = card.querySelector('[data-qty="plus"]');
    const addBtn = card.querySelector(".linea-add");

    let qty = 1;

    if (plus) {
        plus.addEventListener("click", () => {
            qty++;
            qtyLabel.textContent = qty;
        });
    }

    if (minus) {
        minus.addEventListener("click", () => {
            if (qty > 1) qty--;
            qtyLabel.textContent = qty;
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            addToSelection(lineaKey, qty);
            qty = 1;
            qtyLabel.textContent = "1";

            addBtn.textContent = "Agregada ✓";
            addBtn.classList.add("added");
            setTimeout(() => {
                addBtn.textContent = "Agregar a mi selección";
                addBtn.classList.remove("added");
            }, 1400);
        });
    }
});

/* =====================================
   NEWSLETTER
===================================== */

document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", e => {
        e.preventDefault();
        const note = form.parentElement.querySelector(".newsletter-note");
        const input = form.querySelector("input");

        if (note) {
            note.textContent = "¡Gracias! Te vamos a escribir a " + input.value;
        }

        form.reset();
    });
});

/* =====================================
   INICIO
===================================== */

renderSelection();
