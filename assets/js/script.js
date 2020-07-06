const key = "081b7a37835c16051ff41b4219746af8";
var refreshTime;
const cityBtnCoords = [
    {coords: ["33.7490", "-84.3880"],
        city:"Atlanta"},
    {coords: ["30.2672", "-97.7431"],
        city:"Austin"},
    {coords: ["41.8781","-87.6298"],
        city: "Chicago"},
    {coords: ["39.7392", "-104.9903"],
        city: "Denver"},
    {coords: ["40.7128", "-74.0060"],
        city: "New York"},
    {coords: ["28.5383", "-81.3792"],
        city: "Orlando"},
    {coords: ["37.7749", "-122.4194"],
        city: "San Francisco"},
    { coords: ["47.6062", "-122.3321"],
        city: "Seattle"}
]

var weatherInfo = "";

$.noConflict();

 

//check localStorage for "tempUnit" and set to "F" if null
var tempUnit = localStorage.getItem("tempUnit");
if (tempUnit === null ){
    tempUnit = "f";
    localStorage.setItem("tempUnit", "f");
}
else if (tempUnit === "c"){
    jQuery("#f").removeClass("active");
    jQuery("#c").addClass("active");
}

jQuery("#unitSelector").on("click", function(event){
    tempUnit = event.target.id;
    localStorage.setItem("tempUnit", tempUnit);
})

var updateGraph = function (weatherobj) {
    var plot = jQuery("#plot");
    var xVals = [];
    var yTempVals = [];
    var yHumidityVals = [];
    for (var i = 0; i < 6; i++) {
        xVals.push(moment.unix(weatherobj.hourly[i].dt).format("M-D ha"));
        yTempVals.push(weatherobj.hourly[i].temp)
        yHumidityVals.push(weatherobj.hourly[i].humidity)
    }
    var plotTemp = {
        x: xVals,
        y: yTempVals,
        type: "scatter",
        marker: {
            color: 'rgb(228, 105, 105)',
            size: 5,
            line: {
                color: 'rgb(228, 105, 105)',
                width: 2
            }
        }
    }
    var plotHumidity = {
        x: xVals,
        y: yHumidityVals,
        yaxis: 'y2',
        type: "scatter",
        marker: {
            color: 'rgb(34, 118, 176)',
            size: 5,
            line: {
                color: 'rgb(34, 118, 176)',
                width: 2
            }
        }
    }
    var data = [plotTemp, plotHumidity]
    var layout = {
        title: 'Next 6 Hours',
        showlegend: false,
        xaxis: {
            title: 'Hour',
            showgrid: false,
            zeroline: false,
            tickangle: 45
        },
        yaxis: {
            title: 'Temperature (°' + tempUnit.toUpperCase() + ')',
            showline: true,
            titlefont: { color: 'rgb(228, 105, 105)' },

            tickfont: { color: 'rgb(228, 105, 105)' }
        },
        font: {
            //match BS "dark" color
            color: 'rgb(52,58,64)'
        },
        yaxis2: {
            title: 'Relative Humidity (%)',
            titlefont: { color: 'rgb(34, 118, 176)' },
            tickfont: { color: 'rgb(34, 118, 176)' },
            overlaying: 'y',
            side: 'right',
            range: [0, 100]
        }
    };
    Plotly.newPlot("plot", data, layout, { displayModeBar: false, responsive: true });
}

var updateForecast = function(weatherobj){
    var icondaily;
    for (var i = 1; i < 6; i++){
        with (jQuery("#day-" + i.toString() + " div")){
            children("h5").text(moment.unix(weatherobj.daily[i-1].dt).format("MM/DD/YYYY"));
            icondaily = weatherobj.daily[i - 1].weather[0].icon;
            children("img").attr("src", "http://openweathermap.org/img/wn/" + icondaily + "@2x.png")
            children("p").children(".forecast-temp").text(Math.round(weatherobj.daily[i - 1].temp.max) + "°");
            children("p").children(".forecast-humidity").text(Math.round(weatherobj.daily[i - 1].humidity) + "%");

        }
    }
}

var updateInfo = function(weatherobj, index){
    //update city name in #city-name
    refreshTime = moment();
    if (Number.isInteger(index)){
        console.log("index is integer")
        jQuery("#city-name").text(cityBtnCoords[index].city + moment.unix(weatherobj.current.dt).format(" (MM/DD/YYYY)"));
    }
    else { 
        console.log("index is empty");
        console.dir(weatherobj)
        jQuery("#city-name").text(index + moment.unix(weatherobj.current.dt).format(" (MM/DD/YYYY)"));
    }

    var icon = weatherobj.current.weather[0].icon;
    //update icon src
    jQuery("#current-icon").attr("src", "http://openweathermap.org/img/wn/" + icon + "@2x.png")

    //update current temperature
    jQuery("#current-temperature").text(Math.round(weatherobj.current.temp) 
        + "° (Feels Like " + Math.round(weatherobj.current.feels_like) + "°)");

    //update current humidity
    jQuery("#current-humidity").text(Math.round(weatherobj.current.humidity) + "%");
    //add image for wind direction?

    //update current wind speed
    jQuery("#current-windspeed").text(Math.round(weatherobj.current.wind_speed) + "mph");
    
    //update current UV index
    with (jQuery("#current-uvindex")){
        text(weatherobj.current.uvi);
        removeClass();
        var uvindex = parseFloat(weatherobj.current.uvi);
        if (uvindex >= 11) { addClass("badge badge-purple rounded")}
        else if (uvindex < 11 && uvindex >= 8) { addClass("badge badge-danger rounded")}
        else if (uvindex < 8 && uvindex >= 6) { addClass("badge badge-orange rounded")}
        else if (uvindex < 6 && uvindex >= 3) { addClass("badge badge-warning rounded")}
        else { addClass("badge badge-success rounded")}
    }   

    updateForecast(weatherobj);
    updateGraph(weatherobj);
};

var getWeatherFromCityName = function(cityState) {

    var unit = (tempUnit === "f") ? "imperial" : "metric"
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityState +  "&exclude=minutely&appid=" + key + "&units=" + unit;
    // make a request to the url
    fetch(apiUrl).then(function (response) {
        response.json().then(function (data) {

            if (data.cod === "404") {
                //didn't work
                jQuery("#failedmessage").removeClass("d-none")
            }
            else {
                //worked, hide failure message
                jQuery("#failedmessage").addClass("d-none")
                var cityName = data.name;
                var lat = data.coord.lat;
                var long = data.coord.lon;
                apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon="
                    + long + "&exclude=minutely&appid=" + key + "&units=" + unit;
                
                fetch(apiUrl).then(function (response) {
                    response.json().then(function (data) {
                        updateInfo(data, cityName);
                    })
                });
            };
        });
    });
}


jQuery("#city-list a").on("click", function(){
    var index = parseInt(jQuery(this).attr("id"));
    var lat = cityBtnCoords[index].coords[0]
    var long = cityBtnCoords[index].coords[1] 
    var unit = (tempUnit === "f") ? "imperial" : "metric"
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" 
        + long + "&exclude=minutely&appid=" + key + "&units=" + unit;

    // make a request to the url
    fetch(apiUrl).then(function (response) {
        response.json().then(function (data) {
            console.dir(data);
            updateInfo(data, index);
        });
    });
});
jQuery("#searchInput").on("submit", function(){
    event.preventDefault();
    var city = jQuery(this).children()[0].value.trim();
    var citystatestring;
    if (city.indexOf(",") != -1){
        var citystatearry = city.split(",");
        citystatestring = citystatearry.join(",");
    }
    else {citystatestring=city}
    console.log(citystatestring)
    getWeatherFromCityName(citystatestring);
})


var defaultCity = localStorage.getItem("defaultCity");
if (defaultCity === null) {
    localStorage.setItem("defaultCity", "Atlanta");
}
else {
    getWeatherFromCityName(defaultCity);
}
