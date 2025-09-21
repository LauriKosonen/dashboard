import React from "react";
import "./App.css";

import NoteWidget from "./widgets/NoteWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

function App() {
  return (
    <div className="dashboard">
      <header className="header">My Dashboard</header>
      <main className="grid-left">
        <NoteWidget />
      </main>
      <main className="grid-right">
        <CalendarWidget />
        <WeatherWidget />
      </main>
    </div>
  );
}

export default App;
//test
//test2