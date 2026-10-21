/**
 * SOKIČ - NARAVNA ENERGIJA. SLOVENSKI OKUSI.
 * JavaScript za interaktivno spletno trgovino in predstavitev izdelka
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= 1. Baza izdelkov =================
  const products = {
    triglav: {
      id: 'triglav',
      name: 'Zeleni Triglav',
      flavorTitle: 'Okus 01 • Zeleni Triglav',
      volume: '300 ml',
      price: 4.00,
      image: 'assets/images/can_zeleni_triglav.jpg',
      tagline: 'Zeleni čaj, hruška & sočno jabolko',
      glowColor: 'rgba(34, 197, 94, 0.35)',
      accentColor: '#16a34a',
      recipeShort: 'Zeleni čaj 90ml • Hruškin pire 60ml • Jabolčni koncentrat 10g'
    },
    sadez: {
      id: 'sadez',
      name: 'Planinski Sadež',
      flavorTitle: 'Okus 02 • Planinski Sadež',
      volume: '300 ml',
      price: 4.00,
      image: 'assets/images/can_planinski_sadez.jpg',
      tagline: 'Divje maline, robide, meta & timijan',
      glowColor: 'rgba(190, 18, 60, 0.35)',
      accentColor: '#be123c',
      recipeShort: 'Zeleni čaj • Malinov pire • Robide • Gorska meta • Timijan'
    },
    karija: {
      id: 'karija',
      name: 'Sadna Karija',
      flavorTitle: 'Okus 03 • Sadna Karija',
      volume: '300 ml',
      price: 4.00,
      image: 'assets/images/can_sadna_karija.jpg',
      tagline: 'Sladke jagode, bezgov cvet & meta',
      glowColor: 'rgba(225, 29, 72, 0.35)',
      accentColor: '#e11d48',
      recipeShort: 'Zeleni čaj • Jagodni pire • Bezgov cvet • Sveža meta'
    },
    bundle_trio: {
      id: 'bundle_trio',
      name: 'Trio Paket Okusov (3 × 300 ml)',
      volume: '3 x 300 ml',
      price: 11.00,
      oldPrice: 12.00,
      image: 'assets/images/bundle_trio_pack.jpg',
      tagline: '1x Zeleni Triglav + 1x Planinski Sadež + 1x Sadna Karija',
      glowColor: 'rgba(34, 197, 94, 0.35)',
      accentColor: '#15803d',
      recipeShort: 'Komplet vseh 3 okusov v ekološki kartonski embalaži'
    }
  };

  // ================= 2. Stanje Košarice (Cart State) =================
  let cart = [];
  let appliedDiscount = 0; // v odstotkih, npr. 0.10
  const FREE_SHIPPING_THRESHOLD = 20.00;
  const STANDARD_SHIPPING = 3.50;

  // Naloži košarico iz localStorage, če obstaja
  const savedCart = localStorage.getItem('sokic_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem('sokic_cart', JSON.stringify(cart));
  }

  // ================= 3. Elementi DOM =================
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const btnOpenCart = document.getElementById('btnOpenCart');
  const btnCloseCart = document.getElementById('btnCloseCart');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartCounterBadge = document.getElementById('cartCounterBadge');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartDiscountRow = document.getElementById('cartDiscountRow');
  const cartDiscountAmountEl = document.getElementById('cartDiscountAmount');
  const cartShippingCostEl = document.getElementById('cartShippingCost');
  const cartGrandTotalEl = document.getElementById('cartGrandTotal');
  const freeShippingBar = document.getElementById('freeShippingBar');
  const freeShippingMsg = document.getElementById('freeShippingMsg');

  // Checkout modal elementi
  const checkoutModal = document.getElementById('checkoutModal');
  const btnCheckout = document.getElementById('btnCheckout');
  const btnCloseCheckout = document.getElementById('btnCloseCheckout');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutFormWrapper = document.getElementById('checkoutFormWrapper');
  const checkoutSuccessWrapper = document.getElementById('checkoutSuccessWrapper');
  const checkoutTotalPreview = document.getElementById('checkoutTotalPreview');

  // QR Modal elementi
  const qrModal = document.getElementById('qrModal');
  const btnOpenQrModal = document.getElementById('btnOpenQrModal');
  const btnCloseQrModal = document.getElementById('btnCloseQrModal');
  const btnDismissQr = document.getElementById('btnDismissQr');

  if (btnOpenQrModal && qrModal) {
    btnOpenQrModal.addEventListener('click', () => {
      qrModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeQrModal() {
    if (qrModal) {
      qrModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (btnCloseQrModal) btnCloseQrModal.addEventListener('click', closeQrModal);
  if (btnDismissQr) btnDismissQr.addEventListener('click', closeQrModal);
  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) closeQrModal();
    });
  }

  // Hero elementi
  const heroCanImg = document.getElementById('heroCanImg');
  const stageGlowAura = document.getElementById('stageGlowAura');
  const activeFlavorName = document.getElementById('activeFlavorName');
  const activeFlavorNotes = document.getElementById('activeFlavorNotes');
  const btnHeroAddToCart = document.getElementById('btnHeroAddToCart');
  const flavorTabBtns = document.querySelectorAll('.flavor-tab-btn');

  let currentActiveFlavorKey = 'triglav';

  // ================= 4. Hero Switcher Funkcionalnost =================
  function switchHeroFlavor(flavorKey) {
    const data = products[flavorKey];
    if (!data) return;
    currentActiveFlavorKey = flavorKey;

    // Posodobi gumbe zavihkov
    flavorTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.flavor === flavorKey);
    });

    // Animacija pločevinke
    heroCanImg.style.opacity = '0';
    heroCanImg.style.transform = 'translateY(15px) scale(0.95)';

    setTimeout(() => {
      heroCanImg.src = data.image;
      heroCanImg.alt = `Sokič ${data.name} 300 ml`;
      stageGlowAura.style.background = `radial-gradient(circle, ${data.glowColor} 0%, rgba(255,255,255,0) 70%)`;
      activeFlavorName.textContent = data.name;
      activeFlavorNotes.textContent = data.tagline;

      heroCanImg.style.opacity = '1';
      heroCanImg.style.transform = 'translateY(0px) scale(1)';
    }, 200);
  }

  flavorTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const flavorKey = btn.dataset.flavor;
      switchHeroFlavor(flavorKey);
    });
  });

  if (btnHeroAddToCart) {
    btnHeroAddToCart.addEventListener('click', () => {
      addToCart(currentActiveFlavorKey, 1);
    });
  }

  // ================= 5. Upravljanje Košarice =================
  function openCartDrawer() {
    cartBackdrop.classList.add('open');
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartBackdrop.classList.remove('open');
    cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (btnOpenCart) btnOpenCart.addEventListener('click', openCartDrawer);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

  function addToCart(productId, quantity = 1) {
    const product = products[productId];
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      cart[existingIndex].qty += quantity;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        volume: product.volume,
        qty: quantity
      });
    }

    saveCart();
    renderCart();
    openCartDrawer();

    // Animacija števca v navigaciji
    if (cartCounterBadge) {
      cartCounterBadge.classList.add('pop');
      setTimeout(() => cartCounterBadge.classList.remove('pop'), 250);
    }

    showToast(`Dodano v košarico: ${product.name} (${quantity}x)`);
  }

  function updateItemQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    showToast('Izdelek odstranjen iz košarice');
  }

  function calculateCartTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discountAmount = subtotal * appliedDiscount;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
    const shipping = isFreeShipping ? 0 : STANDARD_SHIPPING;
    const grandTotal = Math.max(0, subtotal - discountAmount + shipping);
    const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return {
      subtotal,
      discountAmount,
      shipping,
      grandTotal,
      isFreeShipping,
      totalItemsCount
    };
  }

  function renderCart() {
    const totals = calculateCartTotals();

    // Posodobi števce
    if (cartCounterBadge) {
      cartCounterBadge.textContent = totals.totalItemsCount;
    }

    // Prikaz brezplačne poštnine
    if (freeShippingBar && freeShippingMsg) {
      const pct = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      freeShippingBar.style.width = `${pct}%`;

      if (totals.subtotal === 0) {
        freeShippingMsg.innerHTML = `Brezplačna dostava pri naročilu nad <strong>${FREE_SHIPPING_THRESHOLD.toFixed(2)} €</strong>`;
      } else if (totals.isFreeShipping) {
        freeShippingMsg.innerHTML = `🎉 <strong>Čestitamo!</strong> Upravičeni ste do brezplačne poštnine!`;
      } else {
        const remaining = (FREE_SHIPPING_THRESHOLD - totals.subtotal).toFixed(2);
        freeShippingMsg.innerHTML = `Dodaj še <strong>${remaining} €</strong> za brezplačno poštnino!`;
      }
    }

    // Prazno stanje ali seznam
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🥫</div>
          <h3>Vaša košarica je prazna</h3>
          <p style="margin-top:6px; font-size:0.9rem;">Izberite svoj najljubši okus Sokič in se osvežite z naravno energijo!</p>
        </div>
      `;
      if (btnCheckout) btnCheckout.disabled = true;
    } else {
      if (btnCheckout) btnCheckout.disabled = false;
      cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item-row" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-unit-price">${item.volume} • ${item.price.toFixed(2)} € / kos</div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
              <div class="qty-control">
                <button class="qty-btn btn-cart-dec" data-id="${item.id}" title="Zmanjšaj">−</button>
                <input type="text" class="qty-input" value="${item.qty}" readonly>
                <button class="qty-btn btn-cart-inc" data-id="${item.id}" title="Povečaj">+</button>
              </div>
              <div class="cart-item-total">${(item.price * item.qty).toFixed(2)} €</div>
            </div>
          </div>
          <button class="btn-remove-item" data-id="${item.id}" title="Odstrani">✕</button>
        </div>
      `).join('');

      // Dogodki za elemente v vozičku
      cartItemsList.querySelectorAll('.btn-cart-dec').forEach(btn => {
        btn.addEventListener('click', () => updateItemQty(btn.dataset.id, -1));
      });
      cartItemsList.querySelectorAll('.btn-cart-inc').forEach(btn => {
        btn.addEventListener('click', () => updateItemQty(btn.dataset.id, 1));
      });
      cartItemsList.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
      });
    }

    // Povzetek cen
    if (cartSubtotalEl) cartSubtotalEl.textContent = `${totals.subtotal.toFixed(2)} €`;

    if (cartDiscountRow) {
      if (appliedDiscount > 0) {
        cartDiscountRow.style.display = 'flex';
        cartDiscountAmountEl.textContent = `-${totals.discountAmount.toFixed(2)} € (${appliedDiscount * 100}%)`;
      } else {
        cartDiscountRow.style.display = 'none';
      }
    }

    if (cartShippingCostEl) {
      cartShippingCostEl.textContent = totals.shipping === 0 ? 'Brezplačno' : `${totals.shipping.toFixed(2)} €`;
    }

    if (cartGrandTotalEl) {
      cartGrandTotalEl.textContent = `${totals.grandTotal.toFixed(2)} €`;
    }
  }

  // ================= 6. Kupon za popust =================
  const couponInput = document.getElementById('couponInput');
  const btnApplyCoupon = document.getElementById('btnApplyCoupon');

  if (btnApplyCoupon && couponInput) {
    btnApplyCoupon.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === 'SOKIC10' || code === 'LENART10' || code === 'NARAVA10' || code === 'POMLAD10') {
        appliedDiscount = 0.10;
        showToast('Kupon unovčen! 10% popust priznan. 🎉');
        couponInput.value = '';
        renderCart();
      } else if (code === '') {
        showToast('Prosimo, vpišite kodo za popust.');
      } else {
        showToast('Neveljavna koda. Poskusite z "SOKIC10".');
      }
    });
  }

  // ================= 7. Gumbi za dodajanje v trgovini (Shop Grid) =================
  document.querySelectorAll('.btn-add-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.product;
      const card = btn.closest('.product-card');
      let qty = 1;
      if (card) {
        const qtyInput = card.querySelector('.product-qty-val');
        if (qtyInput) qty = parseInt(qtyInput.value) || 1;
      }
      addToCart(productId, qty);
    });
  });

  // Količinski gumbi na karticah izdelkov
  document.querySelectorAll('.btn-product-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.product-qty-val');
      if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
      }
    });
  });

  document.querySelectorAll('.btn-product-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('.product-qty-val');
      if (input && parseInt(input.value) < 99) {
        input.value = parseInt(input.value) + 1;
      }
    });
  });

  // Dodajanje Trio paketa
  const btnAddBundle = document.getElementById('btnAddBundle');
  if (btnAddBundle) {
    btnAddBundle.addEventListener('click', () => {
      addToCart('bundle_trio', 1);
    });
  }

  // ================= 8. Blagajna (Checkout Flow) =================
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (cart.length === 0) return;
      closeCartDrawer();
      const totals = calculateCartTotals();
      if (checkoutTotalPreview) {
        checkoutTotalPreview.textContent = `${totals.grandTotal.toFixed(2)} € (vključuje poštnino in DDV)`;
      }
      if (checkoutFormWrapper) checkoutFormWrapper.style.display = 'block';
      if (checkoutSuccessWrapper) checkoutSuccessWrapper.style.display = 'none';
      checkoutModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (btnCloseCheckout) {
    btnCloseCheckout.addEventListener('click', () => {
      checkoutModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Izbira načina plačila v modalu
  const paymentCards = document.querySelectorAll('.payment-radio-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Oddaja naročila
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btnSubmit = checkoutForm.querySelector('.btn-place-order');
      btnSubmit.innerHTML = `<span>Obdelujem naročilo...</span>`;
      btnSubmit.disabled = true;

      setTimeout(() => {
        const orderNumber = '#SOK-' + Math.floor(100000 + Math.random() * 900000);
        const orderNumberEl = document.getElementById('successOrderNumber');
        if (orderNumberEl) orderNumberEl.textContent = orderNumber;

        // Izprazni košarico
        cart = [];
        appliedDiscount = 0;
        saveCart();
        renderCart();

        if (checkoutFormWrapper) checkoutFormWrapper.style.display = 'none';
        if (checkoutSuccessWrapper) checkoutSuccessWrapper.style.display = 'block';

        btnSubmit.innerHTML = `<span>Oddaj naročilo</span>`;
        btnSubmit.disabled = false;
        checkoutForm.reset();
        showToast(`Hvala! Vaše naročilo ${orderNumber} je bilo sprejeto.`);
      }, 1000);
    });
  }

  const btnFinishOrder = document.getElementById('btnFinishOrder');
  if (btnFinishOrder) {
    btnFinishOrder.addEventListener('click', () => {
      checkoutModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // ================= 9. Pogosta vprašanja (FAQ Accordion) =================
  document.querySelectorAll('.faq-question').forEach(questionBtn => {
    questionBtn.addEventListener('click', () => {
      const item = questionBtn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Zapri ostale
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ================= 10. Newsletter =================
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        showToast('Uspešna prijava! Koda SOKIC10 za 10% popust je pripravljena.');
        emailInput.value = '';
      }
    });
  }

  // ================= 11. Toast sistem =================
  const toastContainer = document.getElementById('toastContainer');
  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-pill';
    toast.innerHTML = `<span>🌿</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ================= 12. Mobilni meni =================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.querySelector('.nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '76px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = '#ffffff';
      navLinks.style.padding = '20px';
      navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
      navLinks.style.borderBottom = '1px solid var(--border-color)';
    });
  }

  // ================= 13. Začetni izris =================
  renderCart();
  switchHeroFlavor('triglav');
});
