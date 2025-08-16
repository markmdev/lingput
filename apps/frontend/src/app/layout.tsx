import { ToastContainer } from "react-toastify";
import "react-loading-skeleton/dist/skeleton.css";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-slate-900 antialiased`}
      >
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
