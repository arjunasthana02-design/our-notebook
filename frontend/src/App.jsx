import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

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
import Ppt from "./pages/Ppt";
import Settings from "./pages/Settings";
import FriendshipBands from "./pages/FriendshipBands";
import { isLoggedIn } from "./services/api";

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/" replace />;
}

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Notebook */}

        <Route path="/cover" element={<ProtectedRoute><Cover /></ProtectedRoute>} />

        <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />

        <Route path="/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />

        <Route path="/memory/:id" element={<ProtectedRoute><Memory /></ProtectedRoute>} />

        <Route path="/add-memory" element={<ProtectedRoute><AddMemory /></ProtectedRoute>} />

        <Route path="/edit-memory/:id" element={<ProtectedRoute><AddMemory /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
        <Route path="/photo-wall" element={<ProtectedRoute><PhotoWall /></ProtectedRoute>} />
        <Route path="/open-when" element={<ProtectedRoute><OpenWhen /></ProtectedRoute>} />
        <Route path="/birthday" element={<ProtectedRoute><Birthday /></ProtectedRoute>} />
        <Route path="/surprise" element={<ProtectedRoute><FriendshipBands /></ProtectedRoute>} />
        <Route path="/friendship-bands" element={<ProtectedRoute><FriendshipBands /></ProtectedRoute>} />
        <Route path="/playlist" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
        <Route path="/ppt" element={<ProtectedRoute><Ppt /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
