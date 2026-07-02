import ScrapbookLayout from "../components/ScrapbookLayout";

export default function Settings() {
  return (
    <ScrapbookLayout>
      <section className="paper-stage">
        <header className="page-head">
          <div>
            <div className="page-kicker">Settings</div>
            <h1 className="page-title">Notebook tools for later</h1>
            <p className="page-subtitle">
              Theme, fonts, backup, import, export, profile, AI settings, reminders, birthdays, anniversaries, and PDF export all belong here when the backend is connected.
            </p>
          </div>
        </header>

        <div className="scrap-grid">
          {[
            ["Theme", "Vintage paper, warm ink, and future font choices."],
            ["Backup", "Export notebook data, import it again, or download a PDF."],
            ["AI settings", "Control captions, memory writing style, search assistant, and suggestion cache."],
            ["Notifications", "Upcoming goals, anniversaries, travel reminders, and incomplete plans."],
            ["Profile", "Names, important dates, favorite places, and personal defaults."],
            ["Database future", "Users, bucket items, memories, tags, images, favorites, AI cache, settings, and notifications."],
          ].map(([title, text]) => (
            <section className="scrap-card" key={title}>
              <h2>{title}</h2>
              <p style={{ marginTop: 8 }}>{text}</p>
            </section>
          ))}
        </div>
      </section>
    </ScrapbookLayout>
  );
}
