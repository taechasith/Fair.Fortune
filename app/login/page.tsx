"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPayload, parseErrorText, setSessionToken } from "@/lib/client/session";

type Mode = "login" | "register";
const PRIVACY_CONSENT_KEY = "fairfortune_privacy_consent_v1";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem(PRIVACY_CONSENT_KEY) === "accepted";
    setConsentAccepted(accepted);
    setShowConsent(!accepted);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consentAccepted) {
      setShowConsent(true);
      setError("Please accept the data privacy consent before continuing.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password })
      });
      const payload = (await response.json()) as Partial<AuthPayload> & { error?: string };
      if (!response.ok || !payload.token || !payload.user) {
        setError(parseErrorText(payload));
        return;
      }
      setSessionToken(payload.token);
      router.push("/giver");
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  function acceptConsent() {
    window.localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    setConsentAccepted(true);
    setShowConsent(false);
    setConsentChecked(false);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-[#7A0C1B]">Login</h1>
      <Card className="cny-panel">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Sign in to continue" : "Create account"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" && (
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            {error && <p className="text-sm text-[#C8102E]">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Need account?" : "Have account?"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowConsent(true)}>
                Privacy Consent
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2B2B]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#D4AF37]/50 bg-[#FDF6EC] p-5 shadow-[0_24px_50px_rgba(43,43,43,0.35)] md:p-6">
            <h2 className="text-xl font-bold text-[#7A0C1B]">Data Privacy Consent</h2>
            <p className="mt-2 text-sm text-[#5f5148]">
              To use login and room-based collaboration, we collect and process account and message data.
            </p>
            <div className="mt-4 space-y-3 rounded-xl border border-[#D4AF37]/35 bg-[#fffaf1] p-4 text-sm text-[#2B2B2B]">
              <p>
                <span className="font-semibold text-[#7A0C1B]">Data we store:</span> name, email, project details,
                room code activity, gratitude notes, chat messages, bank details, and uploaded transfer slip image.
              </p>
              <p>
                <span className="font-semibold text-[#7A0C1B]">Purpose:</span> account access, saving your work, and
                connecting giver and receiver in shared room sessions.
              </p>
              <p>
                <span className="font-semibold text-[#7A0C1B]">Your control:</span> do not upload sensitive data unless
                required; you can stop using collaboration features at any time.
              </p>
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm text-[#2B2B2B]">
              <input
                type="checkbox"
                className="mt-1"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span>I have read and agree to the data privacy terms for this application.</span>
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button disabled={!consentChecked} onClick={acceptConsent}>
                Accept and Continue
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConsent(false);
                  setConsentChecked(false);
                }}
              >
                Review Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
