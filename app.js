// Ganti dengan API key dari openweathermap.org
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const HISTORY_KEY = 'weather-history';
const MAX_HISTORY = 5;

// DOM elements
const form = document.querySelector('#searchForm');
const input = document.querySelector('#cityInput');
const loading = document.querySelector('#loading');
const error = document.querySelector('#error');
const result = document.querySelector('#weatherResult');
const historySection = document.querySelector('#historySection');
const historyList = document.querySelector('#historyList');

const showLoading = () => {
  loading.classList.remove('hidden');
  error.classList.add('hidden');
  result.classList.add('hidden');
};
const hideLoading = () => loading.classList.add('hidden');
const showError = (message) => {
  error.textContent = message;
  error.classList.remove('hidden');
  result.classList.add('hidden');
};

// Riwayat pencarian (bonus, LocalStorage)
const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
};

const saveHistory = (city) => {
  const updated = [city, ...loadHistory().filter(
    (c) => c.toLowerCase() !== city.toLowerCase()
  )].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  renderHistory();
};

const renderHistory = () => {
  const history = loadHistory();
  historySection.classList.toggle('hidden', history.length === 0);
  // Array method: map
  historyList.innerHTML = history
    .map((c) => `<li><button type="button" data-city="${c}">${c}</button></li>`)
    .join('');
};

// Fetch data cuaca
async function getWeather(city) {
  try {
    showLoading();
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;
    const res = await fetch(url);

    if (res.status === 404) throw new Error(`Kota "${city}" tidak ditemukan.`);
    if (res.status === 401) throw new Error('API key tidak valid. Periksa API_KEY di app.js.');
    if (!res.ok) throw new Error('Server error. Coba lagi nanti.');

    const data = await res.json();
    displayWeather(data);
    saveHistory(data.name);
  } catch (err) {
    // fetch() melempar TypeError saat jaringan bermasalah
    const message = err instanceof TypeError
      ? 'Network error. Periksa koneksi internet Anda.'
      : err.message;
    showError(message);
  } finally {
    hideLoading();
  }
}

// Tampilkan data cuaca
function displayWeather({ name, main, weather }) {
  const [{ description, icon }] = weather;
  document.querySelector('#cityName').textContent = name;
  document.querySelector('#temperature').textContent = `${Math.round(main.temp)}°C`;
  document.querySelector('#description').textContent = description;
  document.querySelector('#humidity').textContent = `Kelembaban: ${main.humidity}%`;
  document.querySelector('#weatherIcon').src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  result.classList.remove('hidden');
}

// Event listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return showError('Nama kota tidak boleh kosong.');
  getWeather(city);
});

historyList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-city]');
  if (!btn) return;
  input.value = btn.dataset.city;
  getWeather(btn.dataset.city);
});

renderHistory();
