import HTMLFlipBook from "react-pageflip";
import "./../styles/notebook.css";

function Notebook({ children }) {
  return (
    <div className="notebook-container">
      <HTMLFlipBook
        width={700}
        height={900}
        size="stretch"
        minWidth={350}
        maxWidth={900}
        minHeight={500}
        maxHeight={1200}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="flipbook"
      >
        {children}
      </HTMLFlipBook>
    </div>
  );
}

export default Notebook;