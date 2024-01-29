import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export interface PasswordProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PasswordInput(props: PasswordProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        required
        {...props}
      />
      <div
        className="absolute inset-y-0 right-0 flex items-center pr-3"
        onClick={() => {
          setShowPassword(!showPassword);
        }}
      >
        {showPassword ? (
          <EyeSlashIcon className="h-4/6" />
        ) : (
          <EyeIcon className="h-4/6" />
        )}
      </div>
    </div>
  );
}
