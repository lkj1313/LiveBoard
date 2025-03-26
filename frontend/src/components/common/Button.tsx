import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "success";
};

const Button = ({
  children,
  type = "button",
  disabled = false,
  className = "",
  variant,
  ...rest // 🔥 나머지 props (title 등) 받기
}: ButtonProps) => {
  const base = "py-2 rounded-lg transition cursor-pointer font-medium";

  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variant && variants[variant]}} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      {...rest} // ✅ title, name, aria-label 등 전달
    >
      {children}
    </button>
  );
};

export default Button;
