// Cart functionality
let cartCount = 0;

// Initialize cart from localStorage
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
    
    // Add click event to cart link
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            if (cartCount > 0) {
                return true;
            } else {
                e.preventDefault();
                showNotification('Keranjang masih kosong!');
            }
        });
    }
});

function loadCartData() {
    const savedCartCount = localStorage.getItem('warmodCartCount');
    const savedCartItems = localStorage.getItem('warmodCartItems');
    
    if (savedCartCount) {
        cartCount = parseInt(savedCartCount);
    }
    
    // Jika ada cart items, hitung ulang count dari items
    if (savedCartItems) {
        const items = JSON.parse(savedCartItems);
        cartCount = items.length;
        localStorage.setItem('warmodCartCount', cartCount.toString());
    }
    
    updateCartDisplay();
}
function addToCart(productData = null) {
    let cartItems = JSON.parse(localStorage.getItem('warmodCartItems') || '[]');
    
    // If product data is provided, save it to cart items
    if (productData) {
        cartItems.push({
            title: productData.title,
            category: productData.category,
            seller: productData.seller,
            price: productData.price,
            image: productData.image
        });
        
        localStorage.setItem('warmodCartItems', JSON.stringify(cartItems));
    }
    
    // Update count based on actual items
    cartCount = cartItems.length;
    localStorage.setItem('warmodCartCount', cartCount.toString());
    updateCartDisplay();
    
    showNotification('Produk berhasil ditambahkan ke keranjang!');
}

// Function untuk Tambah ke Keranjang
function addToCartFromCard(productTitle, productCategory, productSeller, productPrice, productImage) {
    const productData = {
        title: productTitle,
        category: productCategory,
        seller: productSeller,
        price: productPrice,
        image: productImage
    };
    
    addToCart(productData);
}

// Function untuk Beli Sekarang dari product detail
function buyNow() {
    // Data produk dari halaman detail
    const productData = {
        title: 'EP3 Edit Jetbus 3 Pack',
        category: 'BUSSID',
        seller: 'Yellow Flash',
        price: 100000,
        image: 'ets2_20240816_171954_00.png'
    };
    
    // Buat cart baru khusus untuk beli sekarang (hanya 1 item)
    const buyNowCart = [productData];
    localStorage.setItem('warmodCartItems', JSON.stringify(buyNowCart));
    
    // Update counter ke 1
    cartCount = 1;
    localStorage.setItem('warmodCartCount', '1');
    updateCartDisplay();
    
    // Redirect ke checkout page
    window.location.href = 'checkout.html';
}

function addToCart(productData = null) {
    let cartItems = JSON.parse(localStorage.getItem('warmodCartItems') || '[]');
    
    // If product data is provided, save it to cart items
    if (productData) {
        cartItems.push({
            title: productData.title,
            category: productData.category,
            seller: productData.seller,
            price: productData.price,
            image: productData.image
        });
        
        localStorage.setItem('warmodCartItems', JSON.stringify(cartItems));
    }
    
    // Update count based on actual items
    cartCount = cartItems.length;
    localStorage.setItem('warmodCartCount', cartCount.toString());
    updateCartDisplay();
    
    showNotification('Produk berhasil ditambahkan ke keranjang!');
}

function goToCheckout() {
    if (cartCount > 0) {
        window.location.href = 'checkout.html';
    } else {
        showNotification('Keranjang masih kosong!');
    }
}

function updateCartDisplay() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
        
        if (cartCount > 0) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
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

// Add notification animations to CSS
if (!document.querySelector('#cart-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i {
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);
}