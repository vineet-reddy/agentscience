interface AvatarProps {
  initials: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const colors = [
  "from-indigo-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-blue-500 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-yellow-500 to-amber-500",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const sizeClasses = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

export default function Avatar({ initials, name, size = "md" }: AvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-bold text-white flex-shrink-0`}
      title={name}
    >
      {initials}
    </div>
  );
}
