import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <Link href="/" className="text-2xl font-bold text-primary">
              Lingput
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              © {new Date().getFullYear()} Lingput. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-1 flex flex-row gap-2">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/cookie">Cookie Policy</Link>
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://github.com/markmdev/lingput"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/markmdev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
