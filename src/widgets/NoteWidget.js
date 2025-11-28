import React, { useState } from 'react';
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


function NoteWidget() {
  const [itemTitle, setItemTitle] = useState("");
  const [itemText, setItemText] = useState("");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  
  const handleOpen = () => setShowForm(true);
  const handleClose = () => {
    setShowForm(false);
    setItemTitle("");
    setItemText("");
  };

  const [showForm, setShowForm] = useState(false);

  // add a new item 
  const handleSubmit = (event) => {
  // prevent normal submit event
  event.preventDefault();

  if (editingId) {
    setItems(items.map(item => 
      item.id === editingId ? { ...item, title: itemTitle, text: itemText } : item
    ));
  }
  else {
  // add item to items, Math.random() is used to generate "unique" ID...
  setItems([...items, {id: Math.random(), title: itemTitle, text: itemText, favorite: false}])
  }
  // modify newItem text to ""
  setItemTitle("");
  setItemText("");
  setEditingId(null);
  setShowForm(false);
  };

  const handleEdit = (id) => {
  const note = items.find(item => item.id === id);
  if (note) {
    setItemTitle(note.title);
    setItemText(note.text);
    setEditingId(id);
    setShowForm(true);
  }
};

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleFavorite = (id) => {
  setItems(prev =>
    prev.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    )
  );
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
          sx={{ padding: 1.9 }}
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
                  Add
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
        {[...items]
          .sort((a, b) => {
            if (a.favorite !== b.favorite) {
              return a.favorite ? -1 : 1; // favorites first
            }
            return b.id - a.id; // newest first
          })
          .map(item => (
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

            <div className="note-text" dangerouslySetInnerHTML={{ __html: item.text }} />

          </div>
        ))}
      </div>

    </div>
  );
}

export default NoteWidget;