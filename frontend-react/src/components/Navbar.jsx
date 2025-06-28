import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Navbar.module.css"; // assuming you have this

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear(); // or remove only token and role
    navigate("/"); // go to home page
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Rentro</Link>
      </div>

      <ul className={styles.navLinks}>
        {token ? (
          <li>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </li>
        ) : (
          <>
            <li><Link to="/signup">SignUp</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
