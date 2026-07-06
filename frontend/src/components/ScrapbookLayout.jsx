import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/scrapbook.css";

export default function ScrapbookLayout({
  children,
  label = "Bhoomi & Arjun's Notebook",
}) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("notebook-theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("notebook-dark", darkMode);
    localStorage.setItem("notebook-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <main className="scrapbook-shell">

      <nav className="scrapbook-nav">

        <Link
          to="/home"
          className="scrapbook-brand"
        >
          📖 {label}
        </Link>

        <div className="scrapbook-links">

          <Link
            to="/welcome"
            className={`scrapbook-link ${
              location.pathname === "/welcome" ? "active-link" : ""
            }`}
          >
            Letter
          </Link>

          <Link
            to="/home"
            className={`scrapbook-link ${
              location.pathname === "/home" ? "active-link" : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/planner"
            className={`scrapbook-link ${
              location.pathname === "/planner" ? "active-link" : ""
            }`}
          >
            Bucket List
          </Link>

          <Link
            to="/timeline"
            className={`scrapbook-link ${
              location.pathname === "/timeline" ? "active-link" : ""
            }`}
          >
            Timeline
          </Link>

          <Link
            to="/photo-wall"
            className={`scrapbook-link ${
              location.pathname === "/photo-wall" ? "active-link" : ""
            }`}
          >
            Photo Wall
          </Link>

          <Link
            to="/open-when"
            className={`scrapbook-link ${
              location.pathname === "/open-when" ? "active-link" : ""
            }`}
          >
            Open When...
          </Link>

          <Link
            to="/birthday"
            className={`scrapbook-link ${
              location.pathname === "/birthday" ? "active-link" : ""
            }`}
          >
            Birthday
          </Link>

          <Link
            to="/playlist"
            className={`scrapbook-link ${
              location.pathname === "/playlist" ? "active-link" : ""
            }`}
          >
            Our Playlist
          </Link>

          <Link
            to="/chapters"
            className={`scrapbook-link ${
              location.pathname === "/chapters" ? "active-link" : ""
            }`}
          >
            Memories
          </Link>

          <Link
            to="/settings"
            className={`scrapbook-link ${
              location.pathname === "/settings" ? "active-link" : ""
            }`}
          >
            Settings
          </Link>

          <button
            className="theme-switch"
            type="button"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? "Dark" : "Light"}
          </button>

        </div>

      </nav>

      {children}

    </main>
  );
}
