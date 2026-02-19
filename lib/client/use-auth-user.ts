"use client";

import { useEffect, useState } from "react";
import { AuthUser } from "@/lib/types/collab";
import { fetchWithAuth, parseErrorText } from "./session";

export function useAuthUser(): {
  user?: AuthUser;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUser>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUser() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth("/api/auth/me");
      const payload = await response.json();
      if (!response.ok) {
        setUser(undefined);
        setError(parseErrorText(payload));
        return;
      }
      setUser(payload.user);
    } catch {
      setUser(undefined);
      setError("Could not load session");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return { user, loading, error, refresh: loadUser };
}
