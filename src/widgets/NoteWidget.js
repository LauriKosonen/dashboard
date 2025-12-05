import React, { useState, useEffect } from 'react'; //added useEffect for firestore note saving
import "./NoteWidget.css";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {
  EditorProvider,
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnBulletList,
  BtnNumberedList
} from "react-simple-wysiwyg";

import DOMPurify from "dompurify";
import parse from "html-react-parser";

//imported firestore functions
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';


function NoteWidget({db}) { //added db prop for firestore functionality
  console.log(db);
  const [itemTitle, setItemTitle] = useState("");
  const [itemText, setItemText] = useState("");
  const [items, setItems] = useState([]); //this will now be populated by firestore
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // --- Real-time Listener for Notes ---
  useEffect(() => {
    if (!db) return; // Ensure db is available

    // Create a query to get notes, ordered by favorite status (true first), then by creation date (newest first)
    const q = query(
      collection(db, "notes"),
      orderBy("favorite", "desc"),
      orderBy("created", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(document => ({
        id: document.id, // Firestore provides the document ID
        ...document.data() // Get all fields from the document
      }));
      setItems(notesData); // Update local state with Firestore data
    }, (error) => {
      console.error("Error fetching notes:", error);
      // Handle error, e.g., show a message to the user
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [db]); // Re-run if the 'db' instance changes (though it likely won't)

  
  const handleOpen = () => setShowForm(true);
  const handleClose = () => {
    setShowForm(false);
    setItemTitle("");
    setItemText("");
    setEditingId(null); // Clear editing state on close
  };

  // --- Handle Form Submission (Add or Update Note) ---
  const handleSubmit = async (event) => { // Make this an async function
    event.preventDefault();

    try {
      if (editingId) {
        // Update existing document in Firestore
        const noteRef = doc(db, "notes", editingId);
        await updateDoc(noteRef, {
          title: itemTitle,
          text: itemText,
          // 'favorite' and 'created' will remain as they were unless explicitly updated here
        });
      } else {
        // Add new document to Firestore
        await addDoc(collection(db, "notes"), {
          title: itemTitle,
          text: itemText,
          favorite: false, // New notes start as not favorite
          created: Date.now(), // Timestamp for new note
          // You could also add a userId here if you implement authentication
        });
      }
      // Clear form and close modal after successful operation
      setItemTitle("");
      setItemText("");
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving note:", error);
      // You might want to display a user-friendly error message here
    }
  };

  // --- Handle Edit Button Click ---
  const handleEdit = (id) => {
    const note = items.find(item => item.id === id);
    if (note) {
      setItemTitle(note.title);
      setItemText(note.text);
      setEditingId(id);
      setShowForm(true);
    }
  };

  // --- Remove Note ---
  const removeItem = async (id) => { // Make this an async function
    try {
      await deleteDoc(doc(db, "notes", id)); // Delete document from Firestore
    } catch (error) {
      console.error("Error removing note:", error);
    }
  };

  // --- Toggle Favorite Status ---
  const toggleFavorite = async (id) => { // Make this an async function
    const noteToToggle = items.find(item => item.id === id);
    if (noteToToggle) {
      try {
        const noteRef = doc(db, "notes", id);
        await updateDoc(noteRef, {
          favorite: !noteToToggle.favorite // Toggle the favorite status
        });
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    }
  };

  
  return (
    <div className="note-widget">
      <div className="note-widget-header">
        <h1>Notes</h1>

      {/* Create button when form is hidden */}
      {!showForm && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleOpen}
          sx={{ padding: 1.9,
            "& svg": { transition: "transform 0.15s ease" },
            "&:hover svg": { transform: "scale(1.2)" }
           }}
        >
          <AddIcon />
        </Button>
      )}
      </div>
      
      {/* Modal */}
        <Modal open={showForm} onClose={handleClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <form onSubmit={handleSubmit} className="note-form">
              <input
                className="note-title"
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Title..."
              />

              <EditorProvider>
                <Editor
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  placeholder="Write your note here..."
                >
                  <Toolbar>
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <BtnBulletList />
                    <BtnNumberedList />
                  </Toolbar>
                </Editor>
              </EditorProvider>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <Button variant="contained" type="submit">
                  {editingId ? "Update" : "Add"}
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </Box>
        </Modal>


      {/* Notes list */}
      <div className="notes-list">
        {/* Sorting is now handled by the Firestore query in useEffect, so we just map 'items' */}
        {items.map(item => (
          <div className="note" key={item.id}>

            <div className="note-header">
              <h2>{item.title}</h2>

              <div className="note-buttons">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <FavoriteIcon sx={{ color: item.favorite ? 'red' : 'white' }} />
                </Button>
                <Button variant="contained" size="small" onClick={() => handleEdit(item.id)}>
                  <EditIcon />
                </Button>
                <Button variant="contained" size="small" onClick={() => removeItem(item.id)}>
                  <DeleteIcon />
                </Button>
              </div>
            </div>

            <div className="note-text">
              {parse(DOMPurify.sanitize(item.text))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default NoteWidget;