const PAYMENT_EXPIRY_SECONDS = 50; // Ubah angka ini saja: 120 untuk 2 menit, 300 untuk 5 menit, 7200 untuk 2 jam

// Checkout functionality
const ADMIN_FEE_PERCENTAGE = 0.01; // 1%

// Tambahkan fungsi isValidEmail di sini
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    loadCartItems();
    loadUserEmail();
    setupCheckoutButton();
});

function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-button');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Checkout button clicked');
            processCheckout();
        });
    } else {
        console.error('Checkout button not found!');
    }
}

function loadUserEmail() {
    const profileData = JSON.parse(localStorage.getItem('warmodProfile') || '{}');
    const emailInput = document.getElementById('delivery-email');
    
    if (profileData.email) {
        emailInput.value = profileData.email;
        console.log('Email loaded from profile:', profileData.email);
    }
}

function processCheckout() {
    console.log('processCheckout function called');
    
    const cartItems = JSON.parse(localStorage.getItem('warmodCartItems') || '[]');
    const emailInput = document.getElementById('delivery-email');
    const email = emailInput.value.trim();
    
    console.log('Cart items:', cartItems);
    console.log('Email:', email);
    
    if (cartItems.length === 0) {
        showNotification('Keranjang masih kosong!');
        return;
    }
    
    // Validasi email
    if (!email) {
        showNotification('Harap masukkan email untuk pengiriman mod!');
        emailInput.focus();
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Format email tidak valid!');
        emailInput.focus();
        return;
    }
    
    // Hapus backup
    localStorage.removeItem('warmodCartBackup');
    
    // Buat waktu kadaluarsa: PAYMENT_EXPIRY_SECONDS dari sekarang
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (PAYMENT_EXPIRY_SECONDS * 1000)); // Konversi detik ke milidetik
    
    // Format untuk debug
    const expiryFormatted = `${String(expiresAt.getDate()).padStart(2, '0')}/${String(expiresAt.getMonth() + 1).padStart(2, '0')}/${expiresAt.getFullYear()}, ${String(expiresAt.getHours()).padStart(2, '0')}:${String(expiresAt.getMinutes()).padStart(2, '0')}`;
    console.log('Payment expires at:', expiryFormatted);
    console.log('Payment duration:', PAYMENT_EXPIRY_SECONDS, 'seconds');
    
    // Save order
    const orderData = {
        items: [...cartItems],
        deliveryEmail: email,
        paymentMethod: 'qris',
        timestamp: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(), // Waktu kadaluarsa
        status: 'pending'
    };
    
    localStorage.setItem('warmodCurrentOrder', JSON.stringify(orderData));
    console.log('Order saved:', orderData);
    
    // Clear cart
    localStorage.removeItem('warmodCartItems');
    localStorage.setItem('warmodCartCount', '0');
    updateCartCountDisplay(0);
    
    // Redirect
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 500);
}

// Pastikan fungsi-fungsi ini ada
function loadCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartItems = JSON.parse(localStorage.getItem('warmodCartItems') || '[]');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Keranjang Kosong</h3>
                <p>Belum ada item di keranjang Anda</p>
                <a href="index.html" class="cta-button" style="margin-top: 15px;">Belanja Sekarang</a>
            </div>
        `;
        updateSummary(0);
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
        subtotal += item.price;
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-category">${item.category}</div>
                    <div class="cart-item-seller">${item.seller}</div>
                </div>
                <div class="cart-item-price">Rp. ${item.price.toLocaleString()}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartContainer.innerHTML = cartHTML;
    updateSummary(subtotal);
}

function updateSummary(subtotal) {
    const adminFee = Math.round(subtotal * ADMIN_FEE_PERCENTAGE);
    const total = subtotal + adminFee;
    
    document.getElementById('subtotal').textContent = `Rp. ${subtotal.toLocaleString()}`;
    document.getElementById('admin-fee').textContent = `Rp. ${adminFee.toLocaleString()}`;
    document.getElementById('total-amount').textContent = `Rp. ${total.toLocaleString()}`;
}

function removeFromCart(index) {
    let cartItems = JSON.parse(localStorage.getItem('warmodCartItems') || '[]');
    
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        localStorage.setItem('warmodCartItems', JSON.stringify(cartItems));
        
        const cartCount = cartItems.length;
        localStorage.setItem('warmodCartCount', cartCount.toString());
        
        loadCartItems();
        updateCartCountDisplay(cartCount);
        
        showNotification('Item berhasil dihapus dari keranjang');
    }
}

function updateCartCountDisplay(count) {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'flex' : 'none';
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}