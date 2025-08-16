export default function RightPanel({
  children,
  styles = "",
}: {
  children: React.ReactNode;
  styles?: string;
}) {
  return (
    <div
      className={`w-full lg:w-3/4 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col gap-5 py-8 px-6 h-full overflow-hidden shadow-sm border border-slate-100 ${styles}`}
    >
      {children}
    </div>
  );
}
