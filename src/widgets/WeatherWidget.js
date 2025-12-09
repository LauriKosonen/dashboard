import React, { useState } from 'react';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import axios from 'axios'
import "./WeatherWidget.css";

function WeatherWidget() {
  const API_KEY = process.env.REACT_APP_WEATHER_APIKEY;
  const ICON_URL = "http://openweathermap.org/img/wn/";

  const [cityname, setCityname] = useState(" ");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const getWeather = async () => {
  try {
    //current weather
    const currentRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${API_KEY}&units=metric`
    );
    setWeather(currentRes.data);

    //forecast
    const forecastRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${API_KEY}&units=metric`
    );

    //only future entries
    const now = new Date();
    const futureForecast = forecastRes.data.list.filter(
      (f) => new Date(f.dt_txt) > now
    );

    //next 4 weather entries
    setForecast(futureForecast.slice(0, 3));
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
};

//background change for the widget based on current weather
  const getBackgroundClass = () => {
    if (!weather) return "weather-clear"; //default

    const condition = weather.weather[0].main.toLowerCase();

    if (
     condition.includes("clear") ||
     (condition.includes("clouds") && weather.weather[0].description.includes("few"))) 
      return "weather-clear";


    if (condition.includes("clouds") || condition.includes("rain"))
      return "weather-cloudy";

    return "weather-clear";
  };

  return (
    <div className={`weather-widget ${getBackgroundClass()}`}>
      {/*search*/}
      <form 
        className="weather-search" 
        onSubmit={(e) => { 
          e.preventDefault(); 
          getWeather();
        }}
        style={{ display: "flex", alignItems: "center", gap: "20px", color: "white" }}
      >
        <TextField
          label="Cityname"
          value={cityname}
          onChange={(e) => setCityname(e.target.value)}
          className="textfield"
          autoComplete="off"
        />

        <Button 
          variant="contained" 
          color="white" 
          size="small" 
          onClick={getWeather}
          sx={{padding: 1.9,
            "& svg": { transition: "transform 0.15s ease" },
            "&:hover svg": { transform: "scale(1.2)" }
          }}
        >
          <SearchIcon />
        </Button>
      </form>

      {/*weather container*/}
      <div
        className="weather-container"
        style={{ display: "flex", gap: "10px", marginTop: "10px", marginLeft: "5px" }}
      >

        {/*forecast*/}
        {forecast.length > 0 && (
          <div className="weather-forecast" style={{ margin: "7px" }}>
            <ul style={{ listStyle: "none", padding: "5px" }}>
              {forecast.map((f, index) => (
                <li key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "4px",
                    paddingBottom: "1px",
                    borderBottom: index !== forecast.length - 1 ? "1px solid #ccc" : "none"
                 }}>
                  {new Date(f.dt_txt).getHours()}:00 {" "}
                  
                  <img
                    alt={f.weather[0].description}
                    src={ICON_URL + f.weather[0].icon + ".png"}
                    style={{ width: 40, height: 40, marginLeft: "10px" }}
                  />
                  {Math.round(f.main.temp)}°C
                </li>
              ))}
            </ul>
          </div>
        )}

        {/*current weather*/}
        {weather && (
        <div className="weather-now" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0em" }}>
            <span style={{ fontSize: "150%" }}>{Math.round(weather.main.temp)}°</span>
            <span style={{ fontSize: "35%" }}>{weather.weather[0].main}</span>
        </div>
        )}

      </div>
    </div>
  );
}

export default WeatherWidget;