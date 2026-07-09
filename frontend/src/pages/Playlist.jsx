import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

const SPOTIFY_PLAYLIST_URL =
  import.meta.env.VITE_SPOTIFY_PLAYLIST_URL ||
  "https://open.spotify.com/playlist/37i9dQZF1EJxsR4OUAMJeg?si=4e9d701a48684c15";

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
          <div className="spotify-card">
            <div className="spotify-mark">♪</div>
            <div>
              <h2>Our Spotify Playlist</h2>
              <p>Open the playlist directly in Spotify.</p>
            </div>
            <a
              className="notebook-button spotify-open-button"
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open Playlist
            </a>
          </div>
        </div>
      </section>
    </ScrapbookLayout>
  );
}
