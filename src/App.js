import React, { useState, useEffect } from "react";
import "./App.css";

import NoteWidget from "./widgets/NoteWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

// import dayjs from "dayjs";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';


import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBw_KZ1DHKOCzvvrAuKRMJK2KT6mCusuxE",
  authDomain: "dashboard-d948f.firebaseapp.com",
  projectId: "dashboard-d948f",
  storageBucket: "dashboard-d948f.firebasestorage.app",
  messagingSenderId: "510169058898",
  appId: "1:510169058898:web:77e408245e9ea9397a598b",
  measurementId: "G-XE1KBW92QS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState([]); // Notes data from Firestore
  const [noteToOpenId, setNoteToOpenId] = useState(null); // New state to trigger opening a specific note

  // Effect for handling window resize (existing)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1000);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Real-time Listener for Notes (moved here from NoteWidget)
  useEffect(() => {
    const q = query(
      collection(db, "notes"),
      orderBy("favorite", "desc"),
      orderBy("created", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setItems(notesData);
    }, (error) => {
      console.error("Error fetching notes:", error);
      // Handle error appropriately, e.g., show a user notification
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  // Handler for when a day with a note is clicked on the calendar
  const handleCalendarNoteClick = (noteId) => {
    setNoteToOpenId(noteId);
    // If on mobile and currently on the calendar tab, switch to the Notes tab
    if (isMobile && tabIndex !== 0) {
      setTabIndex(0);
    }
  };

  return (
    <div className="dashboard">
      {/* Header is always visible */}
      <header className="header">Dashboard</header>

      {/* Desktop grid */}
      {!isMobile && (
        <main className="grid">
          <div className="widget notes-widget">
            <NoteWidget
              db={db}
              items={items}
              noteToOpenId={noteToOpenId}
              setNoteToOpenId={setNoteToOpenId} // Pass the setter to allow NoteWidget to clear it
            />
          </div>
          <div className="widget calendar-widget">
            <CalendarWidget
              notes={items}
              onNoteDateClick={handleCalendarNoteClick} // Pass the handler
            />
          </div>
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
              <NoteWidget
                db={db}
                items={items}
                noteToOpenId={noteToOpenId}
                setNoteToOpenId={setNoteToOpenId}
              />
            </div>
          )}

          {/* Calendar & Weather Tab */}
          {tabIndex === 1 && (
            <div className="calendar-weather-container">
              <div className="mobile-calendar">
                <CalendarWidget
                  notes={items}
                  onNoteDateClick={handleCalendarNoteClick}
                />
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
