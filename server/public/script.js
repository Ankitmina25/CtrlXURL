const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.form-panel');
const statusMessage = document.getElementById('statusMessage');
const otpEmail = document.getElementById('otpEmail');

const showPanel = (targetId) => {
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });

  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.target === targetId);
  });
};

const setMessage = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#b00020' : '#111';
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    showPanel(tab.dataset.target);
    setMessage('');
  });
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Register failed');
    }

    otpEmail.value = payload.email;
    showPanel('otpForm');
    setMessage(data.message || 'OTP sent. Ab verify karo.');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setMessage(data.message || 'Login successful');
  } catch (error) {
    setMessage(error.message, true);
  }
});

document.getElementById('otpForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    setMessage(data.message || 'OTP verified successfully');
  } catch (error) {
    setMessage(error.message, true);
  }
});