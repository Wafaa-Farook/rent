// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from "react";
import styles from "../styles/Dash.module.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  let decoded;
  try {
    decoded = token ? jwtDecode(token) : null;
  } catch {
    decoded = null;
  }
  const ownerId = decoded?.id;
  const userName = decoded?.name || decoded?.email || "User";

  const fetchItems = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/items/owner/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error");
      setItems(json.items);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (ownerId) fetchItems();
  }, [ownerId]);

  const removeItem = async (id) => {
    if (!window.confirm("Delete?")) return;
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className={`${styles.container} ${styles.ownerBackground}`}>
      <h1 className={styles.ownerHeading}>Welcome, {userName}!</h1>
      <button onClick={() => navigate(`/add-item`)} className={styles.btn}>+ Add New Item</button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className={styles.card}>
        <h2>My Properties</h2>
        {items.length === 0 ? <p>No items yet.</p> : (
          <div className={styles.itemsGrid}>
            {items.map(item => (
              <div key={item.id} className={styles.itemBox}>
                <img src={item.image_url} alt={item.name} className={styles.itemImage} />
                <h4>{item.name}</h4>
                <p>₹{item.rent_per_day}/day</p>
                <p>Status: {item.availability ? "Available" : "Rented"}</p>
                <div className={styles.itemButtons}>
                  <button onClick={() => navigate(`/edit-item/${item.id}`)}>Edit</button>
                  <button onClick={() => removeItem(item.id)} style={{ color: "red" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
