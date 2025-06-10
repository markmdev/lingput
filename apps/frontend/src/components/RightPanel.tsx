export default function RightPanel({ children, styles = "" }: { children: React.ReactNode; styles?: string }) {
  return <div className={`flex flex-col gap-4 py-8 px-6 h-full overflow-hidden ${styles}`}>{children}</div>;
}
