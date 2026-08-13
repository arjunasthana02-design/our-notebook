import { useEffect, useMemo, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiFetch } from "../services/api";
import "./FriendshipBands.css";

const NOTE_KEY = "friendship-band-notes";

const bands = [
  {
    name: "Happy Bhoomi Band",
    detail: "Smiley face band",
    colors: ["#ffe781", "#fff8c7", "#6ac7ff"],
    charm: "smile",
    image: ""
  },
  {
    name: "Marvel Bhoomi Band",
    detail: "Spiderman band",
    colors: ["#d71920", "#1f65b7", "#111827"],
    charm: "web",
    image: "/images/surprise/bands/spiderman.png"
  },
  {
    name: "Cute Bhoomi Band",
    detail: "Cute rose band",
    colors: ["#ffc8e5", "#fff7fb", "#8fd6a4"],
    charm: "rose",
    image: "/images/surprise/bands/rose.png"
  },
  {
    name: "Rockstar Bhoomi Band",
    detail: "Band with a guitar",
    colors: ["#101827", "#72b7ff", "#f5d067"],
    charm: "rockstar",
    image: "/images/surprise/bands/rockstar.png"
  },
  {
    name: "K Drama Band",
    detail: "Soft blue drama-heart band",
    colors: ["#b9e8ff", "#ffffff", "#ff9fc8"],
    charm: "kdrama",
    image: "/images/surprise/bands/kdrama-heart.png"
  },
  {
    name: "Cinderella Bhoomi Band",
    detail: "Glass slipper blue band",
    colors: ["#e9fbff", "#8dd7ff", "#2f80c1"],
    charm: "slipper",
    image: "/images/surprise/bands/glass-shoe.png"
  },
  {
    name: "Princess Bhoomi Band",
    detail: "Tiny crown band",
    colors: ["#a7dbff", "#f7d36f", "#ffffff"],
    charm: "crown",
    image: "/images/surprise/bands/crown.png"
  },
  {
    name: "Coffee Bhoomi Band",
    detail: "Cold coffee band",
    colors: ["#6fb7e8", "#f3e2cf", "#7c4f3b"],
    charm: "coffee",
    image: "/images/surprise/bands/coffee.png"
  },
  {
    name: "Laughing Bhoomi Band",
    detail: "For the laugh that fixes everything",
    colors: ["#fff4a8", "#79d6ff", "#ffffff"],
    charm: "srk",
    image: "/images/surprise/bands/srk.png"
  }
];

function readLocalNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveLocalNotes(notes) {
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
}

export default function FriendshipBands() {
  const [selected, setSelected] = useState(bands[0]);
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState(readLocalNotes);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("Loading saved friendship bands...");

  const bandStyle = useMemo(
    () => ({
      "--band-a": selected.colors[0],
      "--band-b": selected.colors[1],
      "--band-c": selected.colors[2]
    }),
    [selected]
  );

  useEffect(() => {
    loadSavedBands();
  }, []);

  async function loadSavedBands() {
    try {
      const response = await apiFetch("/friendship-bands");
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data.error || "Could not load saved bands.");
      }

      setSavedNotes(data);
      saveLocalNotes(data);
      setStatus("Saved friendship bands are shared on the site.");
    } catch {
      const localNotes = readLocalNotes();
      setSavedNotes(localNotes);
      setStatus("Saved on this browser while the site database reconnects.");
    }
  }

  function pickRandomBand() {
    const nextBands = bands.filter((band) => band.name !== selected.name);
    const next = nextBands[Math.floor(Math.random() * nextBands.length)];
    setSelected(next);
  }

  async function saveNote() {
    const text = note.trim();

    if (!text) return;

    try {
      const response = await apiFetch(
        editingId ? `/friendship-bands/${editingId}` : "/friendship-bands",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            band: selected.name,
            text
          })
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not save band.");
      }

      const nextItem = {
        id: result.id || editingId || Date.now(),
        band: result.band || selected.name,
        text: result.text || text
      };
      const nextNotes = editingId
        ? savedNotes.map((item) => (item.id === editingId ? nextItem : item))
        : [nextItem, ...savedNotes];

      setSavedNotes(nextNotes);
      saveLocalNotes(nextNotes);
      setNote("");
      setEditingId(null);
      setStatus("Saved friendship band to the site.");
    } catch {
      const nextItem = {
        id: editingId || Date.now(),
        band: selected.name,
        text
      };
      const nextNotes = editingId
        ? savedNotes.map((item) => (item.id === editingId ? nextItem : item))
        : [nextItem, ...savedNotes];

      setSavedNotes(nextNotes);
      saveLocalNotes(nextNotes);
      setNote("");
      setEditingId(null);
      setStatus("Saved on this browser while the site database reconnects.");
    }
  }

  function editSavedBand(item) {
    const band = bands.find((option) => option.name === item.band);

    if (band) {
      setSelected(band);
    }

    setNote(item.text || "");
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSavedBand(id) {
    if (!window.confirm("Delete this saved friendship band?")) return;

    const nextNotes = savedNotes.filter((item) => item.id !== id);
    setSavedNotes(nextNotes);
    saveLocalNotes(nextNotes);

    try {
      await apiFetch(`/friendship-bands/${id}`, {
        method: "DELETE"
      });
      setStatus("Deleted friendship band from the site.");
    } catch {
      setStatus("Deleted here while the site database reconnects.");
    }
  }

  return (
    <ScrapbookLayout>
      <section className="friendship-page">
        <div className="surprise-hero">
          <img
            className="castle-backdrop"
            src="/images/surprise/castle.png"
            alt="Blue castle dollhouse"
          />
          <div className="surprise-copy">
            <p className="page-kicker">Surprise</p>
            <h1>Bhoomi's friendship band castle.</h1>
            <p>
              Maybe little Bhoomi did not get friendship bands, but young Bhoomi
              will get as many friendship bands as she likes with Cinderella dolls.
            </p>
            <p>
              I know you love Cinderella, although you are the real Cinderella in
              my opinion.
            </p>
          </div>
        </div>

        <div className="cinderella-strip">
          <img src="/images/surprise/cinderella-stairs.png" alt="Cinderella on blue stairs" />
          <img src="/images/surprise/cinderella-castle.png" alt="Cinderella near a castle" />
        </div>

        <div className="band-workbench">
          <section className="band-picker">
            <div className="band-preview" style={bandStyle}>
              <div className={`band-image-frame ${selected.charm}`}>
                {selected.image ? (
                  <img src={selected.image} alt={selected.name} />
                ) : (
                  <span className="smiley-face">:)</span>
                )}
              </div>
              <div className={`real-band ${selected.charm}`}>
                <span className="band-thread thread-one" />
                <span className="band-thread thread-two" />
                <span className="band-thread thread-three" />
                <span className="band-knot left-knot" />
                <span className="band-knot right-knot" />
              </div>
            </div>

            <div className="band-controls">
              <p className="page-kicker">Picked Band</p>
              <h2>{selected.name}</h2>
              <p>{selected.detail}</p>
              <button className="notebook-button" type="button" onClick={pickRandomBand}>
                Pick Random Band
              </button>
            </div>
          </section>

          <section className="band-note-card">
            <p className="page-kicker">{editingId ? "Edit Saved Band" : "Write On The Band"}</p>
            <textarea
              className="paper-textarea"
              placeholder="Write anything Bhoomi wants this friendship band to say..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="surprise-button-row">
              <button className="notebook-button" type="button" onClick={saveNote}>
                {editingId ? "Save Edited Band" : "Save Friendship Band"}
              </button>
              {editingId && (
                <button
                  className="notebook-button secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNote("");
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="surprise-status">{status}</p>
          </section>
        </div>

        <div className="band-gallery">
          {bands.map((band) => (
            <button
              className={`tiny-band ${selected.name === band.name ? "selected" : ""}`}
              key={band.name}
              type="button"
              onClick={() => setSelected(band)}
              style={{
                "--band-a": band.colors[0],
                "--band-b": band.colors[1],
                "--band-c": band.colors[2]
              }}
            >
              <span className="tiny-band-image">
                {band.image ? (
                  <img src={band.image} alt="" />
                ) : (
                  <em>:)</em>
                )}
              </span>
              <span />
              <strong>{band.name}</strong>
              <small>{band.detail}</small>
            </button>
          ))}
        </div>

        <section className="saved-band-notes">
          <p className="page-kicker">Saved Friendship Bands</p>
          {savedNotes.length === 0 ? (
            <p className="surprise-empty">No saved bands yet. Pick one and write on it.</p>
          ) : (
            <div className="saved-band-grid">
              {savedNotes.map((item) => (
                <article className="saved-band" key={item.id}>
                  <strong>{item.band}</strong>
                  <p>{item.text}</p>
                  <div className="saved-band-actions">
                    <button className="tag" type="button" onClick={() => editSavedBand(item)}>
                      Edit
                    </button>
                    <button className="tag" type="button" onClick={() => deleteSavedBand(item.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </ScrapbookLayout>
  );
}
