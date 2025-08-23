import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            <img
              src="/logo_min.png"
              alt="Lingput Logo"
              className="h-12 w-auto inline-block align-middle"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}>Log In</Link>
            </Button>
            <Button
              asChild
              className="shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow"
            >
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/signup`}>Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
