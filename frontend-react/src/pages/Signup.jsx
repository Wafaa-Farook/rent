import React, { useState } from "react";
import styles from "../styles/Auth.module.css"; // ✅ Scoped styles

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "renter",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email";
    if (formData.password.length < 6) newErrors.password = "Password too short";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("http://rentro-backend-0gnk.onrender.com/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Signup successful!");
          localStorage.setItem("token", data.token);
          window.location.href = "/login";
        } else {
          alert(data.message || "Signup failed");
        }
      } catch (error) {
        console.error("Error submitting signup:", error);
        alert("Something went wrong");
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Create Your Account</h2>

        <label className={styles.label}>Name</label>
        <input
          name="name"
          className={styles.input}
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}

        <label className={styles.label}>Email</label>
        <input
          name="email"
          type="email"
          className={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}

        <label className={styles.label}>Password</label>
        <input
          name="password"
          type="password"
          className={styles.input}
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}

        <label className={styles.label}>Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          className={styles.input}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword}</p>
        )}

        <label className={styles.label}>Role</label>
        <select
          name="role"
          className={styles.input}
          value={formData.role}
          onChange={handleChange}
        >
          <option value="owner">Owner</option>
          <option value="renter">Renter</option>
        </select>

        <button type="submit" className={styles.button}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
