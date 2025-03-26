type InputFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
};

const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
  placeholder,
}: InputFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default InputField;
