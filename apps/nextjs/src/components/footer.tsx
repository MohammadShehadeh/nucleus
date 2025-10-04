import { Logo } from "@/components/logo";

export const Footer = () => {
  return (
    <footer className="w-full bg-secondary/50 text-foreground py-6 gap-4 mt-auto h-fit flex flex-col items-center justify-center rounded-t-2xl">
      <Logo />
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LMS. All rights reserved.
      </p>
    </footer>
  );
};
