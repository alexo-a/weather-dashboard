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

//check localStorage for "tempUnit" and set to "F" if blank


jQuery("#unitSelector").on("click", function(event){
    console.log(event.target.id)//jQuery(this).attr("id"))

})

var updateGraph = function (weatherobj){
    var plot = jQuery("#plot");
    var xVals = [];
    var yVals = [];
    for (var i = 0; i < 6; i++){
        xVals.push(moment.unix(weatherobj.hourly[i].dt).format("ha"));
        yVals.push(weatherobj.hourly[i].temp)
    }
    console.log(xVals, yVals);
    var plot1 = {x: xVals, y: yVals, type:"scatter"}
    var data = [plot1]
    var layout = {
        title: 'Next 6 Hours',
        xaxis: {
            title: 'Hour',
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            title: 'Temperature (°F)',
            showline: true
        },
        font: {
            
            
            color: 'rgb(52,58,64)'
        }
    };
    Plotly.newPlot("plot", data, layout, { displayModeBar: false, responsive: true });
}

var getWeather = function (lat,long) {
    // format the weather api url
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=hourly,daily&appid=" + key ;
    // make a request to the url
    fetch(apiUrl).then(function (response) {
        response.json().then(function (data) {            
            return data;
        });
    });
};

var updateForecast = function(weatherobj){
    var icondaily;
    for (var i = 1; i < 6; i++){
        with (jQuery("#day-" + i.toString() + " div")){
            children("h5").text(moment.unix(weatherobj.daily[i-1].dt).format("MM/DD/YYYY"));
            icondaily = weatherobj.daily[i - 1].weather[0].icon;
            children("img").attr("src", "http://openweathermap.org/img/wn/" + icondaily + "@2x.png")
            children("p").children(".forecast-temp").text(weatherobj.daily[i - 1].temp.max + "°");
            children("p").children(".forecast-humidity").text(weatherobj.daily[i - 1].humidity + "%");

        }
    }
}

var updateInfo = function(weatherobj, index){
    //update city name in #city-name
    //change cityBtnCoords[index].city to whatever comes from google maps api?
    refreshTime = moment();
    jQuery("#city-name").text(cityBtnCoords[index].city);

    var icon = weatherobj.current.weather[0].icon;
    //update icon src
    jQuery("#current-icon").attr("src", "http://openweathermap.org/img/wn/" + icon + "@2x.png")

    //update current temperature
    jQuery("#current-temperature").text(weatherobj.current.temp 
        + "° (Feels Like " + weatherobj.current.feels_like + "°)");

    //update current humidity
    jQuery("#current-humidity").text(weatherobj.current.humidity + "%");
    //add image for wind direction?

    //update current wind speed
    jQuery("#current-windspeed").text(weatherobj.current.wind_speed + "mph");
    
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

jQuery("#city-list a").on("click", function(){
    var index = parseInt(jQuery(this).attr("id"));
    var lat = cityBtnCoords[index].coords[0]
    var long = cityBtnCoords[index].coords[1] 
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" 
        + long + "&exclude=minutely&appid=" + key + "&units=imperial";

    // make a request to the url
    fetch(apiUrl).then(function (response) {
        response.json().then(function (data) {
            //console.log(data);

            //weatherInfo =  data;
            console.dir(data);
            updateInfo(data, index);
        });
    });
    //console.dir(weatherInfo);
});
