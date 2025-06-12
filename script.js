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
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        if (!res.ok) throw new Error("City not found");

        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const geoData = await geoRes.json();
        if (!geoData.results || !geoData.results.length) throw new Error("City not found");

        const { latitude, longitude, name, timezone } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,uv_index&hourly=temperature_2m,weathercode,uv_index&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=${timezone}`);
        const data = await weatherRes.json();

        updateCurrentWeather(name, data.current);
        updateHourlyForecast(data.hourly);
        updateDailyForecast(data.daily);
        adjustThemeByHour(new Date().getHours());

    } catch (error) {
        console.error(error);
        alert('City not found or weather data could not be fetched.');
    }
}

function updateCurrentWeather(city, current) {
    const localHour = new Date(current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    document.querySelector('.city').textContent = city;
    document.querySelector('.temp').textContent = `${Math.round(current.temperature_2m)}°`;
    document.querySelector('.condition').textContent = mapWeatherCode(current.weathercode);
    document.querySelector('.details').innerHTML = `
        <span>💧 ${current.relative_humidity_2m}%</span>
        <span>💨 ${Math.round(current.wind_speed_10m)} km/h</span>
        <span>🔆 UV ${current.uv_index ?? '–'}</span>
        <span>🕓 ${localHour}</span>
    `;
}

function updateHourlyForecast(hourly) {
    const hourlyList = document.querySelector('.hourly-list');
    hourlyList.innerHTML = '';

    const currentHour = new Date().getHours();
    for (let i = currentHour; i < currentHour + 24 && i < hourly.time.length; i++) {
        const hour = formatHour(new Date(hourly.time[i]).getHours());
        const icon = getWeatherIcon(mapWeatherCode(hourly.weathercode[i]).toLowerCase());
        const temp = `${Math.round(hourly.temperature_2m[i])}°`;

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

    for (let i = 1; i < daily.time.length && i <= 5; i++) {
        const day = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(mapWeatherCode(daily.weathercode[i]).toLowerCase());
        const temp = `${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°`;

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
    return 'sunny.svg';
}

function formatHour(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${suffix}`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapWeatherCode(code) {
    const codes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Freezing drizzle',
        57: 'Freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Freezing rain',
        67: 'Freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight showers',
        81: 'Moderate showers',
        82: 'Violent showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Thunderstorm with hail'
    };
    return codes[code] || 'Unknown';
}

function adjustThemeByHour(hour) {
    const card = document.querySelector('.weather-card');
    const body = document.body;

    if (hour >= 20 || hour <= 6) {
        card.style.backgroundImage = "url('images/night-sky.jpg')";
        body.style.background = 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)';
    } else {
        card.style.backgroundImage = "";
        body.style.background = '';
    }
}
