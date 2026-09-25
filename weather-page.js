const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const KUANTAN_LOCATION = {
    latitude: 3.8077,
    longitude: 103.3260
};

const weatherCodeDetails = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Depositing rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Moderate drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    61: ["Slight rain", "🌦️"],
    63: ["Moderate rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    71: ["Slight snow", "🌨️"],
    73: ["Moderate snow", "🌨️"],
    75: ["Heavy snow", "❄️"],
    80: ["Slight rain showers", "🌦️"],
    81: ["Moderate rain showers", "🌧️"],
    82: ["Violent rain showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Thunderstorm with heavy hail", "⛈️"]
};

const elements = {
    title: document.getElementById("today-weather-title"),
    updated: document.getElementById("weather-page-updated"),
    icon: document.getElementById("weather-page-icon"),
    temperature: document.getElementById("weather-page-temperature"),
    feelsLike: document.getElementById("weather-page-feels-like"),
    humidity: document.getElementById("weather-page-humidity"),
    rainfall: document.getElementById("weather-page-rainfall"),
    rainChance: document.getElementById("weather-page-rain-chance"),
    wind: document.getElementById("weather-page-wind"),
    highLow: document.getElementById("weather-page-high-low"),
    forecast: document.getElementById("seven-day-forecast"),
    error: document.getElementById("weather-page-error")
};

function getWeatherDetails(code) {
    return weatherCodeDetails[Number(code)] || ["Conditions unavailable", "🌡️"];
}

function formatDay(date, index) {
    if (index === 0) {
        return "Today";
    }

    return new Intl.DateTimeFormat("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "short",
        timeZone: "Asia/Kuala_Lumpur"
    }).format(new Date(`${date}T12:00:00`));
}

function formatUpdatedTime(time) {
    return new Intl.DateTimeFormat("en-MY", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kuala_Lumpur"
    }).format(new Date(time));
}

function renderToday(data) {
    const current = data.current;
    const details = getWeatherDetails(current.weather_code);
    const todayHigh = data.daily.temperature_2m_max[0];
    const todayLow = data.daily.temperature_2m_min[0];
    const currentHourIndex = data.hourly.time.findIndex(time => time.slice(0, 13) === current.time.slice(0, 13));
    const rainChance = currentHourIndex >= 0
        ? data.hourly.precipitation_probability[currentHourIndex]
        : null;

    elements.title.textContent = details[0];
    elements.updated.textContent = `Updated ${formatUpdatedTime(current.time)}`;
    elements.icon.textContent = details[1];
    elements.temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
    elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.rainfall.textContent = `${current.precipitation} mm`;
    elements.rainChance.textContent = rainChance === null ? "Unavailable" : `${rainChance}%`;
    elements.wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    elements.highLow.textContent = `${Math.round(todayHigh)}°C / ${Math.round(todayLow)}°C`;
}

function renderForecast(data) {
    elements.forecast.innerHTML = data.daily.time.map((date, index) => {
        const details = getWeatherDetails(data.daily.weather_code[index]);
        const rainChance = data.daily.precipitation_probability_max[index];
        const rainTotal = data.daily.precipitation_sum[index];

        return `
            <article class="forecast-day-card">
                <h3>${formatDay(date, index)}</h3>
                <span class="forecast-day-icon" aria-hidden="true">${details[1]}</span>
                <p class="forecast-day-condition">${details[0]}</p>
                <p class="forecast-day-temperature">${Math.round(data.daily.temperature_2m_max[index])}° <span>/ ${Math.round(data.daily.temperature_2m_min[index])}°</span></p>
                <dl>
                    <div><dt>Rain chance</dt><dd>${rainChance}%</dd></div>
                    <div><dt>Rain total</dt><dd>${rainTotal} mm</dd></div>
                    <div><dt>Wind</dt><dd>${Math.round(data.daily.wind_speed_10m_max[index])} km/h</dd></div>
                </dl>
            </article>
        `;
    }).join("");
}

async function loadWeather() {
    const query = new URLSearchParams({
        latitude: KUANTAN_LOCATION.latitude,
        longitude: KUANTAN_LOCATION.longitude,
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        hourly: "precipitation_probability",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
        timezone: "Asia/Kuala_Lumpur",
        forecast_days: 7
    });

    try {
        const response = await fetch(`${WEATHER_API_URL}?${query}`);
        if (!response.ok) {
            throw new Error(`Weather request failed with status ${response.status}`);
        }

        const data = await response.json();
        renderToday(data);
        renderForecast(data);
        elements.error.hidden = true;
    } catch (error) {
        console.error("Weather page data unavailable:", error);
        elements.error.hidden = false;
        elements.forecast.innerHTML = "";
    }
}

function setupNavigation() {
    const navToggle = document.getElementById("nav-toggle");
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const siteNav = document.getElementById("site-nav");

    function toggleNavigation() {
        const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isExpanded));
        navToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
        mobileMenuToggle.setAttribute("aria-expanded", String(!isExpanded));
        siteNav.classList.toggle("is-open", !isExpanded);
    }

    navToggle.addEventListener("click", toggleNavigation);
    mobileMenuToggle.addEventListener("click", toggleNavigation);
    siteNav.addEventListener("click", event => {
        if (event.target.closest("a")) {
            navToggle.setAttribute("aria-expanded", "false");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
            siteNav.classList.remove("is-open");
        }
    });
}

setupNavigation();
loadWeather();
setInterval(loadWeather, 5 * 60 * 1000);
