import React, { useState, useEffect } from "react"; // Import useRef
import "./App.css";

import NoteWidget from "./widgets/NoteWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Switch from "@mui/material/Switch";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
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
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
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

//light and dark theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const [items, setItems] = useState([]); 
  const [noteOpenId, setNoteOpenId] = useState(null);

  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [dropDown, dropDownElement] = useState(null);
  const menuOpen = Boolean(dropDown);

  const [darkMode, setDarkMode] = useState(
  () => localStorage.getItem("darkMode") === "true"
);

  //dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.style.setProperty("--app-surface", "#1e1e1e");
      root.style.setProperty("--app-text", "#ffffff");
      root.style.setProperty("--widget-surface", "#4d4d4dff");
    } else {
      root.style.setProperty("--app-surface", "#eae9e9ff");
      root.style.setProperty("--app-text", "#000000");
      root.style.setProperty("--widget-surface", "#f4f4f4");
    }
  }, [darkMode]);

  // auth state listener with gemini
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth state changed. currentUser:", currentUser ? currentUser.uid : "null", "isAnonymous:", currentUser?.isAnonymous);       
        if (currentUser) {
          setUser(currentUser);
        } else {
          console.log("No user, attempting anonymous sign-in.");
          signInAnonymously(auth)
            .then((anonUserCredential) => {
              console.log("Signed in anonymously automatically:", anonUserCredential.user.uid);
            })
            .catch((error) => {
              console.error("Error signing in anonymously:", error);
              setUser(null);
            });
        }
      });
      return () => unsubscribe();
    }, []);


    // firestore listener
    useEffect(() => {
      console.log("Firestore listener useEffect running. Current user:", user ? user.uid : "null");

      if (!user) {
        setItems([]); // no user, no notes
        console.log("Firestore listener skipped: No user.");
        return;
      }

      const q = query(
        collection(db, "notes"),
        where("uid", "==", user.uid),
        orderBy("favorite", "desc"),
        orderBy("created", "desc")
      );

      console.log("Setting up Firestore onSnapshot listener for UID:", user.uid);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log("!!! onSnapshot CALLBACK FIRED !!! Current user UID in onSnapshot:", user?.uid);
        console.log("Snapshot docs received:", snapshot.docs.length);
        const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Processed notes data:", notesData);
        setItems(notesData);
      });

      return () => {
        console.log("Unsubscribing Firestore listener for UID:", user.uid);
        unsubscribe();
      };
    }, [user]);




  const handleCalendarNoteClick = (noteId) => {
    setNoteOpenId(noteId);
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
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
        <div className="dashboard" 
        style={{
        backgroundColor: "var(--app-bg)",
        color: "var(--app-text)",
        }}>
          <header className="header">
            Dashboard
            <div className="authentication-buttons">
              {/* login visibility */}
              {(!user || user.isAnonymous) && (
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
              {/* Settings*/}
              {user && !user.isAnonymous &&(
                <>
                  <Button
                  variant="outlined"
                    color="inherit"
                    onClick={handleMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                    sx={{
                      textTransform: "none",
                      marginLeft: "1em",
                      color: "white",
                    }}
                  >
                    Settings
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

                    <MenuItem>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        Dark mode
                        <Switch
                          checked={darkMode}
                          onChange={() => setDarkMode(!darkMode)}
                        />
                      </Box>
                    </MenuItem>

                      <MenuItem onClick={handleLogout}>Log out</MenuItem>
                  
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

          <main className="grid">
            <div className="widget weather-widget">
              <WeatherWidget />
            </div>

            <div className="widget calendar-widget">
              <CalendarWidget
                notes={items}
                onNoteDateClick={handleCalendarNoteClick}
              />
            </div>

            <div className="widget notes-widget">
              <NoteWidget
                db={db}
                items={items}
                noteToOpenId={noteOpenId}
                setNoteToOpenId={setNoteOpenId}
                user={user}
              />
            </div>
          </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
