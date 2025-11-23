// === LOGIN PAGE ===
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const popup = document.getElementById('popup');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    popup.textContent = "Login berhasil!";
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      window.location.href = 'index.html'; // redirect ke halaman utama
    }, 1500);
  });

  togglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePassword.textContent = 'Hide';
    } else {
      passwordInput.type = 'password';
      togglePassword.textContent = 'Show';
    }
  });
}

// === REGISTER PAGE ===
const registerForm = document.getElementById('registerForm');
const togglePasswordReg = document.getElementById('togglePasswordReg');
const passwordInputReg = document.querySelector('#registerForm #password');

if (registerForm) {
  const popup = document.getElementById('popup');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    popup.textContent = "Register berhasil! Anda akan diarahkan ke halaman login";
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      window.location.href = 'login.html';
    }, 1500);
  });

  togglePasswordReg.addEventListener('click', () => {
    if (passwordInputReg.type === 'password') {
      passwordInputReg.type = 'text';
      togglePasswordReg.textContent = 'Hide';
    } else {
      passwordInputReg.type = 'password';
      togglePasswordReg.textContent = 'Show';
    }
  });
}
