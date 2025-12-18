import { Check, X } from "lucide-react";

interface PasswordValidatorProps {
  password: string;
}

export const validatePassword = (password: string) => {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasValidLength: password.length >= 6 && password.length <= 12,
  };
};

export const isPasswordValid = (password: string) => {
  const validation = validatePassword(password);
  return (
    validation.hasUppercase &&
    validation.hasLowercase &&
    validation.hasSpecialChar &&
    validation.hasValidLength
  );
};

const PasswordValidator = ({ password }: PasswordValidatorProps) => {
  const validation = validatePassword(password);

  const rules = [
    { key: "hasUppercase", label: "At least 1 uppercase letter", valid: validation.hasUppercase },
    { key: "hasLowercase", label: "At least 1 lowercase letter", valid: validation.hasLowercase },
    { key: "hasSpecialChar", label: "At least 1 special character", valid: validation.hasSpecialChar },
    { key: "hasValidLength", label: "Length between 6 and 12 characters", valid: validation.hasValidLength },
  ];

  return (
    <div className="space-y-2 mt-2">
      {rules.map((rule) => (
        <div key={rule.key} className="flex items-center gap-2 text-sm">
          <div
            className={`w-4 h-4 rounded flex items-center justify-center ${
              rule.valid
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {rule.valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </div>
          <span className={rule.valid ? "text-success" : "text-muted-foreground"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordValidator;
