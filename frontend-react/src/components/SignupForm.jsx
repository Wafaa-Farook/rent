import React from "react";

const SignupForm = () => {
  return (
    <form>
      <input type="text" placeholder="Name" required />
      <br />
      <input type="email" placeholder="Email" required />
      <br />
      <input type="password" placeholder="Password" required />
      <br />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;
