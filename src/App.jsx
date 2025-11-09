import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Registration from './Registration';
import QueueStatus from './QueueStatus';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/qstatus" element={<QueueStatus />} />
      </Routes>
    </Router>
  );
}

export default App;
