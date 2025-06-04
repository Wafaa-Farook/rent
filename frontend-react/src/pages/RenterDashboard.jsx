import React from "react";
import styles from "../styles/Dash.module.css";
import { jwtDecode } from "jwt-decode";



export default function RenterDashboard() {
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
    <div className={`${styles.container} ${styles.renterBackground}`}>
      <h1 className={styles.ownerHeading}>Welcome, {userName}!</h1>
      <p>Welcome, {userName} Here you can browse available properties, submit rental requests, and manage your bookings.</p>

      <div className={styles.card}>
        <h2>Available Properties</h2>
        <p>Browse all properties available for rent.</p>
      </div>

      <div className={styles.card}>
        <h2>My Rental Requests</h2>
        <p>Track the status of your rental requests.</p>
      </div>

      <div className={styles.card}>
        <h2>Profile Settings</h2>
        <p>Update your personal information and preferences.</p>
      </div>
    </div>
  );
}
