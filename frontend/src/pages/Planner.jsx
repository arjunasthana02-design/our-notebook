import { apiUrl } from "../services/api";
import { useState, useEffect } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import {
  bucketCategories,
  priorities,
  statuses,
} from "../data/notebookData";

export default function Planner() {

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dreams, setDreams] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "Travel",
    priority: "Low",
    status: "Not Started",
    favourite: false,
    photos: [],
    videos: []
  });

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {

      const res = await fetch(apiUrl("/planner"));

      const data = await res.json();

      setDreams(data);

    } catch (err) {

      console.error(err);

    }
  };

  const updateField = (key, value) => {

    setForm((prev) => ({

      ...prev,

      [key]: value

    }));

  };

  const saveDream = async () => {

    if (form.title.trim() === "") {

      alert("Please enter a dream.");

      return;

    }

    const dreamData = {

      title: form.title,
      description: form.description,
      location: form.location,
      target_date: form.date,
      category: form.category,
      priority: form.priority,
      status: form.status,
      favourite: form.favourite

    };

    try {

      if (editingId !== null) {

        await fetch(apiUrl(`/planner/${editingId}`), {

          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            ...dreamData,

            completed: false

          })

        });

      } else {

        await fetch(apiUrl("/planner"), {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(dreamData)

        });

      }

      await loadDreams();

      setForm({

        title: "",
        description: "",
        location: "",
        date: "",
        category: "Travel",
        priority: "Low",
        status: "Not Started",
        favourite: false,
        photos: [],
        videos: []

      });

      setEditingId(null);

      setShowForm(false);

    } catch (err) {

      console.error(err);

      alert("Failed to save dream.");

    }

  };
    const deleteDream = async (id) => {

    if (!window.confirm("Delete this dream?")) return;

    try {

      await fetch(apiUrl(`/planner/${id}`), {
        method: "DELETE"
      });

      await loadDreams();

    } catch (err) {

      console.error(err);

      alert("Failed to delete dream.");

    }

  };

  const editDream = (dream) => {

    setEditingId(dream.id);

    setForm({

      title: dream.title || "",
      description: dream.description || "",
      location: dream.location || "",
      date: dream.target_date || "",
      category: dream.category || "Travel",
      priority: dream.priority || "Low",
      status: dream.status || "Not Started",
      favourite: dream.favourite || false,
      photos: [],
      videos: []

    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };

  const toggleFavourite = async (id) => {

    const dream = dreams.find((d) => d.id === id);

    if (!dream) return;

    try {

      await fetch(apiUrl(`/planner/${id}`), {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          title: dream.title,
          description: dream.description,
          location: dream.location,
          target_date: dream.target_date,
          category: dream.category,
          priority: dream.priority,
          status: dream.status,
          favourite: !dream.favourite,
          completed: dream.completed

        })

      });

      await loadDreams();

    } catch (err) {

      console.error(err);

      alert("Failed to update favourite.");

    }

  };

  return (    <ScrapbookLayout>
      <section className="paper-stage">

        <header className="page-head">

          <div>

            <div className="page-kicker">
              Someday...
            </div>

            <h1 className="page-title">
              Things We Should Do
            </h1>

            <p className="page-subtitle">
              Every dream deserves a place. Let's keep them here.
            </p>

          </div>

          <button
            className="notebook-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close" : "+ New Dream"}
          </button>

        </header>

        {showForm && (

          <section className="scrap-card">

            <h2>✨ What's the dream?</h2>

            <input
              className="paper-field"
              placeholder="What's on our bucket list..."
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />

            <textarea
              className="paper-textarea"
              placeholder="Tell me a little more..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />

            <div className="field-grid">

              <input
                className="paper-field"
                type="text"
                placeholder="When? (Optional)"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
              />

              <input
                className="paper-field"
                placeholder="Where? (Optional)"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />

              <select
                className="paper-select"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {bucketCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="paper-select"
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                className="paper-select"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

            </div>

            <button
              className="notebook-button"
              style={{ marginTop: 20 }}
              onClick={saveDream}
            >
              {editingId !== null ? "Save Changes" : "Save Dream"}
            </button>

          </section>

        )}

        <div className="scrap-grid">

          {dreams.map((dream) => (

            <article
              className="scrap-card"
              key={dream.id}
            >

              <div className="tag-row">

                <span className="tag">
                  {dream.category}
                </span>

                <span className="tag">
                  {dream.priority}
                </span>

                <span className="tag">
                  {dream.status}
                </span>

              </div>

              <h2>{dream.title}</h2>

              <p>{dream.description}</p>

              <div className="tag-row">

                <button
                  className="tag"
                  onClick={() => toggleFavourite(dream.id)}
                >
                  {dream.favourite
                    ? "⭐ Favourite"
                    : "☆ Favourite"}
                </button>

                <button
                  className="tag"
                  onClick={() => editDream(dream)}
                >
                  ✏ Edit
                </button>

                <button
                  className="tag"
                  onClick={() => deleteDream(dream.id)}
                >
                  🗑 Delete
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>

    </ScrapbookLayout>

  );

}