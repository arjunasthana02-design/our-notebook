import ScrapbookLayout from "../components/ScrapbookLayout";
import "./NotebookExtras.css";

const pptFile = "/ppt/project.pdf";

export default function Ppt() {
  return (
    <ScrapbookLayout>
      <section className="paper-stage ppt-stage">
        <header className="page-head ppt-head">
          <div>
            <div className="page-kicker">PPT</div>
            <h1 className="page-title">Project presentation</h1>
            <p className="page-subtitle">
              The complete project file is saved here for quick viewing.
            </p>
          </div>

          <a className="notebook-button secondary" href={pptFile} target="_blank" rel="noreferrer">
            Open File
          </a>
        </header>

        <div className="ppt-viewer">
          <iframe title="Project presentation" src={pptFile} />
        </div>
      </section>
    </ScrapbookLayout>
  );
}
