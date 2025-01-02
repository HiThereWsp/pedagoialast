import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthFormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export const AuthFormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true
}: AuthFormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}