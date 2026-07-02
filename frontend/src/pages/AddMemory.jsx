import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiUrl } from "../services/api";

export default function AddMemory() {

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [photos, setPhotos] = useState([]);

  const [videos, setVideos] = useState([]);

  const [form, setForm] = useState({

    title: "",
    summary: "",
    location: "",
    chapter_date: "",

    bhoomi_mood: "",
    bhoomi_favourite: "",
    bhoomi_story: "",

    arjun_mood: "",
    arjun_favourite: "",
    arjun_story: ""

  });

  useEffect(() => {

    if (!isEditing)
      return;

    async function loadMemory() {

      try {

        setLoading(true);

        const response = await fetch(
          apiUrl(`/chapters/${id}`)
        );

        const data = await response.json();

        if (!response.ok) {

          alert(data.error || "Couldn't load memory.");
          navigate("/chapters");
          return;

        }

        setForm({

          title: data.title || "",
          summary: data.summary || "",
          location: data.location || "",
          chapter_date: data.chapter_date || "",

          bhoomi_mood: data.bhoomi_mood || "",
          bhoomi_favourite: data.bhoomi_favourite || "",
          bhoomi_story: data.bhoomi_story || "",

          arjun_mood: data.arjun_mood || "",
          arjun_favourite: data.arjun_favourite || "",
          arjun_story: data.arjun_story || ""

        });

      }

      catch (err) {

        console.error(err);

        alert("Something went wrong.");

      }

      finally {

        setLoading(false);

      }

    }

    loadMemory();

  }, [id, isEditing, navigate]);

  const updateField = (key, value) => {

    setForm((prev) => ({
      ...prev,
      [key]: value
    }));

  };

  const saveMemory = async () => {

    if (form.title.trim() === "") {

      alert("Please enter a title.");
      return;

    }

    try {

      setLoading(true);

      const chapterUrl = isEditing
        ? apiUrl(`/chapters/${id}`)
        : apiUrl("/chapters");

      const response = await fetch(
        chapterUrl,
        {

          method: isEditing ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            title: form.title,
            summary: form.summary,
            location: form.location,
            chapter_date: form.chapter_date,

            bhoomi_mood: form.bhoomi_mood,
            bhoomi_favourite: form.bhoomi_favourite,
            bhoomi_story: form.bhoomi_story,

            arjun_mood: form.arjun_mood,
            arjun_favourite: form.arjun_favourite,
            arjun_story: form.arjun_story

          })

        }
      );

      const result = await response.json();

      if (!result.success) {

        alert("Couldn't save memory.");
        return;

      }

      const chapterId = isEditing ? id : result.chapter_id;

      for (const photo of photos) {

        const data = new FormData();

        data.append("photo", photo);

        await fetch(

          apiUrl(`/upload-photo/${chapterId}`),

          {

            method: "POST",

            body: data

          }

        );

      }

      for (const video of videos) {

        const data = new FormData();

        data.append("video", video);

        await fetch(

          apiUrl(`/upload-video/${chapterId}`),

          {

            method: "POST",

            body: data

          }

        );

      }

      alert(isEditing ? "Memory updated 📖" : "Memory saved 📖");

      navigate("/chapters");

    }

    catch (err) {

      console.error(err);

      alert("Something went wrong.");

    }

    finally {

      setLoading(false);

    }

  };
  return (

  <ScrapbookLayout>

    <section className="paper-stage">

      <header className="page-head">

        <div>

          <div className="page-kicker">

            New Memory 📖

          </div>

          <h1 className="page-title">

            Let's save this moment forever.

          </h1>

          <p className="page-subtitle">

            Two hearts. Two perspectives. One unforgettable memory.

          </p>

        </div>

        <Link
          className="notebook-button secondary"
          to="/chapters"
        >

          ← Back

        </Link>

      </header>

      <section className="scrap-card">

        <h2 style={{ marginBottom: 25 }}>

          📖 Tell us about this memory

        </h2>

        <div className="field-grid">

          <input
            className="paper-field"
            placeholder="Memory Title"
            value={form.title}
            onChange={(e) =>
              updateField("title", e.target.value)
            }
          />

          <input
            className="paper-field"
            placeholder="When did this happen?"
            value={form.chapter_date}
            onChange={(e) =>
              updateField("chapter_date", e.target.value)
            }
          />

          <input
            className="paper-field"
            placeholder="Where were you?"
            value={form.location}
            onChange={(e) =>
              updateField("location", e.target.value)
            }
          />

        </div>

        <textarea
          className="paper-textarea"
          style={{
            marginTop: 20
          }}
          placeholder="Give this memory a short description..."
          value={form.summary}
          onChange={(e) =>
            updateField("summary", e.target.value)
          }
        />

        <hr style={{ margin: "35px 0" }} />

        <h2>

          🌸 Bhoomi's Corner

        </h2>

        <div
          className="field-grid"
          style={{ marginTop: 18 }}
        >

          <input
            className="paper-field"
            placeholder="Mood"
            value={form.bhoomi_mood}
            onChange={(e) =>
              updateField("bhoomi_mood", e.target.value)
            }
          />

          <input
            className="paper-field"
            placeholder="Favourite Part"
            value={form.bhoomi_favourite}
            onChange={(e) =>
              updateField("bhoomi_favourite", e.target.value)
            }
          />

        </div>

        <textarea
          className="paper-textarea"
          style={{
            marginTop: 18,
            minHeight: 180
          }}
          placeholder="Bhoomi... tell your side of this memory ✨"
          value={form.bhoomi_story}
          onChange={(e) =>
            updateField("bhoomi_story", e.target.value)
          }
        />

        <hr style={{ margin: "35px 0" }} />

        <h2>

          🦍 Arjun's Corner

        </h2>

        <div
          className="field-grid"
          style={{ marginTop: 18 }}
        >

          <input
            className="paper-field"
            placeholder="Mood"
            value={form.arjun_mood}
            onChange={(e) =>
              updateField("arjun_mood", e.target.value)
            }
          />

          <input
            className="paper-field"
            placeholder="Favourite Part"
            value={form.arjun_favourite}
            onChange={(e) =>
              updateField("arjun_favourite", e.target.value)
            }
          />

        </div>

        <textarea
          className="paper-textarea"
          style={{
            marginTop: 18,
            minHeight: 180
          }}
          placeholder="Arjun... tell your side of this memory 🦍"
          value={form.arjun_story}
          onChange={(e) =>
            updateField("arjun_story", e.target.value)
          }
        />

        <hr style={{ margin: "35px 0" }} />

        {/* PHOTO & VIDEO SECTION STARTS HERE */}
        <div
  className="field-grid"
  style={{ marginTop: 20 }}
>

  <div>

    <label
      className="notebook-button secondary"
      style={{
        cursor: "pointer",
        width: "100%",
        display: "flex",
        justifyContent: "center"
      }}
    >

      📷 Upload Photos

      <input
        hidden
        multiple
        type="file"
        accept="image/*"
        onChange={(e) =>
          setPhotos(Array.from(e.target.files))
        }
      />

    </label>

    {photos.length > 0 && (

      <p
        style={{
          marginTop: 10,
          color: "#654331"
        }}
      >

        {photos.length} photo(s) selected

      </p>

    )}

  </div>

  <div>

    <label
      className="notebook-button secondary"
      style={{
        cursor: "pointer",
        width: "100%",
        display: "flex",
        justifyContent: "center"
      }}
    >

      🎥 Upload Videos

      <input
        hidden
        multiple
        type="file"
        accept="video/*"
        onChange={(e) =>
          setVideos(Array.from(e.target.files))
        }
      />

    </label>

    {videos.length > 0 && (

      <p
        style={{
          marginTop: 10,
          color: "#654331"
        }}
      >

        {videos.length} video(s) selected

      </p>

    )}

  </div>

</div>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 35
  }}
>

  <Link
    to="/chapters"
    className="notebook-button secondary"
  >

    Cancel

  </Link>

  <button
    className="notebook-button"
    disabled={loading}
    onClick={saveMemory}
  >

    {loading ? "Saving..." : "💾 Save Memory"}

  </button>

</div>

      </section>

    </section>

  </ScrapbookLayout>

);

}
