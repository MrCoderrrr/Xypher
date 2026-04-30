import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Code2, GraduationCap, Image, Megaphone, PenTool, Play, Search, Sparkles, Star, TrendingUp, Video, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "../components/Button";
import PromptCard from "../components/PromptCard";
import PromptCardSkeleton from "../components/PromptCardSkeleton";
import Avatar from "../components/Avatar";
import api from "../utils/axios";
import { categories, testimonials } from "../data/mockData";
import { fadeUp, scaleIn, slideInLeft, staggerContainer } from "../utils/animations";

const fetchFeaturedPrompts = async () => {
  const { data } = await api.get("/prompts", { params: { sort: "popular", limit: 6, status: "approved" } });
  return data.prompts;
};

const fetchStats = async () => {
  const { data } = await api.get("/admin/stats").catch(() => ({ data: { prompts: 2400, creators: 840, generations: 18000, avgRating: 4.9 } }));
  return data;
};

const categoryIcons = { Writing: PenTool, Coding: Code2, Marketing: Megaphone, Image, Video, Business: TrendingUp, Education: GraduationCap, SEO: Search, "Social Media": Play };

function Reveal({ children, className = "", variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });
  return <motion.div ref={ref} className={className} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"}>{children}</motion.div>;
}

function Count({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      setCount(Math.round((value * frame) / 28));
      if (frame >= 28) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [value]);
  return count.toLocaleString();
}

function AnimatedHeroCards({ prompts }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollTimeout = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); // Prevent page scroll
      
      if (scrollTimeout.current) return;
      setIsHovered(true);
      
      if (e.deltaY > 0) {
        setCurrentIndex((prev) => (prev + 1) % 4);
      } else {
        setCurrentIndex((prev) => (prev - 1 + 4) % 4);
      }
      
      scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null;
      }, 600);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const cards = [...(prompts || [])];
  if (cards.length === 0) return null;
  while (cards.length < 4) {
    cards.push(cards[cards.length % prompts.length]);
  }
  const displayCards = cards.slice(0, 4);

  const positions = [
    { x: -120, y: 120, scale: 0.85, zIndex: 10, opacity: 0.6 },
    { x: 0, y: 0, scale: 1, zIndex: 30, opacity: 1 },
    { x: 120, y: -120, scale: 0.85, zIndex: 10, opacity: 0.6 },
    { x: 0, y: 0, scale: 0.75, zIndex: 0, opacity: 0 },
  ];

  return (
    <div 
      ref={containerRef}
      className="absolute left-1/2 top-1/2 h-[400px] w-80 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayCards.map((prompt, i) => {
        const posIndex = (i + currentIndex) % 4;
        const pos = positions[posIndex];
        return (
          <motion.div
            key={i}
            className="absolute left-0 top-1/2 w-80 -translate-y-1/2"
            initial={false}
            animate={{
              x: pos.x,
              y: pos.y,
              scale: pos.scale,
              zIndex: pos.zIndex,
              opacity: pos.opacity,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="animate-float rounded-2xl border border-border bg-bg-card p-4 shadow-[0_30px_80px_rgba(99,102,241,0.25)]" style={{ animationDelay: `${i * 0.5}s` }}>
              <img className="aspect-video w-full rounded-xl object-cover pointer-events-none" src={prompt.previewImage} alt={prompt.title} />
              <p className="mt-3 font-heading font-semibold">{prompt.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-text-muted">{prompt.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm"><span className="text-amber-300">★ {prompt.rating}</span><span className="text-cyan">⚡ {prompt.price}</span></div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Home() {
  const { data: featured, isLoading } = useQuery({ queryKey: ["featured"], queryFn: fetchFeaturedPrompts });
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: fetchStats });
  const barHeights = ["h-16", "h-24", "h-14", "h-28", "h-20", "h-32", "h-24"];
  const displayStats = stats || { prompts: 2400, creators: 840, generations: 18000, avgRating: 4.9 };

  return (
    <>
      <section className="hero-radial dot-grid relative overflow-hidden pt-0 lg:pt-4">
        <div className="mx-auto grid max-w-[1400px] items-start gap-12 px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:grid-cols-[1fr_0.9fr]">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="mb-5 inline-flex rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 animate-glow">✦ The AI Prompt Marketplace</motion.p>
            <motion.h1 variants={fadeUp} className="font-heading text-6xl font-black leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
              Unlock Better<br />
              <span className="text-orange-500" style={{ fontSize: "inherit", textShadow: "0 0 24px rgba(249,115,22,0.4)" }}>AI Outputs</span><br />
              Instantly.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-xl leading-relaxed text-text-muted">Discover battle-tested prompts from expert creators. Buy once, generate forever. Save hours every week.</motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/explore"><Button size="lg">Explore Prompts <ArrowRight size={18} /></Button></Link>
              <Link to="/upload"><Button size="lg" variant="secondary">Become a Creator</Button></Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 text-sm text-text-muted">⚡ 2,400+ prompts • 840 creators • 18K generations</motion.p>
          </motion.div>
          <div className="relative hidden h-[500px] lg:-mt-[90px] lg:block">
            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
            {featured && <AnimatedHeroCards prompts={featured} />}
          </div>
        </div>
      </section>

      <Reveal className="border-y border-white/5 py-8">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-white/5 px-4 sm:px-6 lg:px-8 md:grid-cols-4">
          {[["Prompts", displayStats.prompts], ["Creators", displayStats.creators], ["Generations", displayStats.generations], ["Avg Rating", Math.round((displayStats.avgRating || 4.9) * 10)]].map(([label, value]) => (
            <div key={label} className="px-4 text-center">
              <p className="font-heading text-4xl font-black text-white">{label === "Avg Rating" ? `${(value / 10).toFixed(1)}★` : <><Count value={value} />+</>}</p>
              <p className="mt-1 text-sm text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-4xl font-black">How Xypher Works</h2>
        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          <div className="absolute left-1/4 right-1/4 top-9 hidden border-t border-dashed border-indigo-500/30 md:block" />
          {[[Search, "Browse", "Explore prompts by category, creator, and outcome."], [Zap, "Buy", "Unlock reusable systems with tokens."], [Sparkles, "Generate", "Run prompts and get better outputs instantly."]].map(([Icon, title, body], index) => (
            <motion.div key={title} variants={fadeUp} className="relative text-center">
              <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-indigo-500/50 bg-bg-card p-1"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 font-heading font-bold">{index + 1}</span></div>
              <Icon className="mx-auto mt-6 text-indigo-400" size={32} />
              <h3 className="mt-4 font-heading text-2xl font-bold">{title}</h3>
              <p className="mt-2 text-lg text-text-muted">{body}</p>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <Reveal className="bg-bg-elevated/40 py-20" variants={staggerContainer}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between"><h2 className="font-heading text-4xl font-black">Featured Prompts</h2><Link to="/explore" className="font-semibold text-cyan">View All →</Link></div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <PromptCardSkeleton key={i} />)}</div>
          ) : (
            <motion.div variants={staggerContainer} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{(featured || []).slice(0, 6).map((prompt) => <motion.div key={prompt._id || prompt.id} variants={scaleIn}><PromptCard {...prompt} id={prompt._id || prompt.id} /></motion.div>)}</motion.div>
          )}
        </div>
      </Reveal>

      <Reveal className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl font-black">Browse by Category</h2>
        <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category] || BookOpen;
            return <Link key={category} to="/explore" className="flex h-20 w-[120px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-card text-sm font-semibold text-text-muted hover:scale-105 hover:border-indigo-500 hover:text-cyan hover:shadow-glow"><Icon size={22} />{category}</Link>;
          })}
        </div>
      </Reveal>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 sm:px-6 lg:px-8 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-heading text-4xl font-black">Start Earning From Your Prompts</h2>
          <p className="mt-4 text-xl leading-relaxed text-text-muted">Package your expertise once and sell it to a global audience of builders, marketers, founders, and AI operators.</p>
          <div className="mt-6 space-y-4">{["Keep 75% of every sale", "Global audience of AI builders", "Simple upload and review process", "Instant payout requests"].map((item) => <p key={item} className="flex items-center gap-3 text-text-muted"><CheckCircle2 className="text-success" /> {item}</p>)}</div>
          <Link to="/upload" className="mt-8 inline-flex"><Button>Become a Creator</Button></Link>
        </Reveal>
        <Reveal variants={slideInLeft}>
          <div className="rounded-2xl border border-border bg-bg-elevated p-6 shadow-card">
            <p className="text-text-muted">This Month</p>
            <p className="mt-2 font-heading text-5xl font-bold">₹12,400</p>
            <div className="mt-8 flex h-40 items-end gap-3">{barHeights.map((height, i) => <div key={i} className={`flex-1 rounded-t-lg bg-gradient-to-t from-indigo-600 to-cyan-400 ${height}`} />)}</div>
            <p className="mt-5 text-sm font-semibold text-success">↑ 24% from last month</p>
          </div>
        </Reveal>
      </section>

      <Reveal className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8" variants={staggerContainer}>
        <h2 className="text-center font-heading text-4xl font-black">Loved by AI builders</h2>
        <motion.div variants={staggerContainer} className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => <motion.div key={item.name} variants={scaleIn} className="rounded-2xl border border-border bg-bg-card p-6 hover:border-indigo-500"><div className="flex text-amber-300">{Array.from({ length: item.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div><p className="mt-4 text-text-muted">"{item.text}"</p><div className="mt-5 flex items-center gap-3"><Avatar initials={item.avatarInitials} name={item.name} color={item.avatarColor} /><div><p className="font-semibold">{item.name}</p><p className="text-sm text-text-muted">{item.role}, {item.company}</p></div></div></motion.div>)}
        </motion.div>
      </Reveal>

      <Reveal className="border-y border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 to-cyan-900/30 px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-5xl font-black">Ready to unlock better AI outputs?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-text-muted">Start with proven prompt systems instead of blank-page guessing.</p>
        <Link to="/explore" className="mt-8 inline-flex"><Button size="lg" className="animate-glow">Explore Prompts</Button></Link>
      </Reveal>
    </>
  );
}

export default Home;
