import { useEffect, useMemo, useState } from "react";
import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

const BIRTHDAYS = [
  {
    name: "Bhoomi",
    dateLabel: "9 March",
    month: 2,
    day: 9
  },
  {
    name: "Arjun",
    dateLabel: "9 September",
    month: 8,
    day: 9
  }
];

function getNextBirthday(now, month, day) {
  const year = now.getMonth() > month || (now.getMonth() === month && now.getDate() > day)
    ? now.getFullYear() + 1
    : now.getFullYear();
  return new Date(year, month, day, 0, 0, 0);
}

function getCountdown(birthday) {
  const now = new Date();
  const target = getNextBirthday(now, birthday.month, birthday.day);
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    target
  };
}

function getMonthsLeft(birthday, target) {
  const now = new Date();
  let months = (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth();
  if (now.getDate() > birthday.day) months -= 1;
  return Math.max(0, months);
}

export default function Birthday() {
  const [countdowns, setCountdowns] = useState(() =>
    BIRTHDAYS.map((birthday) => ({
      ...birthday,
      countdown: getCountdown(birthday)
    }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(
        BIRTHDAYS.map((birthday) => ({
          ...birthday,
          countdown: getCountdown(birthday)
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const birthdayCards = useMemo(
    () =>
      countdowns.map((birthday) => ({
        ...birthday,
        monthsLeft: getMonthsLeft(birthday, birthday.countdown.target)
      })),
    [countdowns]
  );

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
          <h1>Our Birthdays</h1>
          {birthdayCards.map((birthday) => (
            <div className="birthday-countdown-section" key={birthday.name}>
              <h2>{birthday.name}'s Birthday</h2>
              <p className="birthday-date">{birthday.dateLabel}</p>
              <div className="countdown-grid">
                {["days", "hours", "minutes", "seconds"].map((unit) => (
                  <div className="countdown-tile" key={unit}>
                    <strong>{birthday.countdown[unit]}</strong>
                    <span>{unit}</span>
                  </div>
                ))}
              </div>
              <p className="birthday-months">
                {birthday.monthsLeft} months left until {birthday.name}'s birthday
              </p>
            </div>
          ))}
        </div>
      </section>
    </ScrapbookLayout>
  );
}
