import React from "react";

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}) {
  let base =
    "inline-flex items-center justify-center rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400";
  let variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline:
      "border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-50",
    ghost: "bg-transparent text-blue-500 hover:bg-blue-100",
  };
  let sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  return (
    <button
      className={`${base} ${variants[variant] || ""} ${
        sizes[size] || ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
