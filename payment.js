// 7200 detik = 2 jam, 120 detik = 2 menit (untuk testing)
const PAYMENT_EXPIRY_SECONDS = 50; // Ubah angka ini saja: 120 untuk 2 menit, 300 untuk 5 menit, 7200 untuk 2 jam

// Payment functionality dengan waktu kadaluarsa (GMT+7)
let paymentTimer;
let expiryDateTime;

document.addEventListener('DOMContentLoaded', function() {
    initializePaymentTimer();
    loadPaymentData();
    generateOrderNumber();
});

function initializePaymentTimer() {
    const orderData = JSON.parse(localStorage.getItem('warmodCurrentOrder') || '{}');
    
    // Cek apakah ada transaksi yang aktif
    if (!orderData.items || orderData.items.length === 0 || orderData.status === 'expired') {
        showEmptyTransaction();
        return;
    }
    
    // Jika ada waktu kadaluarsa yang disimpan, gunakan itu
    if (orderData.expiresAt) {
        expiryDateTime = new Date(orderData.expiresAt).getTime();
        console.log('Using stored expiry time:', new Date(expiryDateTime));
    } else {
        // Buat waktu kadaluarsa baru: PAYMENT_EXPIRY_SECONDS dari sekarang
        const now = new Date();
        const expiryTime = new Date(now.getTime() + (PAYMENT_EXPIRY_SECONDS * 1000)); // Konversi detik ke milidetik
        expiryDateTime = expiryTime.getTime();
        
        // Simpan waktu kadaluarsa
        orderData.expiresAt = expiryTime.toISOString();
        localStorage.setItem('warmodCurrentOrder', JSON.stringify(orderData));
        console.log('Created new expiry time:', expiryTime);
        console.log('Payment duration:', PAYMENT_EXPIRY_SECONDS, 'seconds');
    }
    
    // Update display segera
    updateExpiryDisplay();
    updateTimerDisplay();
    
    // Start timer
    startPaymentTimer();
}

function showEmptyTransaction() {
    // Sembunyikan semua elemen pembayaran
    document.getElementById('order-summary').style.display = 'none';
    document.getElementById('qris-payment').style.display = 'none';
    
    // Tampilkan pesan transaksi kosong
    document.getElementById('empty-transaction').style.display = 'block';
    
    // Hapus dari localStorage
    localStorage.removeItem('warmodCurrentOrder');
}

function showPaymentInterface() {
    // Tampilkan semua elemen pembayaran
    document.getElementById('order-summary').style.display = 'block';
    document.getElementById('qris-payment').style.display = 'block';
    
    // Sembunyikan pesan transaksi kosong
    document.getElementById('empty-transaction').style.display = 'none';
}

function updateExpiryDisplay() {
    const expiryDateElement = document.getElementById('payment-expiry-date');
    const expiryDate = new Date(expiryDateTime);
    
    // Format tanggal: dd/mm/yyyy, hh:mm (GMT+7)
    const day = String(expiryDate.getDate()).padStart(2, '0');
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const year = expiryDate.getFullYear();
    const hours = String(expiryDate.getHours()).padStart(2, '0');
    const minutes = String(expiryDate.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
    expiryDateElement.textContent = formattedDate;
}

function updateTimerDisplay(timeLeft = null) {
    const timerElement = document.getElementById('payment-expiry-timer');
    
    if (timeLeft === null) {
        timeLeft = expiryDateTime - new Date().getTime();
    }
    
    if (timeLeft <= 0) {
        timerElement.textContent = '00:00:00';
        timerElement.style.color = '#f44336';
        return;
    }
    
    // Konversi milidetik ke detik, lalu ke jam, menit, detik
    const totalSeconds = Math.floor(timeLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const timerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerElement.textContent = timerText;
    
    // Update title dengan countdown
    document.title = `(${timerText}) Pembayaran - WARMOD`;
    
    // Update warna berdasarkan waktu tersisa
    if (timeLeft <= 300000) { // 5 menit
        timerElement.style.color = '#f44336';
    } else if (timeLeft <= 1800000) { // 30 menit
        timerElement.style.color = '#ff9800';
    } else {
        timerElement.style.color = '#4CAF50';
    }
}

function startPaymentTimer() {
    // Clear existing timer
    if (paymentTimer) {
        clearInterval(paymentTimer);
    }
    
    paymentTimer = setInterval(function() {
        const now = new Date().getTime();
        const timeLeft = expiryDateTime - now;
        
        if (timeLeft <= 0) {
            clearInterval(paymentTimer);
            handlePaymentExpired();
            return;
        }
        
        updateTimerDisplay(timeLeft);
        
        // Update styling berdasarkan waktu tersisa
        const expiryElement = document.querySelector('.payment-expiry');
        if (timeLeft <= 300000) { // 5 menit
            expiryElement.classList.add('critical');
            expiryElement.classList.remove('warning');
        } else if (timeLeft <= 1800000) { // 30 menit
            expiryElement.classList.add('warning');
            expiryElement.classList.remove('critical');
        } else {
            expiryElement.classList.remove('warning', 'critical');
        }
    }, 1000);
}

function loadPaymentData() {
    const orderData = JSON.parse(localStorage.getItem('warmodCurrentOrder') || '{}');
    const itemsContainer = document.getElementById('payment-items');
    let subtotal = 0;
    
    console.log('Order data loaded in payment:', orderData);
    
    if (!orderData.items || orderData.items.length === 0) {
        console.log('No active transaction found');
        showEmptyTransaction();
        return;
    }
    
    let itemsHTML = '';
    
    orderData.items.forEach((item, index) => {
        subtotal += item.price;
        itemsHTML += `
            <div class="payment-item">
                <div class="item-info">
                    <div class="item-name">${item.title}</div>
                    <div class="item-category">${item.category} • ${item.seller}</div>
                </div>
                <div class="item-price">Rp. ${item.price.toLocaleString()}</div>
            </div>
        `;
    });
    
    itemsContainer.innerHTML = itemsHTML;
    updatePaymentTotals(subtotal);
    
    console.log('Payment items loaded successfully:', orderData.items.length, 'items');
}

function updatePaymentTotals(subtotal) {
    const ADMIN_FEE_PERCENTAGE = 0.01; // 1%
    const adminFee = Math.round(subtotal * ADMIN_FEE_PERCENTAGE);
    const total = subtotal + adminFee;
    
    document.getElementById('payment-subtotal').textContent = `Rp. ${subtotal.toLocaleString()}`;
    document.getElementById('payment-admin').textContent = `Rp. ${adminFee.toLocaleString()}`;
    document.getElementById('payment-total').textContent = `Rp. ${total.toLocaleString()}`;
    document.getElementById('qris-amount').textContent = `Rp. ${total.toLocaleString()}`;
}

function generateOrderNumber() {
    let orderData = JSON.parse(localStorage.getItem('warmodCurrentOrder') || '{}');
    
    if (!orderData.orderNumber) {
        orderData.orderNumber = 'WM-' + Math.floor(100000 + Math.random() * 900000);
        localStorage.setItem('warmodCurrentOrder', JSON.stringify(orderData));
    }
    
    document.getElementById('order-number').textContent = orderData.orderNumber;
}

function handlePaymentExpired() {
    // Update order status
    const orderData = JSON.parse(localStorage.getItem('warmodCurrentOrder') || '{}');
    orderData.status = 'expired';
    orderData.expiredAt = new Date().toISOString();
    localStorage.setItem('warmodCurrentOrder', JSON.stringify(orderData));
    
    // Tampilkan pesan transaksi kosong
    setTimeout(() => {
        showEmptyTransaction();
    }, 1000);
    
    showNotification('Waktu pembayaran telah habis. Transaksi telah dihapus.');
}

// Fungsi-fungsi lainnya tetap sama...
function downloadQRIS() {
    const qrisImage = document.getElementById('qris-image');
    const orderNumber = document.getElementById('order-number').textContent;
    
    // Create a temporary link for download
    const link = document.createElement('a');
    link.download = `QRIS-WARMOD-${orderNumber}.png`;
    link.href = qrisImage.src;
    link.click();
    
    showNotification('QR Code berhasil didownload!');
}

function simulatePaymentSuccess() {
    clearInterval(paymentTimer);
    
    document.getElementById('payment-status-text').textContent = 'Pembayaran Berhasil';
    document.getElementById('payment-status-text').classList.add('paid');
    document.querySelector('.status-dot').classList.add('paid');
    document.querySelector('.status-dot').style.animation = 'none';
    
    document.querySelector('.status-description').textContent = 'Pembayaran Anda telah berhasil. Addon akan segera dikirim ke email Anda.';
    document.querySelector('.status-description').style.color = '#4CAF50';
    
    // Update order status
    const orderData = JSON.parse(localStorage.getItem('warmodCurrentOrder') || '{}');
    orderData.status = 'paid';
    orderData.paidAt = new Date().toISOString();
    localStorage.setItem('warmodCurrentOrder', JSON.stringify(orderData));
    
    // Save to order history
    const orderHistory = JSON.parse(localStorage.getItem('warmodOrderHistory') || '[]');
    orderHistory.push(orderData);
    localStorage.setItem('warmodOrderHistory', JSON.stringify(orderHistory));
    
    // Clear current order after successful payment
    setTimeout(() => {
        localStorage.removeItem('warmodCurrentOrder');
        showEmptyTransaction();
    }, 3000);
    
    showNotification('Pembayaran berhasil! Addon akan dikirim ke email Anda.');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
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

// Debug function
function debugPayment() {
    const orderData = JSON.parse(localStorage.getItem('warmodCurrentOrder') || '{}');
    const now = new Date();
    const timeLeft = expiryDateTime - now.getTime();
    
    console.log('=== PAYMENT DEBUG INFO ===');
    console.log('Current time:', now);
    console.log('Expiry time:', new Date(expiryDateTime));
    console.log('Time left:', Math.floor(timeLeft / 1000), 'seconds');
    console.log('Order data:', orderData);
    console.log('========================');
}