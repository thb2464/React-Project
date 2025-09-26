import React from "react";

export const Button = ({ label, onClick }) => (
  <button
    style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
    onClick={onClick}
  >
    {label}
  </button>
);
