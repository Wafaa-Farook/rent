import React from "react";
import styles from "../styles/Dash.module.css";
import { jwtDecode } from "jwt-decode";



export default function OwnerDashboard() {
 const token = localStorage.getItem("token");
  let userName = "User";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userName = decoded.name || decoded.email || "User";
    } catch (error) {
      console.error("Error decoding token", error);
    }
  }
  return (
    <div className={`${styles.container} ${styles.ownerBackground}`}>
       <h1 className={styles.ownerHeading}>Welcome, {userName}!</h1>
      <p>Welcome, {userName}! Here you can manage your properties, view rental requests, and update your profile.</p>

      <div className={styles.card}>
        <h2>My Properties</h2>
        <p>List of properties you own will appear here.</p>
      </div>

      <div className={styles.card}>
        <h2>Rental Requests</h2>
        <p>View and manage requests from renters.</p>
      </div>

      <div className={styles.card}>
        <h2>Profile Settings</h2>
        <p>Update your personal and contact details.</p>
      </div>
    </div>
  );
}
