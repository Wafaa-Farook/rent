import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import RenterDashboard from "./pages/RenterDashboard";
import AddItem from "./pages/AddItem";        // ✅ Import AddItem
import EditItem from "./pages/EditItem"; 

import Navbar from "./components/Navbar";
import styles from "./styles/App.module.css";

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/renter-dashboard" element={<RenterDashboard />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
