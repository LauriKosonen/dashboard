import React from "react";
import "./App.css";

import NoteWidget from "./widgets/NoteWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

function App() {

  return (
    <div className="dashboard">
      <header className="header">My Dashboard</header>
      <main className="grid">
        <div className="widget notes-widget"><NoteWidget /></div>
        <div className="widget calendar-widget"><CalendarWidget /></div>
        <div className="weather-widget"><WeatherWidget /></div>
      </main>
    </div>
  );
}

export default App;
//test
//test2