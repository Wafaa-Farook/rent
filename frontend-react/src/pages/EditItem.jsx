import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/Item.module.css";

export default function EditItem() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return setError("Unauthorized");

    const decoded = jwtDecode(token);
    const ownerId = decoded?.id;

    fetch(`http://localhost:5000/api/items/owner/${ownerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.items) return setError("No items found");
        const item = json.items.find((i) => i.id === parseInt(id));
        if (!item) return navigate("/owner-dashboard");
        setForm(item);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching item");
      });
  }, [id, token, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) return setError(json.message || "Update failed");
      navigate("/owner-dashboard");
    } catch (err) {
      console.error(err);
      setError("Error updating item");
    }
  };

  if (error) return <p className={styles.errorMessage}>{error}</p>;
  if (!form) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Edit Item</h2>

      {["Name", "Description", "Image_url", "Rent_per_day"].map((field) => (
        <div key={field} className={styles.formGroup}>
          <label>{field.replace("_", " ")}</label>
          <input
            type={field === "rent_per_day" ? "number" : "text"}
            name={field}
            value={form[field]}
            onChange={handleChange}
            required
          />
        </div>
      ))}

      <div className={styles.formGroup}>
        <label>Availability</label>
        <select
          name="availability"
          value={form.availability ? "true" : "false"}
          onChange={(e) =>
            setForm({ ...form, availability: e.target.value === "true" })
          }
        >
          <option value="true">Available</option>
          <option value="false">Rented</option>
        </select>
      </div>

      <button type="submit" className={styles.submitButton}>
        Update Item
      </button>
    </form>
  );
}
