import React, { useState, useEffect } from "react";
import "./App.css";

import NoteWidget from "./widgets/NoteWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";

// Firebase configuration
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
const auth = getAuth(app);

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState([]); 
  const [noteOpenId, setNoteOpenId] = useState(null);

  const [user, setUser] = useState(null); // Current user
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [dropDown, dropDownElement] = useState(null);
  const menuOpen = Boolean(dropDown);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Window resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1000);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);


  // Firestore notes listener
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setItems([]); // No notes are visible by default
      return;
    }

    const q = query(
      collection(db, "notes"),
      orderBy("favorite", "desc"),
      orderBy("created", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(note => note.uid === user.uid); // Only current user's notes
      setItems(notesData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTabChange = (event, newIndex) => setTabIndex(newIndex);

  const handleCalendarNoteClick = (noteId) => {
    setNoteOpenId(noteId);
    if (isMobile && tabIndex !== 0) setTabIndex(0);
  };

  const handleMenuOpen = (event) => {
    dropDownElement(event.currentTarget);
  };

  const handleMenuClose = () => {
    dropDownElement(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    handleMenuClose();
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        Dashboard
        <div className="authentication-buttons">
          {!user && (
            <>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white"
                  },
                  padding: "0.3rem 0.6rem",
                  margin: "0.5em",
                }}
                onClick={() => { setIsLogin(true); setModalOpen(true); }}
              >
                Log in
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{
                  padding: "4px 8px",
                  margin: "0.5em",
                  "& svg": { transition: "transform 0.15s ease" },
                  "&:hover svg": { transform: "scale(1.2)" }
                }}
                onClick={() => { setIsLogin(false); setModalOpen(true); }}
              >
                Sign up
              </Button>
            </>
          )}
          {user && (
            <>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  textTransform: "none",
                  marginLeft: "1em",
                  color: "white",
                }}
              >
                {user.isAnonymous ? "Guest" : user.email}
              </Button>

              <Menu
                anchorEl={dropDown}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem disabled>
                  {user.isAnonymous ? "Guest user" : user.email}
                </MenuItem>

                {!user.isAnonymous && (
                  <MenuItem onClick={handleLogout}>Log out</MenuItem>
                )}
              
              </Menu>
            </>
          )}

        </div>
      </header>

      {/* Auth Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2
        }}>
          <h2>{isLogin ? "Log In" : "Sign Up"}</h2>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={async () => {
              try {
                if (isLogin) {
                  await signInWithEmailAndPassword(auth, email, password);
                } else {
                  await createUserWithEmailAndPassword(auth, email, password);
                }
                setModalOpen(false);
                setEmail(""); setPassword("");
              } catch (error) {
                console.error(error);
                alert(error.message);
              }
            }}
          >
            {isLogin ? "Log In" : "Sign Up"}
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Switch to Sign Up" : "Switch to Log In"}
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={async () => {
              await signInAnonymously(auth);
              setModalOpen(false);
            }}
          >
            Continue as Guest
          </Button>
        </Box>
      </Modal>

      {/* Desktop grid */}
      {!isMobile && (
        <main className="grid">
          <div className="widget notes-widget">
            <NoteWidget
              db={db}
              items={items}
              noteToOpenId={noteOpenId}
              setNoteToOpenId={setNoteOpenId}
              user={user} // Pass user to NoteWidget
            />
          </div>
          <div className="widget calendar-widget">
            <CalendarWidget
              notes={items}
              onNoteDateClick={handleCalendarNoteClick}
            />
          </div>
          <div className="weather-widget"><WeatherWidget /></div>
        </main>
      )}

      {/* Mobile tabs */}
      {isMobile && (
        <Box className="mobile-grid">
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

          {tabIndex === 0 && (
            <div className="notes-widget" style={{ overflowY: "auto", flex: 1 }}>
              <NoteWidget
                db={db}
                items={items}
                noteToOpenId={noteOpenId}
                setNoteToOpenId={setNoteOpenId}
                user={user}
              />
            </div>
          )}

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
