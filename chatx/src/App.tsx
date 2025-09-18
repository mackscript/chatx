import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import RoomPage from "./components/RoomPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
import "./styles/themes.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:roomId" element={<RoomPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
