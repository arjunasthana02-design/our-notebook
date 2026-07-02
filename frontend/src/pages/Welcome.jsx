import { useNavigate } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="welcome-page">
      <section className="letter-paper" aria-label="Welcome letter">
        <div className="letter-text">
          <p>Hi Bhoomi,</p>
          <p>This isn't just a website.</p>
          <p>It's a little notebook I wanted to keep updating every time we make a memory together.</p>
          <p>Hopefully one day we'll look back at all these pages and smile.</p>
          <p>And hopefully, by the time this notebook is full...</p>
          <p>...you'll still be tolerating me. :)</p>
          <p className="letter-signature">— Arjun</p>
        </div>

        <button className="letter-continue" onClick={() => navigate("/home")}>
          Continue
        </button>
      </section>
    </main>
  );
}
