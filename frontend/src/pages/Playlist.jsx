import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

const SPOTIFY_PLAYLIST_URL =
  import.meta.env.VITE_SPOTIFY_PLAYLIST_URL ||
  "https://open.spotify.com/embed/playlist/37i9dQZF1EJxsR4OUAMJeg";

export default function Playlist() {
  return (
    <ScrapbookLayout>
      <section className="paper-stage">
        <header className="page-head">
          <div>
            <div className="page-kicker">Our Playlist</div>
            <h1 className="page-title">Songs tucked between pages.</h1>
            <p className="page-subtitle">A little corner for the songs that sound like us.</p>
          </div>
        </header>

        <div className="playlist-frame">
          <iframe
            title="Our Spotify Playlist"
            src={SPOTIFY_PLAYLIST_URL}
            width="100%"
            height="520"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </section>
    </ScrapbookLayout>
  );
}
