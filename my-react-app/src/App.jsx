// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateOrder from './CreateOrder'; // Import your existing CreateOrder component
import CentralAdminOrderManagement from './CentralAdminOrderManagement'; // Import the new component
import './App.css'; // Import your CSS file

const App = () => {
    return (
        <Router>
            <div>
                <nav>
                    <Link to="/">Create Order</Link>
                    <Link to="/central-admin-orders">Central Admin Order Management</Link>
                </nav>
                <div className="content"> {/* Add a content wrapper */}
                    <Routes>
                        <Route path="/" element={<CreateOrder />} />
                        <Route path="/central-admin-orders" element={<CentralAdminOrderManagement />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
