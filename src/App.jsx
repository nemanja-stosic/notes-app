import { useEffect, useState } from "react";
import Split from "react-split";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import "./App.css";
import {
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
import { notesCollection, db } from "./database/firebase";

function App() {
  const [notes, setNotes] = useState([]);

  //init with first note id. first check if note exists  and return that id if not return emptry string
  //notes[0] && notes[0].id SAME AS notes[0]?.id
  const [currentNoteId, setCurrentNoteId] = useState((notes[0]?.id) || "");

  //saving body of note from db to a state so that we don't call db on every key stroke (debouncing)
  const [tempNoteText, setTempNoteText] = useState("");

  //if there is note id which is the same as the current note id return it if not return first note
  const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

  //sorting notes by updateAt (number)
  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);

  //run  once when component mounts
  useEffect(() => {
    /*giving ability to React to unsubsribe from this listener when component is unmounted
     (someone closes the tab or component is not rendered for some reason) */
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      // Sync up our local notes array with the snapshot data
      const notesArray = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setNotes(notesArray);
    });

    //clean up
    return unsubscribe;
  }, []);

  //this way  we can keep track of what note is currently being edited
  //currentNoteId will not be empty string, when data comes it will be set
  useEffect(() => {
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id);
    }
  }, [notes]);

  //this copies the current note's text into the `tempNoteText` field so whenever 
  //the user changes the currentNote, the editor can display the correct text
  useEffect(() => {
    if (currentNote) {
      setTempNoteText(currentNote.body);
    }
  }, [currentNote]);

  //run every time tempNoteText changes and save that change in firebase database
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      //preventing updating when user selects a note
      if(tempNoteText !== currentNote.body) {
        updateNote(tempNoteText);
      }
    }, 500);
    //every time useEffect is called again after 500ms, clean up func will be called to cancel timer
    return () => clearTimeout(timeoutId);
  }, [tempNoteText]);

  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newNoteRef = await addDoc(notesCollection, newNote);
    setCurrentNoteId(newNoteRef.id);
  }

  async function updateNote(text) {
    const notesRef = doc(db, "notes", currentNoteId);

    await updateDoc(notesRef, {
      body: text,
      updatedAt: Date.now(),
    });
  }

  async function deleteNote(noteId) {
    await deleteDoc(doc(db, "notes", noteId));
  }

  return (
    <main>
      {
        notes.length > 0 ?
          // library that allows us to use resizable pane
          <Split sizes={[30, 70]} direction="horizontal" className="split">
            <Sidebar
              notes={sortedNotes}
              currentNote={currentNote}
              setCurrentNoteId={setCurrentNoteId}
              newNote={createNewNote}
              deleteNote={deleteNote}
            />
            <Editor tempNoteText={tempNoteText} setTempNoteText={setTempNoteText} />
          </Split>
          :
          <div className="no-notes">
            <h1>You have no notes</h1>
            <button className="first-note" onClick={createNewNote}>
              Create one now
            </button>
          </div>
      }
    </main>
  );
}

export default App;
