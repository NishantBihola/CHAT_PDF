"use client";
import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu, X, FilePlus } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          Chat to <span className="text-indigo-600">PDF/AI</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/pricing" className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100">Pricing</Link>
          <SignedIn>
            <Link href="/dashboard" className="rounded-md border px-3 py-1.5 text-sm">My Documents</Link>
            <Link href="/dashboard/upload" className="rounded-md bg-black px-3 py-1.5 text-sm text-white">
              <span className="inline-flex items-center gap-2"><FilePlus className="h-4 w-4" /> Upload</span>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal"><button className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100">Sign In</button></SignInButton>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-md bg-black px-3 py-1.5 text-sm text-white">Get Started</button>
            </SignInButton>
          </SignedOut>
        </div>

        <button className="inline-flex items-center md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="font-semibold">Menu</span>
              <button className="p-2" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpen(false)}>Pricing</Link>
              <SignedIn>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpen(false)}>My Documents</Link>
                <Link href="/dashboard/upload" className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpen(false)}>Upload</Link>
                <div className="border-t pt-3"><UserButton afterSignOutUrl="/" /></div>
              </SignedIn>
              <SignedOut>
                <div className="mt-2 flex flex-col gap-2">
                  <SignInButton mode="modal"><button className="w-full rounded-md px-3 py-2 text-sm hover:bg-gray-100">Sign In</button></SignInButton>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="w-full rounded-md bg-black px-3 py-2 text-sm text-white">Get Started</button>
                  </SignInButton>
                </div>
              </SignedOut>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
