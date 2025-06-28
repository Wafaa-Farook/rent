import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Rentro</h1>
      <p className={styles.subtitle}>Your platform to rent and earn.</p>
      <div className={styles.links}>
        <Link to="/signup" className={styles.link}>SignUp</Link>
        <span className={styles.separator}> | </span>
        <Link to="/login" className={styles.link}>Login</Link>
      </div>
    </div>
  );
};

export default Home;
