import { Asterisk } from 'lucide-react';
import { ThemeToggle } from './themeToggle';
import { Separator } from './ui/separator';

/* ------------------------------ comapny info ------------------------------ */
function CompanyInfo() {
  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="flex flex-row items-center gap-0">
        <Asterisk className="h-6 w-6" />
        <h4 className="text-lg font-bold">Paperscape</h4>
      </div>

      <ThemeToggle />
    </div>
  );
}

/* --------------------------------- rights --------------------------------- */
function Rights() {
  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <div className="flex flex-1 flex-row items-center gap-2">
        <p>&copy; {new Date().getFullYear()} Copyright UWU LLC. All rights reserved.</p>
      </div>
      <div className="flex flex-row items-center gap-8">
        <p>Privacy Policy</p>
        <p>Terms of Service</p>
      </div>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*                                   footer                                   */
/* -------------------------------------------------------------------------- */
const MarketingFooter = () => {
  return (
    <footer className="mx-auto flex w-full flex-col gap-5 px-10 py-10">
      <CompanyInfo />
      <Separator />
      <Rights />
    </footer>
  );
};

export default MarketingFooter;
