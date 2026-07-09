import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ScrapbookLayout from "../components/ScrapbookLayout";
import { apiUrl, mediaUrl } from "../services/api";
import "./NotebookExtras.css";

export default function PhotoWall() {
  const [memories, setMemories] = useState([]);
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    const response = await fetch(apiUrl("/photo-wall"));
    const data = await response.json();
    setMemories(Array.isArray(data) ? data : []);
  }

  async function uploadMedia(memoryId, files) {
    if (!files.length) return;
    setUploadingFor(memoryId);

    for (const file of files) {
      const form = new FormData();
      const isVideo = file.type.startsWith("video/");
      form.append(isVideo ? "video" : "photo", file);
      await fetch(apiUrl(`/${isVideo ? "upload-video" : "upload-photo"}/${memoryId}`), {
        method: "POST",
        body: form
      });
    }

    await loadMemories();
    setUploadingFor(null);
  }

  const mediaItems = useMemo(
    () =>
      memories.flatMap((memory) => [
        ...(memory.photos || []).map((src) => ({ type: "photo", src, memory })),
        ...(memory.videos || []).map((src) => ({ type: "video", src, memory }))
      ]),
    [memories]
  );

  return (
    <ScrapbookLayout>
      <section className="paper-stage">
        <header className="page-head">
          <div>
            <div className="page-kicker">Photo Wall</div>
            <h1 className="page-title">Every little frame of us.</h1>
            <p className="page-subtitle">A scrapbook wall for photos and videos from every memory.</p>
          </div>
          <Link className="notebook-button secondary" to="/chapters">
            Memories
          </Link>
        </header>

        <div className="wall-grid">
          {mediaItems.map((item) => (
            <article className="wall-piece" key={`${item.memory.id}-${item.src}`}>
              {item.type === "photo" ? (
                <img src={mediaUrl(item.src)} alt={item.memory.title} />
              ) : (
                <video src={mediaUrl(item.src)} controls />
              )}
              <p>{item.memory.title}</p>
            </article>
          ))}
        </div>

        {mediaItems.length === 0 && (
          <section className="scrap-card empty-state">
            <h2>No media yet</h2>
            <p>Add photos or videos to a memory and they will appear here.</p>
          </section>
        )}

        <div className="upload-memory-list">
          {memories.map((memory) => (
            <label className="upload-strip" key={memory.id}>
              <span>{memory.title}</span>
              <strong>{uploadingFor === memory.id ? "Uploading..." : "Upload more media"}</strong>
              <input
                hidden
                multiple
                type="file"
                accept="image/*,video/*"
                onChange={(e) => uploadMedia(memory.id, Array.from(e.target.files || []))}
              />
            </label>
          ))}
        </div>
      </section>
    </ScrapbookLayout>
  );
}
