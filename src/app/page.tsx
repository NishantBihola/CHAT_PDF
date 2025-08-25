// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";

const features = [
  {
    name: "Secure PDF Storage",
    description:
      "Keep all your important PDF files safe, organized, and accessible anytime, anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Responses",
    description:
      "Get instant answers from your documents with AI-powered search and summarization.",
    icon: ZapIcon,
  },
  {
    name: "Smart Insights",
    description:
      "Let AI highlight key points, generate summaries, and surface critical information automatically.",
    icon: BrainCogIcon,
  },
  {
    name: "Cross-Device Access",
    description:
      "Use your dashboard on desktop, tablet, or mobile—always in sync and optimized for performance.",
    icon: MonitorSmartphoneIcon,
  },
  {
    name: "Enterprise-Grade Security",
    description:
      "Your data stays private with robust encryption and enterprise-ready infrastructure.",
    icon: ServerCogIcon,
  },
  {
    name: "Visual Document Preview",
    description:
      "Quickly glance through PDFs with smart previews and page-level insights.",
    icon: EyeIcon,
  },
];

export default function Home() {
  return (
    <main className="flex-1 overflow-scroll bg-gradient-to-bl from-white to-indigo-600 p-2 lg:p-5">
      <div className="rounded-md bg-white py-24 drop-shadow-xl sm:py-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Your Interactive Document AI
            </h2>

            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your PDFs into Interactive Conversations
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Introducing{" "}
              <span className="font-bold text-indigo-600">Chat with PDF.</span>
              <br />
              <br />
              Upload any PDF—research papers, reports, contracts—and get instant
              answers from an AI chatbot trained on your document.{" "}
              <span className="text-indigo-600">Chat with PDF</span> turns
              static documents into{" "}
              <span className="font-bold">dynamic conversations</span>,
              boosting your productivity 10×.
            </p>
          </div>

          <Button asChild className="mt-10">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>

        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              alt="App screenshot"
              src="https://i.imgur.com/VciRSTI.jpeg"
              width={2432}
              height={1442}
              className="rounded-xl"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </div>

        <section id="features" className="mx-auto mt-16 max-w-7xl px-6">
          <h3 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Everything you need to work smarter
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">
            Store documents, ask questions, and get AI-generated answers with
            citations and summaries.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.name}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <f.icon className="h-7 w-7 text-indigo-600" />
                <h4 className="mt-4 text-lg font-semibold">{f.name}</h4>
                <p className="mt-2 text-sm text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
