let originalValues = {};

document.addEventListener('DOMContentLoaded', function() {
    loadProfileData();
});

function loadProfileData() {
    // Load profile data from localStorage
    const savedProfile = JSON.parse(localStorage.getItem('warmodProfile') || '{}');
    
    if (savedProfile.name) {
        document.getElementById('profile-name').textContent = savedProfile.name;
        document.getElementById('username').value = savedProfile.name;
    }
    
    if (savedProfile.email) {
        document.getElementById('profile-email').textContent = savedProfile.email;
        document.getElementById('email').value = savedProfile.email;
    }
    
    // HAPUS BAGIAN FOTO PROFIL
}

// HAPUS FUNCTION handleProfileUpload()
// HAPUS FUNCTION terkait upload foto

function enableEdit(fieldId) {
    const input = document.getElementById(fieldId);
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Save original value
    originalValues[fieldId] = input.value;
    
    // Enable editing
    input.removeAttribute('readonly');
    input.focus();
    input.style.background = 'white';
    
    // Show save and cancel buttons
    saveBtn.style.display = 'flex';
    cancelBtn.style.display = 'flex';
}

function cancelEdit() {
    // Restore original values
    Object.keys(originalValues).forEach(fieldId => {
        const input = document.getElementById(fieldId);
        input.value = originalValues[fieldId];
        input.setAttribute('readonly', true);
        input.style.background = '#f5f5f5';
    });
    
    // Hide buttons
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
    
    originalValues = {};
}

function saveProfile() {
    const profileData = JSON.parse(localStorage.getItem('warmodProfile') || '{}');
    
    // Update profile data
    profileData.name = document.getElementById('username').value;
    profileData.email = document.getElementById('email').value;
    
    // Save to localStorage
    localStorage.setItem('warmodProfile', JSON.stringify(profileData));
    
    // Update display
    document.getElementById('profile-name').textContent = profileData.name;
    document.getElementById('profile-email').textContent = profileData.email;
    
    // Disable editing and hide buttons
    document.querySelectorAll('.input-with-edit input').forEach(input => {
        input.setAttribute('readonly', true);
        input.style.background = '#f5f5f5';
    });
    
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
    
    originalValues = {};
    
    showNotification('Profile berhasil disimpan!');
}

// Logout functionality tetap sama
function showLogoutConfirmation() {
    const logoutPopup = document.getElementById('logout-popup');
    if (logoutPopup) {
        logoutPopup.style.display = 'flex';
    } else {
        createLogoutPopup();
    }
}

function createLogoutPopup() {
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.id = 'logout-popup';
    popupOverlay.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h2><strong>Konfirmasi Logout</strong></h2>
                <button class="popup-close" onclick="closeLogoutPopup()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="popup-body">
                <p>Apakah Anda yakin ingin logout?</p>
            </div>
            <div class="popup-actions">
                <button class="popup-btn confirm-btn" onclick="performLogout()">
                    <i class="fas fa-check"></i>
                    Ya, Logout
                </button>
                <button class="popup-btn cancel-btn" onclick="closeLogoutPopup()">
                    <i class="fas fa-times"></i>
                    Batal
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popupOverlay);
}

function closeLogoutPopup() {
    const logoutPopup = document.getElementById('logout-popup');
    if (logoutPopup) {
        logoutPopup.style.display = 'none';
    }
}

function performLogout() {
    // Clear semua data user dari localStorage
    localStorage.removeItem('warmodProfile');
    localStorage.removeItem('warmodCartItems');
    localStorage.removeItem('warmodCartCount');
    localStorage.removeItem('warmodCurrentOrder');
    localStorage.removeItem('warmodIsLoggedIn');
    localStorage.removeItem('warmodOrderHistory');
    
    // Tampilkan notifikasi
    showNotification('Logout berhasil! Mengalihkan...', 'success');
    
    // Redirect ke halaman sebelum login setelah 1.5 detik
    setTimeout(() => {
        window.location.href = 'index-before-login.html';
    }, 1500);
    
    // Tutup popup
    closeLogoutPopup();
}

// Store popup functionality tetap sama
function showStorePopup() {
    document.getElementById('store-popup').style.display = 'flex';
}

function closeStorePopup() {
    document.getElementById('store-popup').style.display = 'none';
}

function createStore() {
    closeStorePopup();
    showNotification('Toko berhasil dibuat! Sekarang Anda dapat mengelola produk Anda.');
}

function showNotification(message, type = 'info') {
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

// Tambahkan CSS animations jika belum ada
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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