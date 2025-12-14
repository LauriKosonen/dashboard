import React, { useState, useEffect } from 'react';
import "./NoteWidget.css";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function NoteWidget({db, items, noteToOpenId, setNoteToOpenId, user}) {
  const [itemTitle, setItemTitle] = useState("");
  const [itemText, setItemText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [noteDate, setNoteDate] = useState(null);

  useEffect(() => {
    if (noteToOpenId && items.length > 0) {
      const noteToEdit = items.find(item => item.id === noteToOpenId);
      if (noteToEdit) {
        setItemTitle(noteToEdit.title);
        setItemText(noteToEdit.text);
        setEditingId(noteToOpenId);
        setNoteDate(noteToEdit.date ? dayjs(noteToEdit.date) : null);
        setShowForm(true); 
      }
      setNoteToOpenId(null);
    }
  }, [noteToOpenId, items, setNoteToOpenId]);

  const handleOpen = () => {
    setItemTitle("");
    setItemText("");
    setEditingId(null);
    setNoteDate(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setItemTitle("");
    setItemText("");
    setEditingId(null);
    setNoteDate(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dateToSave = noteDate && noteDate.isValid() ? noteDate.toISOString() : null;

    if (!user || user.isAnonymous) {
      console.log("Guest notes are not saved to Firestore");
      handleClose();
      return;
    }

    try {
      if (editingId) {
        const noteRef = doc(db, "notes", editingId);
        await updateDoc(noteRef, { title: itemTitle, text: itemText, date: dateToSave });
      } else {
        await addDoc(collection(db, "notes"), {
          title: itemTitle,
          text: itemText,
          favorite: false,
          created: Date.now(),
          date: dateToSave,
          uid: user.uid
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleEdit = (id) => {
    const note = items.find(item => item.id === id);
    if (note) {
      setItemTitle(note.title);
      setItemText(note.text);
      setEditingId(id);
      setShowForm(true);
      setNoteDate(note.date ? dayjs(note.date) : null);
    }
  };

  const removeItem = async (id) => {
    if (!user || user.isAnonymous) {
      handleClose();
      return;
    }
    try {
      await deleteDoc(doc(db, "notes", id));
      handleClose();
    } catch (error) {
      console.error("Error removing note:", error);
    }
  };

  const toggleFavorite = async (id) => {
    if (!user || user.isAnonymous) return;
    const noteToToggle = items.find(item => item.id === id);
    if (noteToToggle) {
      try {
        const noteRef = doc(db, "notes", id);
        await updateDoc(noteRef, { favorite: !noteToToggle.favorite });
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    }
  };

  return (
    <div className="note-widget">
      <div className="note-widget-header">
        <h1>Notes</h1>
        {!showForm && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleOpen}
            sx={{ padding: 1.9, "& svg": { transition: "transform 0.15s ease" }, "&:hover svg": { transform: "scale(1.2)" } }}
          >
            <AddIcon />
          </Button>
        )}
      </div>

      {/* Modal for create/edit */}
      <Modal open={showForm} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
          <form onSubmit={handleSubmit} className="note-form">
            <input className="note-title" type="text" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Title..." />
            <EditorProvider>
              <Editor value={itemText} onChange={(e) => setItemText(e.target.value)} placeholder="Write your note here...">
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
                label="Note Date (Optional)"
                value={noteDate}
                onChange={(newValue) => setNoteDate(newValue)}
                format="DD.MM.YYYY"
                slotProps={{
                  field: { clearable: true, onClear: () => setNoteDate(null) },
                }}
              />
            </LocalizationProvider>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <Button variant="contained" type="submit">{editingId ? "Update" : "Add"}</Button>
              <Button variant="outlined" onClick={handleClose}>Cancel</Button>
              {editingId && (
                <Button variant="contained" color="error" onClick={() => removeItem(editingId)} startIcon={<DeleteIcon />} sx={{ marginLeft: 'auto' }}>Delete</Button>
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
                <Button variant="contained" size="small" onClick={() => toggleFavorite(item.id)}>
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
            <div className="note-text">{parse(DOMPurify.sanitize(item.text))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteWidget;
