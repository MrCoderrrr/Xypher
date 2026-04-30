import { Link, NavLink } from "react-router-dom";
import { Circle, Menu, MessageCircle, X, Zap } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { createContext, useMemo, useState } from "react";
import TokenBadge from "./TokenBadge";
import AuthButtons from "./AuthButtons";
import { useAuth } from "../context/AuthContext";

export const RoleContext = createContext({ role: "Buyer", setRole: () => {} });

const roleLinks = {
  Buyer: [
    { to: "/explore", label: "Explore" },
    { to: "/pricing", label: "Pricing" },
    { to: "/creator/maya-iyer", label: "Creators" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/library", label: "Library" },
  ],
  Creator: [
    { to: "/creator-dashboard", label: "Creator Home" },
    { to: "/upload", label: "Upload" },
    { to: "/payouts", label: "Payouts" },
    { to: "/creator/analytics", label: "Analytics" },
  ],
  Admin: [
    { to: "/admin", label: "Overview" },
    { to: "/admin/prompts", label: "Prompts" },
    { to: "/admin/creators", label: "Creators" },
    { to: "/admin/payouts", label: "Payouts" },
  ],
};

const footer = {
  Product: ["Explore", "Pricing", "Library", "Dashboard"],
  Creators: ["Creator Dashboard", "Upload Prompt", "Payouts", "Analytics"],
  Company: ["About", "Careers", "Blog", "Contact"],
  Legal: ["Privacy", "Terms", "Refunds", "Security"],
};

function Logo() {
  return (
    <span className="brand-logo" aria-label="Xypher">
      <span className="brand-logo-base">Xy</span>
      <span className="brand-logo-accent">pher</span>
    </span>
  );
}

function NavItem({ item, onClick }) {
  return (
    <NavLink to={item.to} onClick={onClick} className="relative rounded-lg px-3 py-2 text-base font-semibold text-text-muted transition hover:text-text-primary">
      {({ isActive }) => (
        <>
          <span className={isActive ? "text-text-primary" : ""}>{item.label}</span>
          {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />}
        </>
      )}
    </NavLink>
  );
}

function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("Buyer");
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const links = roleLinks[role];
  const value = useMemo(() => ({ role, setRole }), [role]);
  const cycleRole = () => setRole((current) => (current === "Buyer" ? "Creator" : current === "Creator" ? "Admin" : "Buyer"));
  useMotionValueEvent(scrollYProgress, "change", (latest) => setScrolled(latest > 0.02));

  return (
    <RoleContext.Provider value={value}>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <motion.header
          className="fixed inset-x-0 top-0 z-40 h-16 border-b border-border backdrop-blur-[20px]"
          style={{ backgroundColor: scrolled ? "rgba(10,15,30,0.96)" : "rgba(10,15,30,0.8)" }}
        >
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {links.map((item) => <NavItem key={item.to} item={item} />)}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              {user && <TokenBadge value={user.tokenBalance || 0} />}
              <button
                onClick={cycleRole}
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                title="Demo: Click to switch role"
              >
                {role}
              </button>
              <AuthButtons />
            </div>

            <button className="rounded-lg border border-border p-2 text-text-primary hover:border-cyan hover:text-cyan md:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {open && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border-t border-border bg-bg-elevated/95 px-6 py-4 backdrop-blur-xl md:hidden">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-text-muted">Demo Mode</span>
                <button
                  onClick={() => cycleRole()}
                  className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300"
                >
                  {role}
                </button>
              </div>
              <nav className="flex flex-col gap-2">{links.map((item) => <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />)}</nav>
              <div className="mt-4"><AuthButtons /></div>
            </motion.div>
          )}
        </motion.header>

        <main className="pt-16">{children}</main>

        <footer className="border-t border-border bg-bg-elevated">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:px-6 lg:px-8 md:grid-cols-4">
            {Object.entries(footer).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-heading text-base font-bold text-text-primary">{title}</h3>
                <div className="mt-4 space-y-3">
                  {links.map((link) => <Link key={link} to="/" className="block text-base text-text-muted hover:text-cyan">{link}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border">
            <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-5 text-base text-text-muted sm:flex-row sm:px-6 lg:px-8">
              <p>Copyright 2026 Xypher. All rights reserved.</p>
              <div className="flex items-center gap-3">
                {[Circle, Circle, MessageCircle].map((Icon, index) => (
                  <Link key={index} to="/" className="rounded-full border border-border p-2 hover:border-indigo-500 hover:bg-indigo-500 hover:text-white">
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </RoleContext.Provider>
  );
}

export default Shell;
