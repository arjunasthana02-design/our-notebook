import { useEffect, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiFetch } from "../services/api";
import "./Timeline.css";

const emptyForm = {
  title: "",
  subtitle: "",
  chapter_order: ""
};
const TIMELINE_STORAGE_KEY = "notebook-timeline-chapters";
const FALLBACK_TIMELINE = [
  {
    id: 1,
    title: "First Time Seeing",
    subtitle: "30 july 2022 you were wearing a white tshirt black pajamas and purple headband and I am pretty certain. .",
    chapter_order: 1,
    is_loading: false
  },
  {
    id: 2,
    title: "First Conversation",
    subtitle: "15 April 2023 I texted hi finally took me ages though but I did.",
    chapter_order: 2,
    is_loading: false
  },
  {
    id: 3,
    title: "First Rejection",
    subtitle: "26 Jan 2026 you rejected me without even me asking you out and called me brother.... fucking hated you for it but yeah i dont blame you you had a boyfriend.",
    chapter_order: 3,
    is_loading: false
  },
  {
    id: 4,
    title: "First Meeting",
    subtitle: "Finally, a page worth waiting for.26 June 2026 ig I dont have to mention anything about it it was perfect",
    chapter_order: 4,
    is_loading: false
  },
  {
    id: 5,
    title: "Loading...",
    subtitle: "Reserved for our next first.",
    chapter_order: 5,
    is_loading: true
  }
];

function sortTimeline(data) {
  return [...data].sort((a, b) => {
    if (Boolean(a.is_loading) !== Boolean(b.is_loading)) {
      return Number(a.is_loading) - Number(b.is_loading);
    }

    return Number(a.chapter_order || 0) - Number(b.chapter_order || 0);
  });
}

function readTimelineBackup() {
  try {
    const saved = JSON.parse(localStorage.getItem(TIMELINE_STORAGE_KEY) || "[]");
    return Array.isArray(saved) && saved.length ? saved : FALLBACK_TIMELINE;
  } catch {
    return FALLBACK_TIMELINE;
  }
}

function writeTimelineBackup(data) {
  localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(sortTimeline(data)));
}

function isDatabaseError(error) {
  return /mysql|railway|server host|handshake|lost connection|proxy\.rlwy/i.test(
    String(error?.message || error || "")
  );
}

export default function Timeline() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadTimeline();
  }, []);

  async function loadTimeline() {
    try {
      setError("");
      setLoading(true);
      const res = await apiFetch("/timeline");

      if (!res.ok) {
        throw new Error("Timeline could not be loaded.");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(data.error || "Timeline response was not valid.");
      }

      const sortedChapters = sortTimeline(data);
      writeTimelineBackup(sortedChapters);
      setChapters(sortedChapters);
    } catch (err) {
      console.error(err);
      setChapters(sortTimeline(readTimelineBackup()));
      setError(
        isDatabaseError(err)
          ? ""
          : err.message || "Timeline could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function startAddChapter() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      chapter_order: chapters.filter((chapter) => !chapter.is_loading).length + 1
    });
    setShowForm(true);
  }

  function startEdit(chapter) {
    if (chapter.is_loading) return;
    setEditingId(chapter.id);
    setForm({
      title: chapter.title || "",
      subtitle: chapter.subtitle || "",
      chapter_order: chapter.chapter_order || ""
    });
    setShowForm(true);
  }

  async function saveChapter() {
    if (form.title.trim() === "") {
      alert("Please enter a chapter title.");
      return;
    }

    try {
      setSaving(true);
      const response = await apiFetch(
        editingId ? `/timeline/${editingId}` : "/timeline",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Unable to save chapter.");
      }

      await loadTimeline();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      const nextChapters = sortTimeline(
        editingId
          ? chapters.map((chapter) =>
              chapter.id === editingId
                ? {
                    ...chapter,
                    title: form.title.trim(),
                    subtitle: form.subtitle.trim(),
                    chapter_order: Number(form.chapter_order || 1)
                  }
                : chapter
            )
          : [
              ...chapters.filter((chapter) => !chapter.is_loading),
              {
                id: Date.now(),
                title: form.title.trim(),
                subtitle: form.subtitle.trim(),
                chapter_order: Number(form.chapter_order || 1),
                is_loading: false
              },
              ...chapters.filter((chapter) => chapter.is_loading)
            ]
      );

      writeTimelineBackup(nextChapters);
      setChapters(nextChapters);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setError("");
    } finally {
      setSaving(false);
    }
  }

  async function deleteChapter(chapter) {
    if (chapter.is_loading) return;
    if (!window.confirm("Delete this chapter?")) return;

    try {
      const response = await apiFetch(`/timeline/${chapter.id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Unable to delete chapter.");
      }

      await loadTimeline();
    } catch (err) {
      console.error(err);
      const nextChapters = sortTimeline(chapters.filter((item) => item.id !== chapter.id));
      writeTimelineBackup(nextChapters);
      setChapters(nextChapters);
      setError("");
    }
  }

  return (
    <ScrapbookLayout>
      <section className="timeline-page">
        <div className="timeline-header">
          <h1>All Our Firsts</h1>
          <p>Every first deserves its own page.</p>
        </div>

        <div className="timeline-actions">
          <button className="notebook-button" onClick={startAddChapter}>
            Add Chapter
          </button>
        </div>

        {showForm && (
          <div className="timeline-popup-backdrop">
            <div className="timeline-form">
              <h2>{editingId ? "Edit Chapter" : "Add Chapter"}</h2>
              <input
                className="paper-field"
                placeholder="Title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
              <textarea
                className="paper-textarea"
                placeholder="One line description"
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
              />
              <input
                className="paper-field"
                type="number"
                min="1"
                placeholder="Chapter number"
                value={form.chapter_order}
                onChange={(e) => updateField("chapter_order", e.target.value)}
              />
              <div className="timeline-buttons">
                <button className="notebook-button" disabled={saving} onClick={saveChapter}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="notebook-button secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="timeline-loading">Loading Timeline...</div>
        ) : error ? (
          <section className="timeline-state">
            <h2>Timeline is taking a moment</h2>
            <p>{error}</p>
            <button className="notebook-button" onClick={loadTimeline}>
              Try Again
            </button>
          </section>
        ) : chapters.length === 0 ? (
          <section className="timeline-state">
            <h2>No timeline chapters yet</h2>
            <p>Add the first chapter and it will appear here.</p>
            <button className="notebook-button" onClick={startAddChapter}>
              Add Chapter
            </button>
          </section>
        ) : (
          <div className="timeline-list">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`timeline-card ${chapter.is_loading ? "loading-card" : ""}`}
              >
                <div className="timeline-pin" />
                <div className="timeline-number">Chapter {chapter.chapter_order}</div>
                <h2>{chapter.title}</h2>
                <p>{chapter.subtitle}</p>
                {!chapter.is_loading && (
                  <div className="timeline-card-buttons">
                    <button className="tag" onClick={() => startEdit(chapter)}>
                      Edit Chapter
                    </button>
                    <button className="tag" onClick={() => deleteChapter(chapter)}>
                      Delete Chapter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </ScrapbookLayout>
  );
}
