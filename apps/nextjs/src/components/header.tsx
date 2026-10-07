"use client";

import { Button } from "@nucleus/ui/components/button";
import { ThemeToggle } from "@nucleus/ui/components/theme";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, LogIn, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const GITHUB_REPO = "mohammadshehadeh/nucleus";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

interface GitHubRepoResponse {
  stargazers_count?: number;
}

const fetchGitHubStars = async () => {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
  if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
  const data = (await res.json()) as GitHubRepoResponse;
  return data.stargazers_count ?? null;
};

const useGitHubStars = () => {
  const { data } = useQuery({
    queryKey: ["github-stars", GITHUB_REPO],
    queryFn: fetchGitHubStars,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
  return { stars: data ?? null };
};

function formatStars(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export const Header = () => {
  const { stars } = useGitHubStars();

  return (
    <header className="fixed top-0 z-50 w-full border-b transition-colors duration-200 border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Dashboard"
            aria-label="Dashboard"
            nativeButton={false}
            render={<Link prefetch={false} href="/dashboard" />}
          >
            <LayoutDashboard className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Log in"
            aria-label="Log in"
            nativeButton={false}
            render={<Link prefetch={false} href="/login" />}
          >
            <LogIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Get started"
            aria-label="Get started"
            nativeButton={false}
            render={<Link prefetch={false} href="/register" />}
          >
            <UserPlus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Star Nucleus on GitHub"
              />
            }
          >
            <Star className="size-4" />
            {stars !== null && <span className="text-xs tabular-nums">{formatStars(stars)}</span>}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
