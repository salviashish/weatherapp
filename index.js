const api = {
  key: "87325abef93d40bf181dc6524e9501a0",
  baseurl: "https://api.openweathermap.org/data/2.5/weather",
  iconurl: "http://openweathermap.org/img/wn/",
};

const messageel = document.querySelector(".message");
const unit = "metric";

showApp = function (show) {
  if (show) $("main").show();
  else $("main").hide();
};

showLoader = function (showLoader) {
  if (showLoader) $("#loading-container").show();
  else $("#loading-container").hide();
};

$(document).ready(function () {
  $(".zip-search").val("");
  showApp(false);
  showLoader(false);
  $(".message").hide();
});

$(".zip-search").on("keypress", function (evt) {
  if (evt.keyCode == 13 && IsValidInput()) {
    fetchWeatherByZipCode($(".zip-search").val());
  }
});

$(".zip-search").on("input", function () {
  IsValidInput();
});

IsValidInput = () => {
  if (isNaN($(".zip-search").val())) {
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

window.addEventListener("load", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      fetchWeatherByLatLong(
        position.coords.latitude,
        position.coords.longitude
      );
    });
  } else {
    displayErrorMessage(
      "OOPS!! Unable to determine current location, please enter zipcode in search box"
    );
  }
});

fetchWeatherByZipCode = function (zip) {
  let fetchByZip = `${api.baseurl}?units=${unit}&zip=${zip},US&&appid=${api.key}`;
  invokeOpenWeatherAPI(fetchByZip);
};

fetchWeatherByLatLong = function (lat, long) {
  let fetchByLatLong = `${api.baseurl}?units=${unit}&lat=${lat}&lon=${long}&appid=${api.key}`;
  invokeOpenWeatherAPI(fetchByLatLong);
};

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
  document.querySelector(".city").textContent = weatherResult.name;
  document.querySelector("#weatherimg").src = `${api.iconurl}${weatherResult.weather[0].icon}@2x.png`;
  document.querySelector(".description").textContent =weatherResult.weather[0].description;
  document.querySelector("#feels-like-temp").textContent = `${roundOff(weatherResult.main.feels_like)}°${tempUnits(unit)}`;
  document.querySelector(".metric").innerHTML = `${roundOff(weatherResult.main.temp)}<span>°${tempUnits(unit)}</span>`;
  document.querySelector("#min-temp").textContent = `${roundOff(weatherResult.main.temp_min)}°${tempUnits(unit)}`;
  document.querySelector("#max-temp").textContent = `${roundOff(weatherResult.main.temp_max)}°${tempUnits(unit)}`;

  showApp(true);
  showLoader(false);
};

roundOff = function (temp) {
  return Math.ceil(temp);
};

tempUnits = function (unit) {
  if (unit.toUpperCase() == "METRIC") return "C";
  else return "F";
};
