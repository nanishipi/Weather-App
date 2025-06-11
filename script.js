const API_KEY = "96a9020724434661a5f200731251106"

const BASE_URL = 'https://api.weatherapi.com/v1';

const searchButton = document.querySelector('.search-button');
const locationInput = document.querySelector('.location-input');

searchButton.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

async function getWeatherData(city) {
    try {
        const res = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`);
        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        const locationName = data.location.name;

        updateCurrentWeather(locationName, data.current);
        updateHourlyForecast(data.forecast.forecastday[0].hour);
        updateDailyForecast(data.forecast.forecastday);
    } catch (error) {
        console.error(error);
        alert('City not found or weather data could not be fetched.');
    }
}

function updateCurrentWeather(city, current) {
    document.querySelector('.city').textContent = city;
    document.querySelector('.temp').textContent = `${Math.round(current.temp_c)}°`;
    document.querySelector('.condition').textContent = capitalize(current.condition.text);
    document.querySelector('.details').innerHTML = `
        <span>💧 ${current.humidity}%</span>
        <span>💨 ${Math.round(current.wind_kph)} km/h</span>
        <span>☀️ UV ${current.uv}</span>
        <span>🌇 ${current.last_updated.split(' ')[1]}</span>
    `;
}

function updateHourlyForecast(hourly) {
    const hourlyList = document.querySelector('.hourly-list');
    hourlyList.innerHTML = '';

    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
    const hourData = hourly[i];
    const hour = formatHour(new Date(hourData.time).getHours());
    const icon = getWeatherIcon(hourData.condition.text.toLowerCase());
    const temp = `${Math.round(hourData.temp_c)}°`;

    hourlyList.innerHTML += `
        <div class="hourly-item">
            <p class="hour">${hour}</p>
            <img src="icons/${icon}" alt="">
            <p class="hour-temp">${temp}</p>
        </div>
    `;
}
}

function updateDailyForecast(daily) {
    const dailyList = document.querySelector('.daily-list');
    dailyList.innerHTML = '';

    for (let i = 1; i <= 5 && i < daily.length; i++) {
        const dayData = daily[i];
        const day = new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(dayData.day.condition.text.toLowerCase());
        const temp = `${Math.round(dayData.day.maxtemp_c)}° / ${Math.round(dayData.day.mintemp_c)}°`;

        dailyList.innerHTML += `
            <div class="daily-item">
                <p class="day">${day}</p>
                <img src="icons/${icon}" alt="">
                <p class="day-temp">${temp}</p>
            </div>
        `;
    }
}

function getWeatherIcon(description) {
    if (description.includes('thunder')) return 'stormy.svg';
    if (description.includes('rain') || description.includes('drizzle')) return 'rain.svg';
    if (description.includes('partly') && description.includes('cloud')) return 'partialy-cloudy.svg';
    if (description.includes('cloud')) return 'cloudy.svg';
    if (description.includes('sun') || description.includes('clear')) return 'sunny.svg';

    return 'sunny.svg'; // fallback
}

function formatHour(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${suffix}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}