// list of key variables
var myAPI = "576a8e2d6e568b9cb3853f354fbfa33e";
var currentCity = "";
var lastCity = "";

// Error handler for fetch requests
var handleErrors = function(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// function to display current weather conditions
var getCurrentConditions = function(event) {
    // Obtain city name from the search box
    let city = $('#citySearch').val();
    currentCity= $('#citySearch').val();

    // fetch from API using the url
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(queryURL)
    .then(handleErrors)
    .then(function(response) {
        return response.json();
    })

    .then(function(response) {
        // Save city to local storage
        saveCity(city);
        $('#searchError').text("");

        // current weather icon
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        
        // offset UTC timezone using moment.js
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        
        // show cities list
        renderCities();
        
        // obtain 5 day forecast for searched city
        getFiveDayForecast(event);
        
        // list 5 day forecast for searched city
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;

        // append the results to the DOM
        $('#currentWeather').html(currentWeatherHTML);

        // get the lat and long for the UV search
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + myAPI;
        
        // api solution for CORS error
        uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;

        // fetch the uv info and a color display
        fetch(uvQueryURL)
        .then(handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}

// function to obtain 5 day forecast
var getFiveDayForecast = function(event) {
    let city = $('#citySearch').val();

    
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    
    // fetch api
    fetch(queryURL)
        .then (handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;

        // loop 5 day forecast
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
           
            // only displaying mid-day forecasts
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-2">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Wind: ${dayData.wind.speed} mph</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        // build html template
        fiveDayForecastHTML += `</div>`;
        
        // append 5-day forecast to the DOM
        $('#fiveDayForecast').html(fiveDayForecastHTML);
    })
}

// save city to localStorage
var saveCity = function(newCity) {
    let cityExists = false;
   
    
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    // save to localStorage if new
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

// show list of cities searched
var renderCities = function() {
    $('#history').empty();

    // if localStorage is empty
    if (localStorage.length===0){
        if (lastCity){
            $('#citySearch').attr("value", lastCity);
        } else {
            $('#citySearch').attr("value", "Raleigh");
        }
    } else {
        // build key of last city
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);

        // set search input to last city searched
        $('#citySearch').attr("value", lastCity);

        // append stored cities
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            
            if (currentCity===""){
                currentCity=lastCity;
            }
            
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            // append city to page
            $('#history').prepend(cityEl);
        }
        // add clear button
        if (localStorage.length>0){
            $('#clearStorage').html();
        } else {
            $('#clearStorage').html('');
        }
    }
    
}

// new city search event listener
$('#search').on("click", function(event) {
event.preventDefault();
currentCity = $('#citySearch').val();
getCurrentConditions(event);
});

// old city search event listener
$('#history').on("click", function(event) {
    event.preventDefault();
    $('#citySearch').val(event.target.textContent);
    currentCity=$('#citySearch').val();
    getCurrentConditions(event);
});

// clear search event listener
$("#clearStorage").on("click", function(event) {
    localStorage.clear();
    renderCities();
});

// show cities
renderCities();

// get current conditions
getCurrentConditions();