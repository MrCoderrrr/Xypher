import { Link } from "react-router-dom";
import { Heart, Star, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Badge from "./Badge";
import Avatar from "./Avatar";
import Button from "./Button";

function PromptCard({
  id,
  title,
  description,
  category,
  price,
  creatorName,
  creatorAvatar,
  creatorInitials,
  creatorColor,
  salesCount,
  rating,
  previewImage,
  isOwned,
  likes = 128,
  showLike = false,
}) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.article
      layout
      className="group overflow-hidden rounded-xl border border-border bg-bg-card shadow-card transition-all duration-250 hover:-translate-y-1 hover:border-accent hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]"
    >
      <Link to={`/prompt/${id}`} className="relative block aspect-video overflow-hidden bg-gradient-to-br from-indigo-500/20 via-bg-elevated to-cyan/10">
        {previewImage && <img className="h-full w-full object-cover brightness-90 transition duration-300 group-hover:scale-105 group-hover:brightness-110" src={previewImage} alt={title} />}
        <div className="absolute left-3 top-3 backdrop-blur-md">
          <Badge>{category}</Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/0 opacity-0 transition group-hover:bg-bg-primary/45 group-hover:opacity-100">
          <span className="rounded-lg border border-cyan/40 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan backdrop-blur">View Prompt →</span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/prompt/${id}`} className="font-heading text-lg font-semibold leading-snug text-text-primary hover:text-cyan">
            {title}
          </Link>
          {showLike && (
            <button onClick={() => setLiked((value) => !value)} className="relative rounded-full border border-border p-2 text-text-muted hover:border-danger hover:text-danger">
              <Heart className={liked ? "fill-danger text-danger scale-110" : ""} size={16} />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Star size={14} fill="currentColor" /> {rating}
          </span>
          <span className="inline-flex items-center gap-1">
            <TrendingUp size={14} /> {salesCount.toLocaleString()} sales
          </span>
          {showLike && <span>{likes + (liked ? 1 : 0)} likes</span>}
        </div>
        <p className="mt-3 line-clamp-2 min-h-11 text-sm leading-6 text-text-muted">{description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src={creatorAvatar} name={creatorName} initials={creatorInitials} color={creatorColor} size="sm" />
            <span className="truncate text-sm font-medium text-text-muted">{creatorName}</span>
          </div>
          {isOwned ? (
            <Badge variant="status" value="approved">Owned</Badge>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-3 py-1.5 text-sm font-bold text-cyan">
              <Zap size={14} fill="currentColor" /> {price}
            </span>
          )}
        </div>
        {isOwned && (
          <Link to={`/generate/${id}`} className="mt-4 block">
            <Button className="w-full" size="sm">Run</Button>
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export default PromptCard;
