import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>© 2025 StarLogs. Your StarGazing Companion.</p>
      <div className="flex gap-6">
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">
          Terms of Service
        </Link>
        <a 
          href="https://www.weatherapi.com/docs/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-foreground transition-colors"
        >
          API
        </a>
      </div>
    </footer>
  );
}
