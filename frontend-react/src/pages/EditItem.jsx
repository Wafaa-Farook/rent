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
        setForm({ ...item, imageFile: null }); // Add imageFile to state
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching item");
      });
  }, [id, token, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let updatedImageUrl = form.image_url;

      if (form.imageFile) {
        updatedImageUrl = await handleImageUpload(form.imageFile);
      }

      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          image_url: updatedImageUrl,
          imageFile: undefined, // Don't send the file in request
        }),
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

      <div className={styles.formGroup}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Rent per Day (₹)</label>
        <input
          type="number"
          name="rent_per_day"
          value={form.rent_per_day}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Current Image</label>
        <img
          src={form.image_url}
          alt="Current"
          style={{ maxWidth: "200px", display: "block", marginBottom: "8px" }}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Update Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, imageFile: e.target.files[0] }))
          }
        />
      </div>

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
