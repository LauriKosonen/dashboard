import React, { useState, useEffect } from 'react';
import "./NoteWidget.css";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; // Import DeleteIcon
import FavoriteIcon from '@mui/icons-material/Favorite'; // Corrected import
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';


// NoteWidget now accepts 'items', 'noteToOpenId', and 'setNoteToOpenId' as props
function NoteWidget({db, items, noteToOpenId, setNoteToOpenId}) {
  const [itemTitle, setItemTitle] = useState("");
  const [itemText, setItemText] = useState("");
  // `items` state is now managed in App.js
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [noteDate, setNoteDate] = useState(null); // Changed to null as default for new notes

  // Effect to handle opening a note when noteToOpenId changes (triggered from CalendarWidget)
  useEffect(() => {
    if (noteToOpenId && items.length > 0) {
      const noteToEdit = items.find(item => item.id === noteToOpenId);
      if (noteToEdit) {
        setItemTitle(noteToEdit.title);
        setItemText(noteToEdit.text);
        setEditingId(noteToOpenId);
        // If noteToEdit.date exists, convert it to dayjs object, otherwise set to null
        setNoteDate(noteToEdit.date ? dayjs(noteToEdit.date) : null);
        setShowForm(true); // Open the modal
      }
      // Clear noteToOpenId after handling to prevent re-opening if state updates
      setNoteToOpenId(null); // IMPORTANT: Reset noteToOpenId after it's handled
    }
  }, [noteToOpenId, items, setNoteToOpenId]); // Dependencies for this effect

  // --- Handle opening the note creation/edit form ---
  const handleOpen = () => {
    // When opening for a new note, ensure all fields are cleared and date is null
    setItemTitle("");
    setItemText("");
    setEditingId(null);
    setNoteDate(null); // Explicitly set to null for new notes
    setShowForm(true);
  };

  // --- Handle closing the note creation/edit form ---
  const handleClose = () => {
    setShowForm(false);
    setItemTitle("");
    setItemText("");
    setEditingId(null); // Clear editing state on close
    setNoteDate(null); // Reset the date to null when closing
  };

  // --- Handle Form Submission (Add or Update Note) ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Determine the date value to save: if noteDate is a valid dayjs object, convert to ISO string; otherwise, null
      const dateToSave = noteDate && noteDate.isValid() ? noteDate.toISOString() : null;

      if (editingId) {
        // Update existing document in Firestore
        const noteRef = doc(db, "notes", editingId);
        await updateDoc(noteRef, {
          title: itemTitle,
          text: itemText,
          date: dateToSave // Use the determined date value
          // 'favorite' and 'created' will remain as they were unless explicitly updated here
        });
      } else {
        // Add new document to Firestore
        await addDoc(collection(db, "notes"), {
          title: itemTitle,
          text: itemText,
          favorite: false, // New notes start as not favorite
          created: Date.now(), // Timestamp for new note
          date: dateToSave // Use the determined date value
          // You could also add a userId here if you implement authentication
        });
      }
      // Clear form and close modal after successful operation
      setItemTitle("");
      setItemText("");
      setEditingId(null);
      setShowForm(false);
      setNoteDate(null); // Reset date to null after submission
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
      // Set noteDate based on the existing note's date, handling potentially null dates
      setNoteDate(note.date ? dayjs(note.date) : null); // Ensure the date picker shows the correct date
    }
  };

  // --- Remove Note ---
  const removeItem = async (id) => { // Make this an async function
    try {
      await deleteDoc(doc(db, "notes", id)); // Delete document from Firestore
      handleClose(); // Close the modal after deletion
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

      {/* Modal for creating/editing notes */}
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

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ mt: 2 }}
                  label="Note Date (Optional)" // Indicate to the user that it's optional
                  value={noteDate}
                  onChange={(newValue) => setNoteDate(newValue)}
                  format="DD.MM.YYYY" // Set the desired display format
                  slotProps={{
                    field: {
                      clearable: true, // This is where the clearable prop now lives
                      onClear: () => setNoteDate(null),
                    },
                  }}
                />
              </LocalizationProvider>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <Button variant="contained" type="submit">
                  {editingId ? "Update" : "Add"}
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
                {/* Delete button, visible only when editing an existing note */}
                {editingId && (
                  <Button
                    variant="contained"
                    color="error" // Use error color for delete actions
                    onClick={() => removeItem(editingId)} // Call removeItem with the current editingId
                    startIcon={<DeleteIcon />} // Add a delete icon
                    sx={{ marginLeft: 'auto' }} // Push to the right
                  >
                    Delete
                  </Button>
                )}
              </div>
            </form>
          </Box>
        </Modal>


      {/* Notes list */}
      <div className="notes-list">
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