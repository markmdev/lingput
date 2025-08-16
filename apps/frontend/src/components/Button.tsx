type ButtonProps = {
  styles?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  styles = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "rounded-xl font-semibold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400";
  const variants: Record<string, string> = {
    primary:
      "bg-indigo-600 text-white hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.99] shadow-sm",
    secondary:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 shadow-sm",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-3.5 text-lg",
  };
  return (
    <button {...props} className={`${base} ${variants[variant]} ${sizes[size]} ${styles}`}>
      {children}
    </button>
  );
}
