import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/Item.module.css";

export default function AddItem() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const decoded = token ? jwtDecode(token) : {};
  const ownerId = decoded.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    rent_per_day: "",
    imageFile: null,
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);// ✅ Replace this
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = form.image_url;
    if (form.imageFile) {
      imageUrl = await handleImageUpload(form.imageFile);
    }

    const res = await fetch(`https://rentro-backend-0gnk.onrender.com/api/items/owner/${ownerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        rent_per_day: form.rent_per_day,
        image_url: imageUrl,
      }),
    });

    const json = await res.json();
    if (!res.ok) return setError(json.message);
    navigate("/owner-dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Add New Item</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.formGroup}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div className={styles.formGroup}>
        <label>Description</label>
        <input name="description" value={form.description} onChange={handleChange} required />
      </div>

      <div className={styles.formGroup}>
        <label>Rent per Day (₹)</label>
        <input
          name="rent_per_day"
          type="number"
          value={form.rent_per_day}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm((prev) => ({ ...prev, imageFile: e.target.files[0] }))}
        />
      </div>

      <button type="submit" className={styles.submitButton}>Add Item</button>
    </form>
  );
}
