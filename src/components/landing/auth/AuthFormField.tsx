
import { useState, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface AuthFormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  icon?: ReactNode
}

export const AuthFormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  icon
}: AuthFormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        
        <Input
          id={id}
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${icon ? 'pl-10' : ''} h-11 text-base border-gray-300 focus:border-gray-400 focus:ring-gray-400`}
        />
        
        {type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
            <span className="sr-only">
              {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
