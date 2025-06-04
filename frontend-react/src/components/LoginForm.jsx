import React from "react";

const LoginForm = () => {
  return (
    <form>
      <input type="email" placeholder="Email" required />
      <br />
      <input type="password" placeholder="Password" required />
      <br />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
