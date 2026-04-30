import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

function LoginPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: null, general: null })); };

  const validate = () => {
    const newErrors = {};
    if (isRegister && !form.name.trim()) newErrors.name = "Please enter your name";
    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address (e.g., name@example.com)";
    }
    if (!form.password) {
      newErrors.password = "Please enter a password";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (err) => {
    console.log("[Signup Debug] Full error:", err);
    console.log("[Signup Debug] Error response:", err.response);
    console.log("[Signup Debug] Error request:", err.request);

    if (!err.response) {
      if (err.request) return "Cannot connect to server. Please check your internet connection or try again later.";
      return "An unexpected error occurred. Please try again.";
    }

    const status = err.response.status;
    const message = err.response.data?.message;

    const errorMap = {
      400: {
        "Missing fields": "Please fill in all required fields",
        "Password must be at least 6 characters": "Your password is too short. Use at least 6 characters.",
        "Invalid role": "Please select a valid role (Buyer or Creator)",
      },
      401: { "Invalid credentials": "The email or password you entered is incorrect. Please try again." },
      409: { "Email already registered": "This email is already registered. Please sign in instead or use a different email." },
    };

    if (errorMap[status] && errorMap[status][message]) return errorMap[status][message];
    if (message) return message;
    if (status === 500) return "Server error. Please try again in a few moments.";
    return `Error (${status}): Something went wrong. Please try again.`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setLoading(true);

    console.log(`[Signup Debug] Attempting ${isRegister ? "registration" : "login"} with:`, { email: form.email, name: form.name, role });

    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, role);
      } else {
        await login(form.email, form.password);
      }
      console.log(`[Signup Debug] ${isRegister ? "Registration" : "Login"} successful`);
    } catch (err) {
      console.error(`[Signup Debug] ${isRegister ? "Registration" : "Login"} failed:`, err);
      const message = getErrorMessage(err);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-bg-primary px-6 py-20">
      <div className="absolute h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl border border-border bg-bg-card p-8 shadow-2xl">
        <Link to="/" className="block text-center font-heading text-3xl font-black"><span className="text-white">Xy</span><span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">pher</span></Link>
        <h1 className="mt-8 text-center font-heading text-3xl font-bold">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-center text-text-muted">{isRegister ? "Join Xypher today" : "Sign in to your account"}</p>

        {errors.general && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0 text-red-400" size={20} />
              <p className="text-base leading-relaxed text-red-400">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-muted">Full Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter your full name" className={`w-full rounded-xl border bg-bg-card px-4 py-3 outline-none placeholder:text-slate-600 focus:ring-2 ${errors.name ? "border-red-500 ring-red-500/20" : "border-border focus:border-indigo-500 focus:ring-indigo-500/20"}`} />
              {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-muted">Email Address</label>
            <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" type="email" className={`w-full rounded-xl border bg-bg-card px-4 py-3 outline-none placeholder:text-slate-600 focus:ring-2 ${errors.email ? "border-red-500 ring-red-500/20" : "border-border focus:border-indigo-500 focus:ring-indigo-500/20"}`} />
            {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-muted">Password</label>
            <div className="relative">
              <input value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={isRegister ? "Create a password (min 6 chars)" : "Enter your password"} type={show ? "text" : "password"} className={`w-full rounded-xl border bg-bg-card px-4 py-3 pr-12 outline-none placeholder:text-slate-600 focus:ring-2 ${errors.password ? "border-red-500 ring-red-500/20" : "border-border focus:border-indigo-500 focus:ring-indigo-500/20"}`} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-text-muted hover:text-text-primary">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
          </div>

          {isRegister && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-text-muted">I want to...</label>
              <div className="grid grid-cols-2 gap-3">{[["buyer", ShoppingBag, "Buy Prompts", "Browse marketplace"], ["creator", Sparkles, "Sell Prompts", "Become a creator"]].map(([id, Icon, title, text]) => <button type="button" key={id} onClick={() => setRole(id)} className={`rounded-xl border p-4 text-left transition ${role === id ? id === "buyer" ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20" : "border-cyan bg-cyan/10 ring-2 ring-cyan/20" : "border-border hover:border-white/30"}`}><Icon className="mb-2 text-text-primary" size={24} /><p className="font-semibold text-text-primary">{title}</p><p className="text-sm text-text-muted">{text}</p></button>)}</div>
            </div>
          )}
        </div>
        {!isRegister && <button type="button" className="mt-3 text-sm text-cyan">Forgot password?</button>}
        <Button type="submit" loading={loading} className="mt-6 w-full">{isRegister ? "Create Account" : "Sign In"}</Button>
        <div className="my-6 flex items-center gap-3 text-text-muted"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <p className="text-center text-sm text-text-muted">{isRegister ? "Already have an account?" : "Don't have an account?"} <Link className="text-cyan" to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Sign up"}</Link></p>
      </form>
    </section>
  );
}

export default LoginPage;
