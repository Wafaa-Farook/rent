// src/pages/AddItem.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AddItem() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const decoded = token ? jwtDecode(token) : {};
  const ownerId = decoded.id;

  const [form, setForm] = useState({ name:"", description:"", image_url:"", rent_per_day:"" });
  const [error, setError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/items/owner/${ownerId}`, {
      method: "POST",
      headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) return setError(json.message);
    navigate("/owner-dashboard");
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Add New Item</h2>
      {error && <p style={{color:"red"}}>{error}</p>}
      {["name","description","image_url","rent_per_day"].map(f => (
        <div key={f}>
          <label>{f.replace("_"," ")}</label><br/>
          <input name={f} value={form[f]} onChange={handleChange} required />
        </div>
      ))}
      <button type="submit">Add Item</button>
    </form>
  );
}
