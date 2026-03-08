import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Name is required").max(100),
  confirmPassword: z.string().min(6),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const schema = mode === "login" ? loginSchema : registerSchema;
    const result = schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        await signUp(formData.email, formData.password, formData.name);
        toast.success("Account created! Please check your email to verify.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = mode === "login"
    ? [
        { key: "email", label: "Email", type: "email" },
        { key: "password", label: "Password", type: "password" },
      ]
    : [
        { key: "name", label: "Full Name", type: "text" },
        { key: "email", label: "Email", type: "email" },
        { key: "password", label: "Password", type: "password" },
        { key: "confirmPassword", label: "Confirm Password", type: "password" },
      ];

  const getInputType = (field: { key: string; type: string }) => {
    if (field.key === "password") return showPassword ? "text" : "password";
    if (field.key === "confirmPassword") return showConfirmPassword ? "text" : "password";
    return field.type;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to your account" : "Join the Habeeb's Paradise family"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-[10px] sm:text-xs uppercase tracking-wider font-body mb-1.5 sm:mb-2 block">{field.label}</label>
              <div className="relative">
                <input
                  type={getInputType(field)}
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full border border-border bg-background px-3 sm:px-4 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-11 sm:h-12"
                />
                {(field.key === "password" || field.key === "confirmPassword") && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    onClick={() => field.key === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {(field.key === "password" ? showPassword : showConfirmPassword) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              {errors[field.key] && <p className="text-xs text-destructive mt-1 font-body">{errors[field.key]}</p>}
            </div>
          ))}

          <Button variant="hero" size="lg" className="w-full tap-feedback h-11 sm:h-12" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          <button
            className="font-body text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors p-2"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setErrors({});
            }}
          >
            {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
