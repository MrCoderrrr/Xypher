import { Link } from "react-router-dom";
import { Star, Users, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "./Avatar";

function CreatorCard({ creator }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-card shadow-card transition-all duration-300 hover:border-indigo-500 hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]"
    >
      <div 
        className="h-24 w-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${creator.avatarColor}80, rgba(6,182,212,0.1))` }} 
      />
      
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-10 mb-3 flex justify-between items-end">
          <div className="rounded-full border-4 border-bg-card">
            <Avatar initials={creator.avatarInitials} color={creator.avatarColor} name={creator.name} size="lg" />
          </div>
          <div className="mb-1 flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
            <Star size={14} fill="currentColor" /> {creator.avgRating}
          </div>
        </div>
        
        <Link to={`/creator/${creator.id}`} className="font-heading text-xl font-bold text-text-primary hover:text-cyan">
          {creator.name}
        </Link>
        <p className="mt-1 text-xs text-text-muted">{creator.location}</p>
        
        <p className="mt-3 line-clamp-2 min-h-[40px] text-sm text-text-muted">
          {creator.bio}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {(creator.skills || []).slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full border border-border bg-bg-elevated px-2 py-0.5 text-xs text-text-muted">
              {skill}
            </span>
          ))}
          {creator.skills?.length > 3 && (
            <span className="rounded-full border border-border bg-bg-elevated px-2 py-0.5 text-xs text-text-muted">
              +{creator.skills.length - 3}
            </span>
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-text-muted">
          <div className="flex items-center gap-1.5">
            <Briefcase size={16} />
            <span>{creator.totalPrompts} prompts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span>{(creator.followers || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default CreatorCard;
