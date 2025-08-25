"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useSubscription } from "@/hooks/useSubscription";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const { plan, loading } = useSubscription();

  const checkout = async () => {
    const stripe = await stripePromise;
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    if (!res.ok) return alert(await res.text());
    const { sessionId } = await res.json();
    await stripe?.redirectToCheckout({ sessionId });
  };

  const portal = async () => {
    const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    if (!res.ok) return alert(await res.text());
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-2 text-gray-600">Choose the plan that fits your workflow.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-1 text-gray-600">2 uploads • 3 chat messages</p>
          <button className="mt-6 rounded border px-3 py-2 text-sm" disabled>Current (default)</button>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-1 text-gray-600">Unlimited uploads & chat</p>
          {!loading && plan === "pro" ? (
            <button className="mt-6 rounded border px-3 py-2 text-sm" onClick={portal}>Manage Subscription</button>
          ) : (
            <button className="mt-6 rounded bg-black px-3 py-2 text-sm text-white" onClick={checkout}>Go Pro</button>
          )}
        </div>
      </div>
    </main>
  );
}
