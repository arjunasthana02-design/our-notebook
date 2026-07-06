import { useEffect, useMemo, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

function getNextBirthday(now) {
  const year = now.getMonth() > 2 || (now.getMonth() === 2 && now.getDate() > 9)
    ? now.getFullYear() + 1
    : now.getFullYear();
  return new Date(year, 2, 9, 0, 0, 0);
}

function getCountdown() {
  const now = new Date();
  const target = getNextBirthday(now);
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    target
  };
}

export default function Birthday() {
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  const monthsLeft = useMemo(() => {
    const now = new Date();
    const birthday = getNextBirthday(now);
    let months = (birthday.getFullYear() - now.getFullYear()) * 12 + birthday.getMonth() - now.getMonth();
    if (now.getDate() > 9) months -= 1;
    return Math.max(0, months);
  }, [countdown.target]);

  return (
    <ScrapbookLayout>
      <section className="birthday-page">
        <div className="birthday-paper">
          <div className="birthday-confetti" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="flower-corner flower-corner-left" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="flower-corner flower-corner-right" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="page-kicker">Birthday</p>
          <h1>Bhoomi's Birthday</h1>
          <p className="birthday-date">9 March</p>
          <div className="countdown-grid">
            {["days", "hours", "minutes", "seconds"].map((unit) => (
              <div className="countdown-tile" key={unit}>
                <strong>{countdown[unit]}</strong>
                <span>{unit}</span>
              </div>
            ))}
          </div>
          <p className="birthday-months">
            {monthsLeft} months left until Bhoomi's birthday
          </p>
        </div>
      </section>
    </ScrapbookLayout>
  );
}
