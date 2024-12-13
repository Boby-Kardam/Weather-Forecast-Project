const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "71f6c81b2a46dce664ba3e4546e4d7a4"; //API key for OpenWeatherMap

const createWeatherCard = (cityName , weatherItem , index) => {
    if(index === 0){ //HTMLfor main weather card
        return `<div class="details">
                    <h2>${cityName} ( ${weatherItem.dt_txt.split(" ")[0]} )</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    return `<li class="card">
                <h3>( ${weatherItem.dt_txt.split(" ")[0]} )</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li>`;
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {        
        //Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        
        //Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";        


        //Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem , index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName , weatherItem , index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName , weatherItem , index));
            }            
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); //Get user entered city name and remove extra spaces
    if(!cityName) return; //Return if cityname is empty
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;   
    
    //Get entered city coordinates ( Latitude , Longitude , and name ) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);        
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    })
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude,longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;
 
            //Get city name from coordinates using reverse geocoding API 
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);                     
            }).catch(() => {
                alert("An error occurred while fetching the city!");
            })
                       
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied.Please reset location permission to grand access again.")
            }            
        }
    );
}

locationButton.addEventListener("click" , getUserCoordinates);
searchButton.addEventListener("click" , getCityCoordinates);
cityInput.addEventListener("keyup" , e => e.key === "Enter" && getCityCoordinates());