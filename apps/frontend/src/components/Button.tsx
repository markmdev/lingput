type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="bg-blue-500 px-4 py-3 rounded-lg text-white font-bold cursor-pointer hover:scale-105 hover:bg-blue-600 transition-all"
    >
      {children}
    </button>
  );
}
