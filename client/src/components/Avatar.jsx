function initials(name = "Xypher User") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-xl",
};

function hashColor(name = "Xypher") {
  const colors = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  return colors[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}

function Avatar({ src, name, size = "md", initials: customInitials, color }) {
  return (
    <div className={`${sizes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border font-semibold text-white`} style={{ backgroundColor: color || hashColor(name) }}>
      {src ? <img className="h-full w-full object-cover" src={src} alt={name || "Avatar"} /> : customInitials || initials(name)}
    </div>
  );
}

export default Avatar;
