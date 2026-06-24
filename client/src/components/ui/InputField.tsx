import { forwardRef, type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-brand-text-sub mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full py-3 px-2.5 border-b border-brand-border bg-transparent outline-none text-brand-text-main placeholder-brand-text-sub text-sm font-normal transition-colors duration-200 focus:border-brand-primary ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
