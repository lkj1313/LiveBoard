import React, { forwardRef } from "react";

type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  accept?: string;
};

// forwardRef 적용!
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      id,
      label,
      type = "text",
      value,
      onChange,
      required = true,
      placeholder,
      className = "",
      labelClassName = "",
      accept,
    },
    ref
  ) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={className}
          accept={accept}
        />
      </div>
    );
  }
);

export default InputField;
