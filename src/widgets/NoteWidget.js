import React, { useState } from 'react';
import "./NoteWidget.css";
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
  setItems([...items, {id: Math.random(), title: itemTitle, text: itemText}])
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

  
  return (
    <div className="note-widget">
      <h2>Notes</h2>

      {/* Create button when form is hidden */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}>
          + Create New Note
        </button>
      )}

      {/* Note creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="note-form">
          <input
            className="note-title"
            type="text"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="Write your title here..."
          />
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit">Add</button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setItemTitle("");
                setItemText("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      <div className="notes-list">
        {items.map(item => (
          <div className="note" key={item.id}>
            <h3>{item.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: item.text }} />
            <div className="note-buttons">
              <button className="edit-button" onClick={() => handleEdit(item.id)}>✎</button>
              <button className="delete-button" onClick={() => removeItem(item.id)}>x</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteWidget;