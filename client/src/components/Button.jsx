import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-cyan-500 hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] focus:ring-indigo-500",
  secondary: "border border-white/20 bg-transparent text-text-primary hover:border-white/40 hover:bg-white/5 active:scale-[0.98] focus:ring-indigo-500",
  ghost: "border border-white/10 bg-transparent text-text-primary hover:border-white/30 hover:bg-white/5 active:scale-[0.98] focus:ring-indigo-500",
  danger: "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-[0.98] focus:ring-red-500",
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

function Button({ children, variant = "primary", size = "md", loading = false, disabled = false, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;
