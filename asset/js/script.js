

var key = '5c259111982ae193c7ee95b52d4469d5';
var city = "Sydney"

//Setting up time and date
var date = moment().format('DD-MMM-YYYY');
var dateTime = moment().format('DD-MMM-YYYY HH:MM:SS')

//setting clock display
var timeDisplayEl = $('.clock');

setInterval(function displayTime() {
    var timeNow = moment().format('hh:mm:ss a');
    timeDisplayEl.text(timeNow);
}, 1000);

var cityHistory = [];
//display current search and add to local storage
$('.search').on("click", function (event) {
    event.preventDefault();
    city = $(this).parent('.btnPar').siblings('.textVal').val().trim();
    $(".textVal").val((idx, val) => {
            $('.btnPar').siblings('[value="' + val + '"]').remove();
        });
    if (city === "") {
        return;
    };
    cityHistory.push(city);

    localStorage.setItem('city', JSON.stringify(cityHistory));
    fiveForecastEl.empty();
    getHistory();
    getWeatherToday();
});

//Will create buttons based on search history 
var historyEl = $('.cityHistory');
function getHistory() {
    historyEl.empty();

    for (let i = 0; i < cityHistory.length; i++) {

        var rowEl = $('<row>');
        var btnEl = $('<button>').text(`${cityHistory[i]}`)

        rowEl.addClass('row histBtnRow');
        btnEl.addClass('btn btn-outline-secondary histBtn');
        btnEl.attr('type', 'button');

        historyEl.prepend(rowEl);
        rowEl.append(btnEl);
    } if (!city) {
        return;
    }
    //Allows the buttons to start a search
    $('.histBtn').on("click", function (event) {
        event.preventDefault();
        city = $(this).text();
        fiveForecastEl.empty();
        getWeatherToday();
    });
};

//name the place for data show on browser
var cardTodayBody = $('.cardBodyToday')
//Applies the weather data to the today card and then launches the five day forecast
function getWeatherToday() {
    var getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;

    $(cardTodayBody).empty();

    $.ajax({
        url: getUrlCurrent,
        method: 'GET',
    }).then(function (response) {
        $('.cardTodayCityName').text(response.name);
        $('.cardTodayDate').text(date);
        //Icons
        $('.icons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
        // Temperature
        var celcius = Math.round(parseFloat(response.main.temp));//interger number for temperature
        var pEl = $('<p>').text(`Temperature:${celcius}°C`);
        cardTodayBody.append(pEl);
        //Feels Like
        var feelCelcius = Math.round(parseFloat(response.main.feels_like));//interger number for temperature
        var pElTemp = $('<p>').text(`Feels Like: ${feelCelcius} °C`);
        cardTodayBody.append(pElTemp);
        //Humidity
        var pElHumid = $('<p>').text(`Humidity: ${response.main.humidity} %`);
        cardTodayBody.append(pElHumid);
        //Wind Speed
        var pElWind = $('<p>').text(`Wind Speed: ${response.wind.speed} MPS`);
        cardTodayBody.append(pElWind);
        //Set the lat and long from the searched city
        var cityLon = response.coord.lon;
        // console.log(cityLon);
        var cityLat = response.coord.lat;
        // console.log(cityLat);

        var getUrlUvi = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=hourly,daily,minutely&appid=${key}`;

        $.ajax({
            url: getUrlUvi,
            method: 'GET',
        }).then(function (response) {
            var pElUvi = $('<p>').text(`UV Index: `);
            var uviSpan = $('<span>').text(response.current.uvi);
            var uvi = response.current.uvi;
            pElUvi.append(uviSpan);
            cardTodayBody.append(pElUvi);
            //set the UV index  
            if (uvi >= 0 && uvi <= 2) {
                uviSpan.attr('class', 'green');
            } else if (uvi > 2 && uvi <= 5) {
                uviSpan.attr("class", "yellow")
            } else if (uvi > 5 && uvi <= 7) {
                uviSpan.attr("class", "orange")
            } else if (uvi > 7 && uvi <= 10) {
                uviSpan.attr("class", "red")
            } else {
                uviSpan.attr("class", "purple")
            }
        });
    });
    getFiveDayForecast();
};

var fiveForecastEl = $('.fiveForecast');

function getFiveDayForecast() {
    var getUrlFiveDay = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${key}`;

    $.ajax({
        url: getUrlFiveDay,
        method: 'GET',
    }).then(function (response) {
        var fiveDayData = response.list;
        var myWeather = [];
        //Made a object for data read
        $.each(fiveDayData, function (index, value) {
            textObj = {
                date: value.dt_txt.split(' ')[0],
                time: value.dt_txt.split(' ')[0],
                temp: value.main.temp,
                feels_like: value.main.feels_like,
                icon: value.weather[0].icon,
                humidity: value.main.humidity
            }

            if (value.dt_txt.split(' ')[1] === "00:00:00") {
                myWeather.push(textObj);
            }
        })
        //Inject the cards to the screen 
        for (let i = 0; i < myWeather.length; i++) {

            var cardHeader = $('<div>');
            cardHeader.attr('class', 'card text-black bg-success mb-3 cardOne');
            cardHeader.attr('style', 'max-width: 200px;');
            fiveForecastEl.append(cardHeader);

            var headerEl = $('<div>');
            headerEl.attr('class', 'card-header')
            var m = moment(`${myWeather[i].date}`).format('DD-MMM-YYYY');
            headerEl.text(m);
            cardHeader.append(headerEl)

            var bodyEl = $('<div>');
            bodyEl.attr('class', 'card-body');
            cardHeader.append(bodyEl);

            var divElIcon = $('<img>');
            divElIcon.attr('class', 'icons');
            divElIcon.attr('src', `https://openweathermap.org/img/wn/${myWeather[i].icon}@2x.png`);
            bodyEl.append(divElIcon);

            //Temp
            var celciusFive = Math.round(parseFloat(myWeather[i].temp));//interger number for temperature
            var pElTemp = $('<p>').text(`Temperature: ${celciusFive} °C`);
            bodyEl.append(pElTemp);
            //Feels Like
            var feelCelciusFive = Math.round(parseFloat(myWeather[i].feels_like));
            var pElFeel = $('<p>').text(`Feels Like: ${feelCelciusFive} °C`);
            bodyEl.append(pElFeel);
            //Humidity
            var pElHumid = $('<p>').text(`Humidity: ${myWeather[i].humidity} %`);
            bodyEl.append(pElHumid);
        }
    });
};

//Allows data to load for Sydney as default of the app when first open
function initLoad() {

    var cityHistStore = JSON.parse(localStorage.getItem('city'));

    if (cityHistStore !== null) {
        cityHist = cityHistStore
    }
    getHistory();
    getWeatherToday();
};

initLoad();