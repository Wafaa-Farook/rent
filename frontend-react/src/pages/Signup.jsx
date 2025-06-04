import React, { useState } from "react";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "renter", // default value
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email";
    if (formData.password.length < 6) newErrors.password = "Password too short";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length === 0) {
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert("Signup successful!");
        // Optionally store token:
        localStorage.setItem("token", data.token);
        // Redirect to login page
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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label><br />
        <input name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p style={{color: "red"}}>{errors.name}</p>}
      </div>

      <div>
        <label>Email</label><br />
        <input name="email" type="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p style={{color: "red"}}>{errors.email}</p>}
      </div>

      <div>
        <label>Password</label><br />
        <input name="password" type="password" value={formData.password} onChange={handleChange} />
        {errors.password && <p style={{color: "red"}}>{errors.password}</p>}
      </div>

      <div>
        <label>Confirm Password</label><br />
        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
        {errors.confirmPassword && <p style={{color: "red"}}>{errors.confirmPassword}</p>}
      </div>

      <div>
        <label>Role</label><br />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="owner">Owner</option>
          <option value="renter">Renter</option>
        </select>
      </div>

      <button type="submit">Sign Up</button>
    </form>
  );
}
