const api = {
  key: "87325abef93d40bf181dc6524e9501a0",
  baseurl: "https://api.openweathermap.org/data/2.5/weather?",
  onecallurl:"https://api.openweathermap.org/data/2.5/onecall?exclude=minutely&",
  iconurl: "http://openweathermap.org/img/wn/",
};
const latlongapi = {
    url: "https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=zip="
}
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const timezoneOffset = new Date().getTimezoneOffset();

const messageel = document.querySelector(".message");
const unit = "metric";

$(document).ready(function () {
    $(".zip-search").val("");
    showApp(false);
    showLoader(false);
    $(".message").hide();
    $(".daily-forecast").hide();
});

$(".zip-search").on("keypress", function (evt) {
  if (evt.keyCode == 13 && IsValidInput()) {
    searchLatLongByZip($(".zip-search").val());
  }
});

$(".zip-search").on("input", function () {
  IsValidInput();
});

window.addEventListener("load", function () {
  if (navigator.geolocation) {
    console.log(navigator.geolocation);
    navigator.geolocation.getCurrentPosition(fetchGeoPosition,geoPositionError);
  } else {
    displayErrorMessage(
      "OOPS!! Unable to determine current location, please enter zipcode in search box"
    );
  }
});

geoPositionError = function(positionError){
  displayErrorMessage(
    "OOPS!! Unable to determine current location, please enter zipcode in search box"
  );
}

fetchGeoPosition = function (position) {
  fetchWeatherByLatLong(
    position.coords.latitude,
    position.coords.longitude
  );
}
fetchWeatherByLatLong = function (lat, long) {
    let queryParam = `units=${unit}&lat=${lat}&lon=${long}&appid=${api.key}`
    let fetchByLatLong = `${api.onecallurl}${queryParam}`;
    invokeOpenWeatherAPI(fetchByLatLong);
};

searchLatLongByZip= function(zip){
    $.ajax({
        url: `${latlongapi.url}${zip}`,
        statusCode: {
          503: function (response, textStatus, errorThrown) {
            displayErrorMessage(
              "OOPS!! Some unexpected event occured, please try again in sometime."
            );
          },
        },
        beforeSend: function () {
          showApp(false);
          showLoader(true);
        },
      })
    .done(function (data) {
        if(data.records.length>0)
        {
            document.querySelector(".city").textContent = `${data.records[0].fields.city}, ${data.records[0].fields.state}`;
            fetchWeatherByLatLong(data.records[0].fields.latitude,data.records[0].fields.longitude);
        }
        else{
            showLoader(false);
            showApp(false);
            displayErrorMessage("city not found");    
        }
    })
    .fail(function (error) {
        showLoader(false);
        showApp(false);
        displayErrorMessage(error.responseJSON.message);
    });    
}

invokeOpenWeatherAPI = function (url) {
  $.ajax({
    url: url,
    statusCode: {
      503: function (response, textStatus, errorThrown) {
        displayErrorMessage(
          "OOPS!! Some unexpected event occured, please try again in sometime."
        );
      },
    },
    beforeSend: function () {
      showApp(false);
      showLoader(true);
    },
  })
    .done(function (data) {
      refreshDOM(data);
    })
    .fail(function (error) {
      showLoader(false);
      showApp(false);
      displayErrorMessage(error.responseJSON.message);
    });
};

refreshDOM = function (weatherResult) {
    console.log(weatherResult);
    document.querySelector(".city").textContent = document.querySelector(".city").textContent==''?weatherResult.timezone:document.querySelector(".city").textContent;
    document.querySelector("#weatherimg").src = getIcon(weatherResult.current.weather[0].icon);
    document.querySelector("#weatherimg").alt = weatherResult.current.weather[0].description;
    document.querySelector(".description").textContent = weatherResult.current.weather[0].description;
    document.querySelector("#feels-like-temp").textContent = `${roundOff(weatherResult.current.feels_like)}°${tempUnits(unit)}`;
    document.querySelector(".metric").innerHTML = `${roundOff(weatherResult.current.temp)}<span>°${tempUnits(unit)}</span>`;
    document.querySelector("#uvindex").textContent = weatherResult.current.uvi;
    document.querySelector("#windspeed").textContent = `${weatherResult.current.wind_speed} m/sec`;

    $(".daily-forecast").show();
    $("#forecast").empty();
    $.each(weatherResult.daily,function(key,value){
        var forecast = $(`<div class='row main-row'>
                            <div class='col-5 col-sm-5 col-md-5 col-lg-5 col-xl-5 pd'>
                                <div>${getDate(value.dt)}</div>
                                <div>${value.weather[0].description}</div>
                            </div>
                            <div class='col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3 pd' style='text-align:center;'>
                            <img id='weatherimg' src=${getIcon(value.weather[0].icon)}><br/>
                            <span>${value.pop>0?value.pop+'%':''}</span>
                            </div>                            
                            <div class='col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 pd'>
                                <div>${roundOff(value.temp.max)}°${tempUnits(unit)}</div>
                                <div>${roundOff(value.temp.min)}°${tempUnits(unit)}</div>
                            </div>
                            <div class='col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 pd'>
                                <div>UVI</div>
                                <div>${value.uvi}</div>
                            </div>
                        </div>`);
        $("#forecast").append(forecast)
    });

    showLoader(false);
    showApp(true);
  };

roundOff = function (temp) {
  return Math.ceil(temp);
};

getIcon = function(iconId){return `${api.iconurl}${iconId}@2x.png`;}

tempUnits = function (unit) {
  if (unit.toUpperCase() == "METRIC") return "C";
  else return "F";
};

getDate = function (dt) {
  var utcstr = new Date(dt * 1000).toUTCString();
  var utcDate = new Date(utcstr);
  var date = new Date(utcDate - timezoneOffset);
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
};

showApp = function (show) {
  show? $("main").show():$("main").hide();
};

showLoader = function (showLoader) {
  showLoader ? $("#loading-container").show() : $("#loading-container").hide();
};

IsValidInput = () => {
  var zip = $(".zip-search").val();
  if (zip=='' ||isNaN(zip)) {
    displayErrorMessage("Please enter a valid zip code");
    return false;
  } else {
    displayErrorMessage("");
    return true;
  }
};

displayErrorMessage = function (msg) {
  $(".message").text(`${msg}.`);
  msg !== "" ? $(".message").show() : $(".message").hide();
};
