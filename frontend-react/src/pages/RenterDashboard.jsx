import React, { useEffect, useState } from "react";
import styles from "../styles/Dash.module.css";
import { jwtDecode } from "jwt-decode";

export default function RenterDashboard() {
  const token = localStorage.getItem("token");
  const [rentalHistory, setRentalHistory] = useState([]);
  const [error, setError] = useState("");
  const [availableItems, setAvailableItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [dates, setDates] = useState({});
  const [requestedItems, setRequestedItems] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

const toggleSection = (sectionName) => {
  setExpandedSection(prev => (prev === sectionName ? null : sectionName));
};


  


  let userName = "User";
  let renterId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userName = decoded.name || decoded.email || "User";
      renterId = decoded.id;
    } catch (error) {
      console.error("Error decoding token", error);
    }
  }
  useEffect(() => {
  if (!renterId || !token) return;

  const fetchRentalHistory = async () => {
    try {
      const res = await fetch(`http://rentro-backend-0gnk.onrender.com/api/renter/history/${renterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRentalHistory(data.rentals);
    } catch (err) {
      console.error("Rental history error:", err);
      setError("Could not load rental history.");
    }
  };

  fetchRentalHistory();
}, [renterId, token]);

  // Fetch rental history
  useEffect(() => {
  if (!renterId) return;

  const fetchAvailableItems = async () => {
    try {
      const res = await fetch("http://rentro-backend-0gnk.onrender.com/api/renter/available");
      const data = await res.json();
      setAvailableItems(data.items);
    } catch (err) {
      console.error("Error loading available items", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://rentro-backend-0gnk.onrender.com/api/renter/requests/${renterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMyRequests(data.requests);
    } catch (err) {
      console.error("Error loading requests", err);
    }
  };

  fetchAvailableItems();
  fetchRequests();
}, [renterId, token]);

const handleRequest = async (itemId) => {
  const startDate = dates[itemId]?.start;
  const endDate = dates[itemId]?.end;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  if (requestedItems.includes(itemId)) {
    alert("Request already sent for this item.");
    return;
  }

  try {
    const res = await fetch("http://rentro-backend-0gnk.onrender.com/api/renter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        item_id: itemId,
        rent_start_date: startDate,
        rent_end_date: endDate,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error requesting rent");

    setRequestedItems((prev) => [...prev, itemId]); // 👈 track item
    alert("Request sent successfully!");
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to send request: " + err.message);
  }
};



  return (
   <div className={`${styles.container} ${styles.renterBackground}`}>
  <h1 className={styles.ownerHeading}>Welcome, {userName}!</h1>
  <p>Browse available properties, submit rental requests, and track rental history.</p>

  {/* SECTION: Available Properties */}
  <div className={styles.card}>
    <h2 onClick={() => toggleSection("available")} className={styles.sectionHeader}>
       Available Properties
    </h2>
    {expandedSection === "available" && (
      <>
        {Array.isArray(availableItems) && availableItems.length === 0 ? (
          <p>No available properties right now.</p>
        ) : (
          <div className={styles.itemsList}>
            {availableItems.map(item => (
              <div key={item.id} className={styles.itemRow}>
              <img
                src={item.image_url}
                alt={item.name}
                className={styles.itemImage}
              />

              <div className={styles.itemDetails}>
                <h4>{item.name}</h4>
                <p>₹{item.rent_per_day}/day</p>
                <p>{item.description}</p>
              </div>

              <div className={styles.requestSection}>
                <div className={styles.dateContainer}>
                  <div className={styles.dateGroup}>
                    <label>Start</label>
                    <input
                      type="date"
                      value={dates[item.id]?.start || ""}
                      onChange={(e) =>
                        setDates((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], start: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.dateGroup}>
                    <label>End</label>
                    <input
                      type="date"
                      value={dates[item.id]?.end || ""}
                      onChange={(e) =>
                        setDates((prev) => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], end: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <button
                  className={styles.requestButton}
                  onClick={() => handleRequest(item.id)}
                >
                  Request Rent
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>

  {/* SECTION: My Rental Requests */}
  <div className={styles.card}>
  <h2 onClick={() => toggleSection("requests")} className={styles.sectionHeader}>
    My Rental Requests
  </h2>

  {expandedSection === "requests" && (
    <>
      {!myRequests ? (
        <p>Loading...</p>
      ) : myRequests.length === 0 ? (
        <p>You haven’t made any rental requests.</p>
      ) : (
        <div className={styles.requestGrid}>
          {myRequests.map((req) => (
            <div key={req.id} className={styles.requestCard}>
              <h4>{req.item_name}</h4>
              <p>
                <strong>From:</strong>{" "}
                {req.rent_start_date ? new Date(req.rent_start_date).toLocaleDateString("en-CA") : "Invalid date"}
                {" → "}
                {req.rent_end_date ? new Date(req.rent_end_date).toLocaleDateString("en-CA") : "Invalid date"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={styles[`status${req.request_status}`]}>
                  {req.request_status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )}
</div>


  {/* SECTION: Rental History */}
  <div className={styles.card}>
    <h2 onClick={() => toggleSection("history")} className={styles.sectionHeader}>
       Rental History
    </h2>
    {expandedSection === "history" && (
      <>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {rentalHistory.length === 0 ? (
          <p>You haven’t rented any items yet.</p>
        ) : (
          <ul>
            {rentalHistory.map(r => (
              <li key={r.id}>
                <strong>{r.item_name}</strong><br />
                {r.rent_start_date ? new Date(r.rent_start_date).toLocaleDateString("en-CA") : "Invalid date"} →
                {r.rent_end_date ? new Date(r.rent_end_date).toLocaleDateString("en-CA") : "Invalid date"}
                <br />
                <p>
                  Status:
                  <span className={
                    r.dynamic_status === "approved" ? styles.statusApproved :
                    r.dynamic_status === "pending" ? styles.statusPending :
                    r.dynamic_status === "rejected" ? styles.statusRejected :
                    r.dynamic_status === "completed" ? styles.statusCompleted : ""
                  }>
                    {r.dynamic_status}
                  </span>
                  {" "} | Payment:
                  <span className={r.payment_status === "paid" ? styles.paymentPaid : styles.paymentPending}>
                    {r.payment_status || "N/A"}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </>
    )}
  </div>
</div>

  );
}
