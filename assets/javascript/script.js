// list of key variables
var myAPI = "576a8e2d6e568b9cb3853f354fbfa33e";
var currentCity = ""
var lastCity =""

// function to display current weather conditions
var getCurrentWeather = function(event) {
    //obtain city name from search
    let city = $("#citySearch").val();
    currentCity = $("#citySearch").val();

    // fetch from the API using the URL
    let weatherAPI = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(weatherAPI)
    .then(handleErrors)
    .then(function(response) {
        return response.json();
    })

    .then(function(response) {
        // save city to local storage
        saveCity(city);
        $("#searchError").text("");

        // current weather icon
        let currentWeatherIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

        // offset UTC timezone using moment.js
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

        // show city lsit
        renderCities();

        // obtain 5 day forecast for searched city
        getFiveDayForecast(event);

        // list the 5 day forecast
        let currentWeatherHTML = `
        <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></img></h3>
        <ul class="list-unstyled">
            <li>Temperature: ${response.main.temp}&#8457;</li>
            <li>Humidity: ${response.main.humidity}%</li>
            <li>Wind Speed: ${response.main.speed} mph</li>
            <li id="uvIndex">UV Index:</li>
        </ul>`;

        // append the results to the DOM
        $("#currentWeather").html(currentWeatherHTML);

        // get the lat and long for the UV search
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon" + longitude + "&APPID" + myAPI;

        // api solution for CORS error
        uvURL = "https://cors-anywhere.herokuapp.com/" + uvURL;

        // fetch the uv info and a color display
        fetch(uvURL)
        .then(handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            let uvIndex = response.value;
            $("#uvIndex").html('UV Index: <span id="uvVal"> ${uvIndex}<span>');
            if (uvIndex >= 0 && uvIndex < 3) {
                $("#uvVal").attr("class", "uv-favorable");
            } else if (uvIndex >= 3 && uvIndex < 8) {
                $("#uvVal").attr("class", "uv-moderate");
            } else if (uvIndex >= 8) {
                $("#uvVal").attr("class", "uv-severe");
            }
        });
    })
}

// new city search event listener
$("#search").on("click", function(event) {
    event.preventDefault();
    currentCity = $("citySearch").val();
    getCurrentWeather(event);
})

// error handler for fetch requests
var handleErrors = function(response) {
    if (!response.ok) {
        throw error(response.statusText);
    }
    return response;
}

// show cities
renderCities();

// get current conditions
getCurrentWeather();
