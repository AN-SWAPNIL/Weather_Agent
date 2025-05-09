import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-lg shadow bg-white dark:bg-gray-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
