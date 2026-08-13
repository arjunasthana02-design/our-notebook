import { useMemo, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import "./FriendshipBands.css";

const NOTE_KEY = "friendship-band-notes";

const bands = [
  { name: "Glass Slipper Blue", colors: ["#dff7ff", "#84c7ee", "#2c6fa6"], charm: "slipper" },
  { name: "Midnight Castle", colors: ["#0f3b70", "#76b8f2", "#f5fbff"], charm: "castle" },
  { name: "Dollhouse Ribbon", colors: ["#b9e6ff", "#ffffff", "#6aa7df"], charm: "bow" },
  { name: "Tiny Crown", colors: ["#8bc9ff", "#f7d77a", "#ffffff"], charm: "crown" },
  { name: "Cloud Lace", colors: ["#eaf8ff", "#b7daf4", "#5b8fc6"], charm: "lace" },
  { name: "Blue Pearl", colors: ["#93d9ff", "#f9fdff", "#2d75b8"], charm: "pearl" },
  { name: "Storybook Door", colors: ["#6eb3e9", "#245c92", "#f2fbff"], charm: "key" },
  { name: "Young Bhoomi Sparkle", colors: ["#c8f0ff", "#7ab9ff", "#fff1a8"], charm: "star" },
  { name: "Royal Tea Party", colors: ["#d6f5ff", "#a1c8ee", "#f8f3e6"], charm: "cup" },
  { name: "Moonlit Doll", colors: ["#1c4f86", "#a9dfff", "#f8fbff"], charm: "moon" },
  { name: "Best Friend Forever", colors: ["#a8e7ff", "#3b88cf", "#ffffff"], charm: "heart" },
  { name: "Palace Garden", colors: ["#bfeeff", "#77bcd9", "#b9d98b"], charm: "flower" }
];

function readNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function charmLabel(charm) {
  const labels = {
    slipper: "Glass slipper",
    castle: "Castle",
    bow: "Bow",
    crown: "Crown",
    lace: "Lace",
    pearl: "Pearl",
    key: "Key",
    star: "Star",
    cup: "Tea cup",
    moon: "Moon",
    heart: "Heart",
    flower: "Flower"
  };

  return labels[charm] || "Charm";
}

export default function FriendshipBands() {
  const [selected, setSelected] = useState(bands[0]);
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState(readNotes);

  const bandStyle = useMemo(
    () => ({
      "--band-a": selected.colors[0],
      "--band-b": selected.colors[1],
      "--band-c": selected.colors[2]
    }),
    [selected]
  );

  function pickRandomBand() {
    const nextBands = bands.filter((band) => band.name !== selected.name);
    const next = nextBands[Math.floor(Math.random() * nextBands.length)];
    setSelected(next);
  }

  function saveNote() {
    const text = note.trim();

    if (!text) return;

    const nextNotes = [
      {
        id: Date.now(),
        band: selected.name,
        text
      },
      ...savedNotes
    ];

    setSavedNotes(nextNotes);
    localStorage.setItem(NOTE_KEY, JSON.stringify(nextNotes));
    setNote("");
  }

  return (
    <ScrapbookLayout>
      <section className="friendship-page">
        <div className="friendship-hero">
          <div className="friendship-copy">
            <p className="page-kicker">Friendship Bands</p>
            <h1>Little Bhoomi's blue dollhouse of bands.</h1>
            <p>
              Maybe little Bhoomi did not get friendship bands, but young Bhoomi
              will get as many friendship bands as she likes with Cinderella dolls.
            </p>
          </div>

          <div className="dollhouse" aria-label="Blue dollhouse with Cinderella-inspired dolls">
            <div className="dollhouse-roof" />
            <div className="dollhouse-body">
              <div className="dollhouse-room room-one">
                <div className="mini-doll blue-doll">
                  <span />
                </div>
              </div>
              <div className="dollhouse-room room-two">
                <div className="mini-doll cream-doll">
                  <span />
                </div>
              </div>
              <div className="dollhouse-door" />
              <div className="dollhouse-window" />
            </div>
          </div>
        </div>

        <div className="band-workbench">
          <section className="band-picker">
            <div className="band-preview" style={bandStyle}>
              <div className="band-loop">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={`band-charm ${selected.charm}`}>
                {charmLabel(selected.charm)}
              </div>
            </div>

            <div className="band-controls">
              <p className="page-kicker">Picked Band</p>
              <h2>{selected.name}</h2>
              <button className="notebook-button" type="button" onClick={pickRandomBand}>
                Pick Random Band
              </button>
            </div>
          </section>

          <section className="band-note-card">
            <p className="page-kicker">Write On The Band</p>
            <textarea
              className="paper-textarea"
              placeholder="Write anything Bhoomi wants this friendship band to say..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <button className="notebook-button" type="button" onClick={saveNote}>
              Save Band Note
            </button>
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
              <span />
              {band.name}
            </button>
          ))}
        </div>

        {savedNotes.length > 0 && (
          <section className="saved-band-notes">
            <p className="page-kicker">Saved Friendship Bands</p>
            <div className="saved-band-grid">
              {savedNotes.map((item) => (
                <article className="saved-band" key={item.id}>
                  <strong>{item.band}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </ScrapbookLayout>
  );
}
