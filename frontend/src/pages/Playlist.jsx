import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

const SPOTIFY_PLAYLIST_URL =
  import.meta.env.VITE_SPOTIFY_PLAYLIST_URL ||
  "https://open.spotify.com/playlist/37i9dQZF1EJxsR4OUAMJeg?si=4e9d701a48684c15";

function spotifyEmbedUrl(url) {
  const fallbackId = "37i9dQZF1EJxsR4OUAMJeg";

  try {
    const spotifyUrl = new URL(url);
    const playlistMatch = spotifyUrl.pathname.match(/\/(?:embed\/)?playlist\/([^/]+)/);
    const playlistId = playlistMatch?.[1] || fallbackId;

    return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
  } catch {
    return `https://open.spotify.com/embed/playlist/${fallbackId}?utm_source=generator`;
  }
}

const SPOTIFY_EMBED_URL = spotifyEmbedUrl(SPOTIFY_PLAYLIST_URL);

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
            src={SPOTIFY_EMBED_URL}
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
