export default function RightPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 py-8 px-6 h-full overflow-hidden">{children}</div>;
}
