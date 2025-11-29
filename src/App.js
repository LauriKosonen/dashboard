import React, { useState, useEffect } from "react";
import "./App.css";

import NoteWidget from "./widgets/NoteWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 770);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 770);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <div className="dashboard">
      {/* Header is always visible */}
      <header className="header">Dashboard</header>

      {/* Desktop grid */}
      {!isMobile && (
        <main className="grid">
          <div className="widget notes-widget"><NoteWidget /></div>
          <div className="widget calendar-widget"><CalendarWidget /></div>
          <div className="weather-widget"><WeatherWidget /></div>
        </main>
      )}

      {/* Mobile tabs with grid layout */}
      {isMobile && (
        <Box className="mobile-grid">
          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            className="mobile-tabs"
          >
            <Tab label="Notes" />
            <Tab label="Calendar & Weather" />
          </Tabs>

          {/* Notes Tab */}
          {tabIndex === 0 && (
            <div className="notes-widget" style={{ overflowY: "auto", flex: 1 }}>
              <NoteWidget />
            </div>
          )}

          {/* Calendar & Weather Tab */}
          {tabIndex === 1 && (
            <div className="calendar-weather-container">
              <div className="mobile-calendar">
                <CalendarWidget />
              </div>
              <div className="mobile-weather">
                <WeatherWidget />
              </div>
            </div>
          )}
        </Box>
      )}
    </div>
  );
}

export default App;
