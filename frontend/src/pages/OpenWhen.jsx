import { useEffect, useMemo, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

const STORAGE_KEY = "notebook-open-when-notes";
const SECRET_PASSWORD = "us260626";

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

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return DEFAULT_NOTES.map((note) => ({
      ...note,
      ...(saved.find((item) => item.id === note.id) || {})
    }));
  } catch {
    return DEFAULT_NOTES;
  }
}

export default function OpenWhen() {
  const [notes, setNotes] = useState(loadNotes);
  const [password, setPassword] = useState("");
  const [secretOpen, setSecretOpen] = useState(false);
  const [secretMessage, setSecretMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const unlockedNotes = useMemo(
    () => notes.filter((note) => !note.locked || secretOpen),
    [notes, secretOpen]
  );

  function updateNote(id, value) {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, text: value } : note))
    );
  }

  function unlockSecret() {
    if (password.trim() === SECRET_PASSWORD) {
      setSecretOpen(true);
      setSecretMessage("");
      return;
    }

    setSecretMessage("Wrong password.");
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
              className={`secret-card open-when-card ${
                note.locked && !secretOpen ? "is-locked" : "open"
              }`}
              key={note.id}
            >
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
                <textarea
                  className="paper-textarea open-when-textarea"
                  placeholder="Write here..."
                  value={note.text}
                  onChange={(event) => updateNote(note.id, event.target.value)}
                />
              )}
            </article>
          ))}
        </div>

        {unlockedNotes.length === notes.length && (
          <p className="open-when-save-note">Saved on this browser.</p>
        )}
      </section>
    </ScrapbookLayout>
  );
}
