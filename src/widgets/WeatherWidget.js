import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios'
// import '../App.css';
import "./WeatherWidget.css";

function WeatherWidget() {
  const API_KEY = process.env.REACT_APP_WEATHER_APIKEY;
  const ICON_URL = "http://openweathermap.org/img/wn/";

  const [cityname, setCityname] = useState(" ");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const getWeather = async () => {
  try {
    // get current weather
    const currentRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${API_KEY}&units=metric`
    );
    setWeather(currentRes.data);

    // Fetch forecast
    const forecastRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${API_KEY}&units=metric`
    );

    // Filter only future entries
    const now = new Date();
    const futureForecast = forecastRes.data.list.filter(
      (f) => new Date(f.dt_txt) > now
    );

    // Next 4 Weather entries
    setForecast(futureForecast.slice(0, 4));
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
};

  return (
    <div className="App">
      {/* Search Bar */}
      <div
        className="weather-search"
        style={{ display: "flex", alignItems: "center", gap: "20px", color: "white" }}
      >
        <TextField
          label="Cityname"
          value={cityname}
          onChange={(e) => setCityname(e.target.value)}
          className="textfield"
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={getWeather}
        >
          Get Forecast
        </Button>
      </div>

      {/* Weather Container */}
      <div
        className="weather-container"
        style={{ display: "flex", gap: "10px", marginTop: "10px", marginLeft: "5px" }}
      >

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="weather-forecast" style={{ padding: "5px" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {forecast.map((f, index) => (
                <li key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1px",
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

        {/* Current Weather */}
        {weather && (
        <div className="weather-now" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0em" }}>
            <span style={{ fontSize: "170%" }}>{Math.round(weather.main.temp)}°</span>
            <span style={{ fontSize: "35%" }}>{weather.weather[0].main}</span>
        </div>
        )}

      </div>
    </div>
  );
}

export default WeatherWidget;