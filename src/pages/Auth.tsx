import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

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

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md container-page">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to your account" : "Join the Habeeb's Paradise family"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-xs uppercase tracking-wider font-body mb-2 block">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.key as keyof typeof formData]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors[field.key] && <p className="text-xs text-destructive mt-1 font-body">{errors[field.key]}</p>}
            </div>
          ))}

          <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
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
