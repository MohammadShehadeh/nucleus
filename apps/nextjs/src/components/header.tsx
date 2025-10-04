"use client";

import { Button } from "@lms/ui/components/button";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

interface NavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string; description?: string }[];
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Courses",
    href: "/courses",
    hasDropdown: true,
    dropdownItems: [
      {
        name: "Course 1",
        href: "/course-1",
        description: "Course 1 description",
      },
      {
        name: "Course 2",
        href: "/course-2",
        description: "Course 2 description",
      },
      { name: "Course 3", href: "/course-3", description: "Course 3 description" },
    ],
  },
  { name: "Pricing", href: "/pricing" },
  { name: "Search", href: "/search" },
  { name: "About", href: "/about" },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: "auto" },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <header className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between lg:h-20">
        <Logo />

        <nav className="hidden items-center space-x-8 lg:flex">
          {navItems.map((item) => (
            <div
              role="button"
              tabIndex={0}
              key={item.name}
              className="relative"
              onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                prefetch={false}
                href={item.href}
                className="text-foreground flex items-center space-x-1 font-medium transition-colors duration-200 hover:text-rose-500"
              >
                <span>{item.name}</span>
                {item.hasDropdown && (
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                )}
              </Link>

              {item.hasDropdown && (
                <AnimatePresence>
                  {activeDropdown === item.name && (
                    <motion.div
                      className="border-border bg-background/95 absolute top-full left-0 mt-2 w-64 overflow-hidden rounded-xl border shadow-xl backdrop-blur-lg"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.2 }}
                    >
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link
                          prefetch={false}
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="hover:bg-muted block px-4 py-3 transition-colors duration-200"
                        >
                          <div className="text-foreground font-medium">{dropdownItem.name}</div>
                          {dropdownItem.description && (
                            <div className="text-muted-foreground text-sm">
                              {dropdownItem.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center space-x-4 lg:flex">
          <Button variant="ghost" asChild>
            <Link prefetch={false} href="/login">
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link prefetch={false} href="/register">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="overflow-hidden lg:hidden"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-border bg-background/95 mt-4 space-y-2 rounded-xl border py-4 shadow-xl backdrop-blur-lg">
              {navItems.map((item) => (
                <Button
                  variant="ghost"
                  size="default"
                  className="block w-full"
                  key={item.name}
                  onClick={() => setIsMobileMenuOpen(false)}
                  asChild
                >
                  <Link prefetch={false} href={item.href}>
                    {item.name}
                  </Link>
                </Button>
              ))}
              <div className="space-y-2 px-4 py-2">
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                  asChild
                >
                  <Link prefetch={false} href="/login">
                    Login
                  </Link>
                </Button>

                <Button
                  variant="default"
                  size="default"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                  asChild
                >
                  <Link prefetch={false} href="/register">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
