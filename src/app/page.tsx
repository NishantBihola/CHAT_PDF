import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1 overflow-scroll bg-gradient-to-bl from-white to-indigo-600 p-2 lg:p-5">
      <div className="rounded-md bg-white py-24 drop-shadow-xl sm:py-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Your Interactive Document AI</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">Transform Your PDFs into Interactive Conversations</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Upload any PDF and ask questions. We’ll index it with embeddings and answer from your document—fast.
            </p>
          </div>
          <Link href="/dashboard" className="mt-10 rounded-md bg-black px-5 py-2.5 text-white">Get Started</Link>
        </div>

        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image alt="App screenshot" src="https://i.imgur.com/VciRSTI.jpeg" width={2432} height={1442} className="rounded-xl" priority sizes="(max-width: 1024px) 100vw, 1024px" />
          </div>
        </div>
      </div>
    </main>
  );
}
