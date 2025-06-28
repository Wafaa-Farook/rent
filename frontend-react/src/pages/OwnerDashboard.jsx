import React, { useEffect, useState } from "react";
import styles from "../styles/Dash.module.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [rentals, setRentals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const navigate = useNavigate();

  const toggleSection = (sectionName) => {
    setExpandedSection(prev => (prev === sectionName ? null : sectionName));
  };

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
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete item.");
    }
  };

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rentals/owner/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRentals(data.rentals);
      } catch (err) {
        console.error("Error fetching rental requests", err);
      }
    };

    if (token) fetchRentals();
  }, [token, ownerId]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/analytics/owner/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics", err);
      }
    };

    if (token) fetchAnalytics();
  }, [token, ownerId]);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`http://rentro-backend-0gnk.onrender.com/api/rentals/owner/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRentalRequests(data.rentals);
    } catch (err) {
      console.error("Error fetching rental requests", err);
    }
  };

  useEffect(() => {
    if (token && ownerId) fetchPendingRequests();
  }, [token, ownerId]);

  const handleApproval = async (id, action) => {
    try {
      const res = await fetch(`http://rentro-backend-0gnk.onrender.com/api/rentals/${action}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(`Request ${action}d successfully`);
      fetchPendingRequests();
    } catch (err) {
      alert("Failed to update request");
    }
  };

  const handleMarkAsPaid = async (rentalId) => {
    try {
      const res = await fetch(`http://rentro-backend-0gnk.onrender.com/api/rentals/${rentalId}/mark-paid`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Marked as paid successfully!");
      await fetchPendingRequests();
    } catch (err) {
      alert("Failed to mark as paid");
    }
  };

  return (
    <div className={`${styles.container} ${styles.ownerBackground}`}>
      <h1 className={styles.ownerHeading}>Welcome, {userName}!</h1>
      <p>Add properties, handle rental requests, and view rental history.</p>
      <button onClick={() => navigate(`/add-item`)} className={styles.addButton}>Add New Item</button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* My Properties Section */}
      <div className={styles.card}>
        <h2 onClick={() => toggleSection("properties")} className={styles.sectionHeader}>
           My Properties
        </h2>
        {expandedSection === "properties" && (
          <>
            {items.length === 0 ? <p>No items yet.</p> : (
              <div className={styles.itemsList}>
                {items.map(item => (
                  <div key={item.id} className={styles.itemRow}>
                      <img src={item.image_url} alt={item.name} className={styles.itemImage} />
  
                      <div className={styles.itemDetails}>
                        <h4>{item.name}</h4>
                        <p>₹{item.rent_per_day}/day</p>
                        <p>Status: {item.availability ? "Available" : "Rented"}</p>
                      </div>

                      <div className={styles.itemButtons}>
                        <button onClick={() => navigate(`/edit-item/${item.id}`)}>Edit</button>
                        <button onClick={() => removeItem(item.id)} style={{ color: "red" }}>Delete</button>
                      </div>
                    </div>

                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rental Requests Section */}
      <div className={styles.card}>
        <h2 onClick={() => toggleSection("requests")} className={styles.sectionHeader}>
           Rental Requests
        </h2>
        {expandedSection === "requests" && (
          <>
            {rentalRequests.length === 0 ? (
              <p>No pending requests</p>
            ) : (
              <div className={styles.requestsGrid}>
  {rentalRequests.map((r) => (
    <div key={r.id} className={styles.requestCard}>
      <p>
        <strong>{r.item_name}</strong> requested by {r.renter_name} ({r.renter_email})
      </p>
      <p>
        From: {new Date(r.rent_start_date).toLocaleDateString("en-CA")} →
        {new Date(r.rent_end_date).toLocaleDateString("en-CA")}
      </p>
      <p>Status:
        <strong style={{ marginLeft: "5px" }}>
          {r.request_status}
        </strong>
      </p>
      <p>Payment:
        <strong style={{ marginLeft: "5px", color: r.payment_status === "paid" ? "green" : "orange" }}>
          {r.payment_status === "paid" ? "Paid" : "Pending"}
        </strong>
      </p>

      {r.request_status === "pending" && (
        <>
          <button onClick={() => handleApproval(r.id, "approve")}>Approve</button>
          <button onClick={() => handleApproval(r.id, "reject")} style={{ color: "red" }}>Reject</button>
        </>
      )}

      {r.request_status === "approved" && r.payment_status !== "paid" && (
        <button onClick={() => handleMarkAsPaid(r.id)} style={{ marginTop: "8px" }}>
          Mark as Paid
        </button>
      )}
    </div>
  ))}
</div>

            )}
          </>
        )}
      </div>

      {/* Analytics Section */}
      <div className={styles.card}>
        <h2 onClick={() => toggleSection("analytics")} className={styles.sectionHeader}>
           Analytics
        </h2>
        {expandedSection === "analytics" && analytics && (
          <>
            <p>Total Items: {analytics.total_items}</p>
            <p>Available Items: {analytics.available_items}</p>
            <p>Total Rentals: {analytics.total_rentals}</p>
          </>
        )}
      </div>
    </div>
  );
}
