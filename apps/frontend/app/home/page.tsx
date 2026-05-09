"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export default function HomePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const [refreshMessage, setRefreshMessage] = useState("");
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  useEffect(() => {
    if (!profile) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to fetch profile");
          }

          setProfile(data.data);
        } catch (err) {
          console.error(err);
        }
      };

      fetchProfile();
    }
  }, [profile]);

  useEffect(() => {
    if (!showRefreshMessage) return;

    const timer = setTimeout(() => {
      setShowRefreshMessage(false);
      setRefreshMessage("");
    }, 6000);

    return () => clearTimeout(timer);
  }, [showRefreshMessage]);

  const handleLogout = async () => {
    setLoadingLogout(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json().catch(() => null);
      console.log(data);
      if (!res.ok) {
        throw new Error(data?.message || "Logout failed");
      }

      localStorage.removeItem("profile");
      router.replace("/signin");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleRefreshToken = async () => {
    setLoadingRefresh(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setRefreshMessage(data?.message || "Refresh failed");
        setShowRefreshMessage(true);
        throw new Error(data?.message || "Refresh failed");
      }

      setRefreshMessage(data?.message || "Token refreshed successfully");
      setShowRefreshMessage(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRefresh(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center shadow-xl">
        <Image
          src={profile?.avatar_url || "/blank-profile.webp"}
          loading="eager"
          alt="Profile avatar"
          width={120}
          height={120}
          className="mx-auto mb-4 rounded-full object-cover border border-white/10"
        />

        <h1 className="text-2xl font-bold">
          Welcome
          <p className="text-green-400 text-lg mt-1">
            {profile?.first_name} {profile?.last_name}
          </p>
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          You are successfully logged in
        </p>

        <button
          onClick={handleRefreshToken}
          disabled={loadingRefresh}
          className="mt-6 w-full rounded-lg bg-green-500/10 py-3 text-sm font-medium text-green-400 transition hover:bg-green-500/20 disabled:opacity-50 cursor-pointer"
        >
          {loadingRefresh ? "Refreshing..." : "Refresh Token"}
        </button>

        {showRefreshMessage && (
          <p className="mt-4 text-sm text-green-400">{refreshMessage}</p>
        )}

        <button
          onClick={handleLogout}
          disabled={loadingLogout}
          className="mt-4 w-full rounded-lg bg-red-500/10 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
        >
          {loadingLogout ? "Logging out..." : "Logout"}
        </button>
      </div>
    </main>
  );
}
