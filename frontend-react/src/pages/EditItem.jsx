// src/pages/EditItem.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.items) {
          setError("No items found");
          return;
        }
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
      if (!res.ok) {
        return setError(json.message || "Update failed");
      }
      navigate("/owner-dashboard");
    } catch (err) {
      console.error(err);
      setError("Error updating item");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!form) return <p>Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}
    >
      <h2>Edit Item</h2>
      {["name", "description", "image_url", "rent_per_day"].map((f) => (
        <div key={f} style={{ marginBottom: "12px" }}>
          <label>{f.replace("_", " ")}</label>
          <br />
          <input
            type={f === "rent_per_day" ? "number" : "text"}
            name={f}
            value={form[f]}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
      ))}
      <div style={{ marginBottom: "12px" }}>
        <label>Availability</label>
        <select
          name="availability"
          value={form.availability ? "true" : "false"}
          onChange={(e) =>
            setForm({ ...form, availability: e.target.value === "true" })
          }
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="true">Available</option>
          <option value="false">Rented</option>
        </select>
      </div>
      <button type="submit" style={{ padding: "10px 20px" }}>
        Update Item
      </button>
    </form>
  );
}
