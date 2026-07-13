"use client";

import { useState, useCallback } from "react";
import { useRegistration } from "@/components/RegistrationProvider";
import { site } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

type PaymentStatus = "idle" | "awaiting" | "success" | "failure";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load RazorPay checkout script"));
    document.body.appendChild(script);
  });
}

async function handlePayment(
  amount: number,
  registration: import("@/components/RegistrationProvider").RegistrationData,
  setStatus: (s: PaymentStatus) => void,
  setPaymentId: (id: string) => void,
) {
  try {
    setStatus("awaiting");

    // 1. Create order on server
    const notes: Record<string, string> = {
      location: registration.location,
      eventDate: registration.eventDate || "",
      eventTime: registration.eventTime || "",
      name: registration.name,
      contact: registration.contact,
      email: registration.email,
      aadhar: registration.aadhar,
      bringingGuest: String(registration.bringingGuest),
      guestName: registration.guestName || "",
      guestAge: registration.guestAge || "",
      about: registration.about || "",
      social: registration.social || "",
    };

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, notes }),
    });

    if (!res.ok) {
      setStatus("failure");
      return;
    }

    const { orderId } = await res.json();

    // 2. Load RazorPay checkout script
    await loadRazorpayScript();

    // 3. Open RazorPay checkout modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount,
      currency: "INR",
      name: site.brand.name,
      description: `${registration.location} — ${registration.eventDate || ""}`,
      order_id: orderId,
      prefill: {
        name: registration.name,
        email: registration.email,
        contact: registration.contact,
      },
      theme: { color: "#A16207" },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        // 4. Verify payment on server
        const verifyRes = await fetch("/api/orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            notes,
          }),
        });

        if (verifyRes.ok) {
          setStatus("success");
          setPaymentId(response.razorpay_payment_id);
        } else {
          setStatus("failure");
        }
      },
      modal: {
        ondismiss: function () {
          setStatus("idle");
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function () {
      setStatus("failure");
    });
    rzp.open();
  } catch {
    setStatus("failure");
  }
}

export function PaymentSection() {
  const { data, clearRegistrationData } = useRegistration();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Placeholder state: before form submit (no RegistrationData)
  if (!data) {
    return (
      <section
        id="payment"
        className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
        <Reveal>
          <div className="mx-auto max-w-lg text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-8 text-foreground">
              Complete Your Payment
            </h2>
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground">
                  Fill the registration form above to proceed to payment.
                </p>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </section>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <section
        id="payment"
        className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
        <Reveal>
          <div className="mx-auto max-w-lg">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8 text-foreground">
              Complete Your Payment
            </h2>
            <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="py-8 text-center">
                <CheckCircle2
                  className="mx-auto size-12 text-green-500"
                  aria-hidden="true"
                />
                <CardTitle className="mt-4 text-green-700 dark:text-green-400">
                  Registration confirmed!
                </CardTitle>
                <CardDescription className="mt-2">
                  Check your email for details.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </section>
    );
  }

  // Failure state
  if (status === "failure") {
    return (
      <section
        id="payment"
        className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
        <Reveal>
          <div className="mx-auto max-w-lg">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8 text-foreground">
              Complete Your Payment
            </h2>
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="py-8 text-center">
                <XCircle
                  className="mx-auto size-12 text-destructive"
                  aria-hidden="true"
                />
                <CardTitle className="mt-4 text-destructive">
                  Payment failed
                </CardTitle>
                <CardDescription className="mt-2">
                  Your payment could not be processed.
                </CardDescription>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setStatus("idle");
                    clearRegistrationData();
                    document
                      .getElementById("form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Form
                </Button>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </section>
    );
  }

  // Summary card + Pay button (idle or awaiting)
  const displayAmount = Math.round(((data as any).price || 50000) / 100);

  return (
    <section
      id="payment"
      className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
      <Reveal>
        <div className="mx-auto max-w-lg">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8 text-foreground">
            Complete Your Payment
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Review Your Registration</CardTitle>
              <CardDescription>
                Please confirm your details before proceeding to payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary details */}
              <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{data.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{data.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{data.eventTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-medium">{data.name}</span>
                </div>
              </div>

              {/* Pay button — uses amount from data (in paise, per D-14) */}
              <Button
                className="w-full"
                disabled={status === "awaiting"}
                onClick={() => {
                  const amount = (data as any).price || 50000;
                  handlePayment(amount, data, setStatus, setPaymentId);
                }}
              >
                {status === "awaiting" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing your payment...
                  </>
                ) : (
                  `Pay ₹${displayAmount}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Reveal>
    </section>
  );
}

export default PaymentSection;
