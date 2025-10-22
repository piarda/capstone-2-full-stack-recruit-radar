import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FollowUpsPage from './pages/FollowUpsPage';
import ArchivedPage from "./pages/ArchivedPage";

function App() {
    return (
        <Router>
            <nav style={{ marginBottom: '1rem' }}>
                <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
                <Link to="/followups" style={{ marginRight: '1rem' }}>Follow-Ups</Link>
                <Link to="/archived">Archived</Link>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/followups" element={<FollowUpsPage />} />
                <Route path="/archived" element={<ArchivedPage />} />
            </Routes>
        </Router>
  );
}

export default App;
