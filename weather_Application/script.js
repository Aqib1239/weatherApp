const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// initially variables
let oldTab = userTab;
const API_KEY = "10e4ab168d67da58a293253d2d17aa1f";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if (newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // if Search form container is invisible,then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }

        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}
userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfoByCoordinates(coordinates);
    }
}

async function fetchUserWeatherInfoByCoordinates(coordinates) {
    const { lat, lon } = coordinates;

    // make coordinates invisible
    grantAccessContainer.classList.remove("active");

    // make loader visible
    loadingScreen.classList.add("active");

    // API calling
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${API_KEY}&units=metric`);

        const data = await res.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");
        console.log("Error", err);
    }
}

function renderWeatherInfo(weatherInfo) {

    // first we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-Temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");



    if (cityName && weatherInfo && weatherInfo.name) {
        cityName.innerText = weatherInfo?.name;
    }
    if (countryIcon && weatherInfo && weatherInfo.sys && weatherInfo.sys.country) {
        countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    }
    if (desc && weatherInfo && weatherInfo.weather && weatherInfo.weather[0] && weatherInfo.weather[0].description) {
        desc.innerText = weatherInfo?.weather?.[0]?.description;
    }
    if (weatherIcon && weatherInfo && weatherInfo.weather && weatherInfo.weather[0] && weatherInfo.weather[0].icon) {
        weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    }
    if (temp && weatherInfo && weatherInfo.main && weatherInfo.main.temp) {
        temp.innerText = `${weatherInfo?.main?.temp} °C`;
    }
    if (windspeed && weatherInfo && weatherInfo.wind && weatherInfo.wind.speed) {
        windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    }
    if (humidity && weatherInfo && weatherInfo.main && weatherInfo.main.humidity) {
        humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    }
    if (cloudiness && weatherInfo && weatherInfo.clouds && weatherInfo.clouds.all) {
        cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, (error) => {
            console.error("Error getting location:", error);
        });
    }
    else {
        console.error("Geolocation is not supported");
    }
}

function showPosition(position) {
    console.log("Received position data:", position);
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfoByCoordinates(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessContainer.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName)
        fetchUserWeatherInfoByCity(cityName);
});

async function fetchUserWeatherInfoByCity(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await res.json();
        loadingScreen.classList.remove("active")
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        console.error("Error fetching weather data:", err);
    }
}
