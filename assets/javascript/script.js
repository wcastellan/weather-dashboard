// list of key variables
var myAPI = "576a8e2d6e568b9cb3853f354fbfa33e";
var currentCity = ""
var lastCity =""

// function to display current weather conditions
var getCurrentWeather = (event) => {
    //obtain city name from search
    let city = $("#citySearch").val();
    currentCity = $("#citySearch").val();

    // fetch from the API using the URL
    let weatherAPI = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(weatherAPI)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })

    .then((response) => {
        // save city to local storage
        saveCity(city);
        $("#searchError").text("");

        // current weather icon
        
    })
}

// error handler for fetch requests
var handleErrors = (response) => {
    if (!response.ok) {
        throw error(response.statusText);
    }
    return response;
}

