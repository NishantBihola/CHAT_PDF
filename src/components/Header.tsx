// src/components/Header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { FilePlus } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:px-6">
      <Link href="/dashboard" className="text-2xl font-semibold tracking-tight">
        Chat to <span className="text-indigo-600">PDF/AI</span>
      </Link>

      <SignedIn>
        <div className="flex items-center space-x-2">
          <Button asChild variant="link" className="hidden md:flex">
            <Link href="/dashboard/upgrade">Pricing</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard">My Documents</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard/upload" className="inline-flex items-center gap-2">
              <FilePlus className="h-4 w-4 text-indigo-600" />
              <span>Upload</span>
            </Link>
          </Button>

          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex items-center space-x-2">
          <SignInButton mode="modal">
            <Button variant="ghost">Sign In</Button>
          </SignInButton>

          {/* CHANGED: redirectUrl -> forceRedirectUrl */}
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button>Get Started</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}
