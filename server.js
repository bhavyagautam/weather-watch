const express = require("express");
const app = express();
const port = 3000;
//flag 0:city
//flag 1:lat/long
app.get("/:cityName/:countryCode/:flag", (req, res) => {
  let cityName = req.params.cityName;
  let countryCode = req.params.countryCode;
  let flag = req.params.flag;
  console.log(`Request for ${cityName} ${countryCode}`);

  let APIkey = "dfac571b043b6f78c6ec689f31b5d0dc";
  let apiURL = "";
  if (flag === "true") {
    apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityName}&lon=${countryCode}&units=metric&appid=${APIkey}`;
  } else {
    countryCode = "," + countryCode;
    apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}${countryCode}&units=metric&appid=${APIkey}`;
  }
  console.log("API URL: ", apiURL);
  const responseToSend = {
    air: "",
    dailyInfo: [],
    recommend: {
      rain: "",
      temp: "",
    },
  };

  fetch(apiURL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      dataList = data.list;
      lat = data.city.coord.lat;
      lon = data.city.coord.lon;
      console.log(lat, lon);
      for (let i = 0; i < dataList.length; i += 8) {
        const dailyData = dataList.slice(i, i + 8);
        let totalTemp = 0;
        let totalWind = 0;
        let totalRain = 0;
        dailyData.forEach((item) => {
          totalTemp += item.main.temp;
          totalWind += item.wind.speed;
          if (item.rain && item.rain["3h"]) {
            totalRain += item.rain["3h"];
            responseToSend.recommend.rain = "It will rain 🌧 Pack an umbrella☔";
          }
        });
        let avgTemp = (totalTemp / 8).toFixed(2);
        let avgWind = (totalWind / 8).toFixed(2);
        let avgRain = (totalRain / 8).toFixed(2);
        let day = {
          temp: avgTemp,
          wind: avgWind,
          rain: avgRain,
        };
        day.date = dailyData[7].dt_txt.substring(0, 10);
        responseToSend.dailyInfo.push(day);
      }
      if (responseToSend.dailyInfo[0].temp < 13) {
        responseToSend.recommend.temp = "Cold temperature🥶";
      } else if (responseToSend.dailyInfo[0].temp > 23) {
        responseToSend.recommend.temp = "Hot temperature🥵";
      } else {
        responseToSend.recommend.temp = "Mild temperature😁";
      }

      const airApi = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIkey}`;
      return airApi;
    })
    .then((airApi) => {
      return fetch(airApi);
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      responseToSend.air = data.list[0].components["pm2_5"];
      if (responseToSend.air >= 10) {
        responseToSend.recommend.air = "High Pollution! Wear a mask 😷";
      } else {
        responseToSend.recommend.air = "";
      }
    })
    .then(() => {
      res.header("Access-Control-Allow-Origin", "*");
      res.json(responseToSend);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
