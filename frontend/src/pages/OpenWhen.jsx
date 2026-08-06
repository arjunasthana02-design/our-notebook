import { useEffect, useMemo, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiUrl } from "../services/api";
import "./NotebookExtras.css";

const LEGACY_STORAGE_KEY = "notebook-open-when-notes";
const SECRET_PASSWORD = "260626";

const DEFAULT_NOTES = [
  {
    id: "happy",
    title: "Open when happy",
    prompt: "Keep the joy somewhere we can find it again.",
    text: ""
  },
  {
    id: "sad",
    title: "Open when sad",
    prompt: "A soft place for the heavy days.",
    text: ""
  },
  {
    id: "angry",
    title: "Open when angry",
    prompt: "Write it out before the silence gets loud.",
    text: ""
  },
  {
    id: "fought",
    title: "Open if we fought",
    prompt: "For the after part, when love needs gentleness.",
    text: ""
  },
  {
    id: "right-time",
    title: "Open when the time is right",
    prompt: "One secret page, one tiny key.",
    text: "",
    locked: true
  }
];

function readNotesBackup() {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeNotesBackup(notes) {
  localStorage.setItem(
    LEGACY_STORAGE_KEY,
    JSON.stringify(notes.map(({ id, text }) => ({ id, text })))
  );
}

function noteHasText(note) {
  return Boolean(note && String(note.text || "").trim());
}

export default function OpenWhen() {
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [password, setPassword] = useState("");
  const [secretOpen, setSecretOpen] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [saveMessage, setSaveMessage] = useState("Loading shared letters...");
  const [notesLoaded, setNotesLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      try {
        const response = await fetch(apiUrl("/open-when-notes"));

        if (!response.ok) {
          throw new Error("Could not load shared letters.");
        }

        const saved = await response.json();

        if (!active) return;

        const legacySaved = readNotesBackup();

        const nextNotes = (
          DEFAULT_NOTES.map((note) => {
            const sharedNote = Array.isArray(saved)
              ? saved.find((item) => item.id === note.id)
              : null;
            const legacyNote = Array.isArray(legacySaved)
              ? legacySaved.find((item) => item.id === note.id)
              : null;
            const bestNote = noteHasText(sharedNote) ? sharedNote : legacyNote;

            return {
              ...note,
              ...(bestNote || sharedNote || legacyNote || {})
            };
          })
        );

        setNotes(nextNotes);
        writeNotesBackup(nextNotes);
        setSaveMessage("Saved for both browsers.");
        setNotesLoaded(true);
      } catch {
        if (active) {
          const legacySaved = readNotesBackup();
          setNotes(
            DEFAULT_NOTES.map((note) => {
              const legacyNote = legacySaved.find((item) => item.id === note.id);
              return {
                ...note,
                ...(legacyNote || {})
              };
            })
          );
          setSaveMessage("Using saved letters on this browser.");
          setNotesLoaded(true);
        }
      }
    }

    loadNotes();

    return () => {
      active = false;
    };
  }, []);

  const unlockedNotes = useMemo(
    () => notes.filter((note) => !note.locked || secretOpen),
    [notes, secretOpen]
  );
  const activeNote = notes.find((note) => note.id === activeNoteId);

  function updateNote(id, value) {
    setNotes((current) => {
      const nextNotes = current.map((note) =>
        note.id === id ? { ...note, text: value } : note
      );
      writeNotesBackup(nextNotes);
      return nextNotes;
    });
    setSaveMessage("Saving...");
  }

  useEffect(() => {
    if (!notesLoaded) return;

    const notesToSave = notes.map(({ id, text }) => ({ id, text }));
    writeNotesBackup(notes);

    const timer = setTimeout(async () => {
      try {
        const responses = await Promise.all(
          notesToSave.map((note) =>
            fetch(apiUrl(`/open-when-notes/${note.id}`), {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ text: note.text })
            })
          )
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Could not save to the website.");
        }

        setSaveMessage("Saved for both browsers.");
      } catch {
        setSaveMessage("Saved on this browser. Website database is reconnecting.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [notes, notesLoaded]);

  function unlockSecret() {
    if (password.trim() === SECRET_PASSWORD) {
      setSecretOpen(true);
      setSecretMessage("");
      return;
    }

    setSecretMessage("Wrong password.");
  }

  function openLetter(note) {
    if (note.locked && !secretOpen) return;
    setActiveNoteId(note.id);
  }

  return (
    <ScrapbookLayout>
      <section className="paper-stage open-when-stage">
        <header className="page-head open-when-head">
          <div>
            <div className="page-kicker">Open When...</div>
            <h1 className="page-title">Letters for the exact moment.</h1>
            <p className="page-subtitle">
              Write anything here manually. Every note stays editable.
            </p>
          </div>
        </header>

        <div className="secret-grid">
          {notes.map((note) => (
            <article
              className={`secret-card open-when-card letter-envelope ${
                note.locked && !secretOpen ? "is-locked" : "open"
              }`}
              key={note.id}
            >
              <div className="envelope-flap" />
              <h2>{note.title}</h2>
              <p className="secret-prompt">{note.prompt}</p>

              {note.locked && !secretOpen ? (
                <>
                  <div className="locked-card">Secret page</div>
                  <div className="unlock-row">
                    <input
                      className="paper-field"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") unlockSecret();
                      }}
                    />
                    <button className="notebook-button" onClick={unlockSecret}>
                      Unlock
                    </button>
                  </div>
                  {secretMessage && (
                    <p className="secret-message">{secretMessage}</p>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="notebook-button letter-open-button"
                    onClick={() => openLetter(note)}
                  >
                    Open Letter
                  </button>
                </>
              )}
            </article>
          ))}
        </div>

        {unlockedNotes.length === notes.length && (
          <p className="open-when-save-note">{saveMessage}</p>
        )}

        {activeNote && (!activeNote.locked || secretOpen) && (
          <div className="letter-modal" role="dialog" aria-modal="true">
            <div className="letter-page">
              <button
                className="letter-close"
                type="button"
                onClick={() => setActiveNoteId(null)}
                aria-label="Close letter"
              >
                Close
              </button>
              <p className="page-kicker">A letter for you</p>
              <h2>{activeNote.title}</h2>
              <textarea
                className="paper-textarea letter-page-text"
                placeholder="Write your paragraph here..."
                value={activeNote.text}
                onChange={(event) => updateNote(activeNote.id, event.target.value)}
                autoFocus
              />
              <p className="open-when-save-note">{saveMessage}</p>
            </div>
          </div>
        )}
      </section>
    </ScrapbookLayout>
  );
}
