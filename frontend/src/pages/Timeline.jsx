import { useEffect, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiUrl } from "../services/api";
import "./Timeline.css";

const emptyForm = {
  title: "",
  subtitle: "",
  chapter_order: ""
};

export default function Timeline() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadTimeline();
  }, []);

  async function loadTimeline() {
    try {
      const res = await fetch(apiUrl("/timeline"));
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
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
      const response = await fetch(
        editingId ? apiUrl(`/timeline/${editingId}`) : apiUrl("/timeline"),
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
        throw new Error(result.error || "Unable to save chapter.");
      }

      await loadTimeline();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to save chapter.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteChapter(chapter) {
    if (chapter.is_loading) return;
    if (!window.confirm("Delete this chapter?")) return;

    try {
      const response = await fetch(apiUrl(`/timeline/${chapter.id}`), {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to delete chapter.");
      }

      await loadTimeline();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to delete chapter.");
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
