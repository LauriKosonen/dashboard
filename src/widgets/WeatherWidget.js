import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios'
import '../App.css';

function WeatherWidget() {

 const API_KEY = process.env.REACT_APP_WEATHER_APIKEY;
  const URL = 'https://api.openweathermap.org/data/2.5/weather?q=';
  const ICON_URL = 'http://openweathermap.org/img/wn/';

  const [cityname, setCityname] = useState("Jyväskylä");

  const getWeather = () => {
    axios
      .get(URL+cityname+'&appid='+API_KEY+'&units=metric')
      .then(response => {
        // console.log(response.data) to see data in console
        setWeather(response.data)
      })
  }

  const [weather, setWeather] = useState(null);

  return (
    <div className="App">
        <div className="weather-search" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>Weather</h1>
            <TextField
                label="Cityname"
                defaultValue=""
                id="outlined-basic"
                onChange={(e) => setCityname(e.target.value)}
            />
            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => getWeather()}
            >
                Get Forecast
            </Button>
        </div>
        <div className="weather-container" style={{ display: 'flex', gap: '20px' }}>
            {weather !== null &&
                <div className="weather-now" style={{ padding: '10px' }}>
                <h2>Current Weather</h2>
                {weather.name}<br/>
                {weather.weather[0].main}<br/>
                {Math.round(weather.main.temp)} °C<br/>
                <img
                 alt={cityname} 
                    style={{height: 100, width: 100}}
                    src={ICON_URL + weather.weather[0].icon + '.png'}
                />
        </div>
            }

            {weather !== null &&
        <div className="weather-forecast" style={{ padding: '10px' }}>
            <h2>Forecast</h2>
            {/* Example forecast data */}
            <p>Tomorrow: 23°C, Sunny</p>
            <p>Day after: 22°C, Cloudy</p>
            {/* Replace these with your actual forecast API data */}
        </div>
            }
    </div>    
      
    </div>
    
    );
}

export default WeatherWidget;