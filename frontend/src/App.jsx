import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Cover from "./pages/Cover";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Chapters from "./pages/Chapters";
import Memory from "./pages/Memory";
import AddMemory from "./pages/AddMemory";
import Timeline from "./pages/Timeline";
import PhotoWall from "./pages/PhotoWall";
import OpenWhen from "./pages/OpenWhen";
import Birthday from "./pages/Birthday";
import Playlist from "./pages/Playlist";
import Settings from "./pages/Settings";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Notebook */}

        <Route path="/cover" element={<Cover />} />

        <Route path="/welcome" element={<Welcome />} />

        <Route path="/home" element={<Home />} />

        <Route path="/planner" element={<Planner />} />

        <Route path="/chapters" element={<Chapters />} />

        <Route path="/memory/:id" element={<Memory />} />

        <Route path="/add-memory" element={<AddMemory />} />

        <Route path="/edit-memory/:id" element={<AddMemory />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/photo-wall" element={<PhotoWall />} />
        <Route path="/open-when" element={<OpenWhen />} />
        <Route path="/birthday" element={<Birthday />} />
        <Route path="/playlist" element={<Playlist />} />

        <Route path="/settings" element={<Settings />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
