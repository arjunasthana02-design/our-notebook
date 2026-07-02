import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiUrl } from "../services/api";

export default function Chapters() {

  const [memories, setMemories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("Newest");

  const [galleryView, setGalleryView] = useState(false);

  useEffect(() => {

    loadMemories();

  }, []);

  async function loadMemories() {

    try {

      const response = await fetch(
        apiUrl("/chapters")
      );

      const data = await response.json();

      setMemories(data);

    }

    catch (err) {

      console.error(err);

    }

    finally {

      setLoading(false);

    }

  }

  async function deleteMemory(id) {

    if (!window.confirm("Delete this memory?"))
      return;

    try {

      const response = await fetch(

        apiUrl(`/chapters/${id}`),

        {

          method: "DELETE"

        }

      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete memory.");
      }

      loadMemories();

    } catch (err) {

      console.error(err);
      alert("Failed to delete memory.");

    }

  }

  const filteredMemories = useMemo(() => {

    let data = [...memories];

    if (search.trim() !== "") {

      data = data.filter((memory) => {

        const text = `${memory.title} ${memory.summary} ${memory.location} ${memory.bhoomi_mood} ${memory.bhoomi_story} ${memory.bhoomi_favourite} ${memory.arjun_mood} ${memory.arjun_story} ${memory.arjun_favourite}`.toLowerCase();

        return text.includes(search.toLowerCase());

      });

    }

    if (sort === "Oldest") {

      data.reverse();

    }

    return data;

  }, [memories, search, sort]);

  return (

    <ScrapbookLayout>

      <section className="paper-stage">

        <header className="page-head">

          <div>

            <div className="page-kicker">

              Memories 📖

            </div>

            <h1 className="page-title">

              Every page tells a story.

            </h1>

            <p className="page-subtitle">

              Tiny moments become lifelong memories.

            </p>

          </div>

          <Link

            className="notebook-button"

            to="/add-memory"

          >

            📖 New Page

          </Link>

        </header>

        <div className="field-grid">

          <input

            className="paper-field"

            placeholder="Search memories..."

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

          />

          <select

            className="paper-select"

            value={sort}

            onChange={(e)=>setSort(e.target.value)}

          >

            <option>Newest</option>

            <option>Oldest</option>

          </select>

        </div>

        <div className="view-tabs">

          <button

            className={!galleryView ? "active" : ""}

            onClick={()=>setGalleryView(false)}

          >

            📖 Memories

          </button>

          <button

            className={galleryView ? "active" : ""}

            onClick={()=>setGalleryView(true)}

          >

            📷 Gallery

          </button>

        </div>
                {loading ? (

          <section className="scrap-card">

            <h2>Loading memories...</h2>

          </section>

        ) : filteredMemories.length === 0 ? (

          <section className="scrap-card">

            <h2>No memories yet ❤️</h2>

            <p style={{marginTop:10}}>
              Start filling your scrapbook by creating your first page.
            </p>

            <Link
              className="notebook-button"
              style={{marginTop:20}}
              to="/add-memory"
            >
              📖 Create First Memory
            </Link>

          </section>

        ) : galleryView ? (

          <div className="scrap-grid">

            {filteredMemories.map((memory)=>(

              <Link

                key={memory.id}

                to={`/memory/${memory.id}`}

                className="scrap-card"

                style={{
                  textDecoration:"none"
                }}

              >

                <div
                  style={{
                    height:180,
                    borderRadius:8,
                    background:"#eadfce",
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    fontSize:60
                  }}
                >

                  📷

                </div>

                <h3 style={{marginTop:15}}>
                  {memory.title}
                </h3>

                <p>
                  {memory.location || "Unknown location"}
                </p>

              </Link>

            ))}

          </div>

        ) : (

          <div className="scrap-grid">

            {filteredMemories.map((memory)=>(

              <article

                key={memory.id}

                className="scrap-card"

              >

                <div className="tag-row">

                  <span className="tag">

                    📅 {memory.chapter_date || "Unknown"}

                  </span>

                  <span className="tag">

                    😊 {memory.bhoomi_mood || memory.arjun_mood || "No Mood"}

                  </span>

                </div>

                <h2>

                  {memory.title}

                </h2>

                <p style={{marginTop:10}}>

                  {memory.summary}

                </p>

                <div
                  className="meta-list"
                  style={{marginTop:15}}
                >

                  <div>

                    <span>Location</span>

                    <br/>

                    {memory.location || "-"}

                  </div>

                  <div>

                    <span>Created</span>

                    <br/>

                    {memory.created_at}

                  </div>

                </div>

                <div
                  className="tag-row"
                  style={{marginTop:20}}
                >

                  <Link

                    className="tag"

                    to={`/memory/${memory.id}`}

                  >

                    📖 Open

                  </Link>

                  <Link

                    className="tag"

                    to={`/edit-memory/${memory.id}`}

                  >

                    ✏ Edit

                  </Link>

                  <button

                    className="tag"

                    onClick={()=>deleteMemory(memory.id)}

                  >

                    🗑 Delete

                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </ScrapbookLayout>

  );

}
