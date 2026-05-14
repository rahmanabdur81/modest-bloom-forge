import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowLeft, Lock, ShieldCheck } from "lucide-react";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too short", color: "bg-destructive" },
    1: { label: "Weak", color: "bg-destructive" },
    2: { label: "Fair", color: "bg-orange-400" },
    3: { label: "Good", color: "bg-yellow-400" },
    4: { label: "Strong", color: "bg-emerald-400" },
    5: { label: "Very Strong", color: "bg-emerald-500" },
  };
  return { score, ...map[score] };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validLink, setValidLink] = useState<boolean | null>(null);

  // Validate the recovery link by checking the hash
  useEffect(() => {
    const hash = window.location.hash;
    const hasRecovery = hash.includes("type=recovery") || hash.includes("access_token");
    if (hasRecovery) {
      setValidLink(true);
    } else {
      setValidLink(false);
    }
  }, []);

  const strength = getPasswordStrength(password);

  const requirementMet = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated successfully!");

      // Auto sign out and redirect to login after a delay
      setTimeout(() => {
        supabase.auth.signOut().then(() => {
          navigate("/auth");
        });
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (validLink === false) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">Invalid or Expired Link</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button variant="hero" size="lg" className="w-full" asChild>
              <Link to="/auth/forgot-password">Request New Link</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">Password Updated!</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Your password has been reset successfully. You'll be redirected to the sign-in page shortly.
            </p>
            <Button variant="hero" size="lg" className="w-full" asChild>
              <Link to="/auth">Sign In Now</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <div className="mb-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <h1 className="font-display text-2xl font-semibold mb-1">Reset Password</h1>
            <p className="font-body text-sm text-muted-foreground">
              Create a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Field */}
            <div>
              <label className="text-xs uppercase tracking-wider font-body mb-2 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Enter new password"
                  className="w-full border border-border bg-background pl-10 pr-10 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 font-body">{errors.password}</p>}

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength.score ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-body text-muted-foreground">
                    Strength: <span className="font-medium text-foreground">{strength.label}</span>
                  </p>
                </div>
              )}

              {/* Requirements */}
              <div className="mt-3 space-y-1.5">
                <Requirement label="At least 8 characters" met={requirementMet.length} />
                <Requirement label="One uppercase letter (A-Z)" met={requirementMet.upper} />
                <Requirement label="One lowercase letter (a-z)" met={requirementMet.lower} />
                <Requirement label="One number (0-9)" met={requirementMet.number} />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-xs uppercase tracking-wider font-body mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  placeholder="Confirm your password"
                  className="w-full border border-border bg-background pl-10 pr-10 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1 font-body">{errors.confirmPassword}</p>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Requirement({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-body">
      {met ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
      )}
      <span className={met ? "text-emerald-600" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
