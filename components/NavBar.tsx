"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { HomeIcon, BookmarkIcon, MapIcon, AlignLeftIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

export function NavBar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    // Initial fetch
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase.auth]);

  return (
    <nav className="border-b px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4 w-1/3">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <AlignLeftIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/saved">Saved Places</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/itinerary">Itinerary</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <HomeIcon className="h-5 w-5" />
              </Button>
            </Link>
            {user && (
              <>
                <Link href="/saved">
                  <Button variant="ghost" size="icon">
                    <BookmarkIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/itinerary">
                  <Button variant="ghost" size="icon">
                    <MapIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Middle */}
        <div className="flex-1 text-center w-1/3">
          <span className="text-2xl font-bold">Voya</span>
        </div>

        {/* Right Side */}
        <div className="w-1/3 flex justify-end">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.user_metadata.avatar_url}
                      alt={user.email}
                    />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    signout();
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
