import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import RoomPage from "./components/RoomPage";
import Footer from "./components/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
import "./styles/themes.css";

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:roomId" element={<RoomPage />} />
        </Routes>
      </div>
      {isHomePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
