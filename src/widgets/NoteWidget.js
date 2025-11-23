import React, { useState } from 'react';
import "./NoteWidget.css";

function NoteWidget() {
  const [itemTitle, setItemTitle] = useState("");
  const [itemText, setItemText] = useState("");
  const [items, setItems] = useState([]);

  const [showForm, setShowForm] = useState(false);

  // add a new item 
  const handleSubmit = (event) => {
  // prevent normal submit event
  event.preventDefault();
  // add item to items, Math.random() is used to generate "unique" ID...
  setItems([...items, {id: Math.random(), title: itemTitle, text: itemText}])
  // modify newItem text to ""
  setItemTitle("");
  setItemText("");

  setShowForm(false);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  
  return (
    <div className="widget">
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
            placeholder="Title"
          />
          <textarea
            className="note-text"
            value={itemText}
            onChange={(e) => setItemText(e.target.value)}
            placeholder="Write your note here"
          />
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
            <p>{item.text}</p>
            <button onClick={() => removeItem(item.id)}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteWidget;