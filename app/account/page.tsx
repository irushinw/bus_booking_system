"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/client";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";

export default function AccountPage() {
  const { user, profile } = useAuth();
  const search = useSearchParams();
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? user?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL ?? user?.photoURL ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const section = useMemo(() => (search?.get("section") ?? "profile") as "profile" | "settings", [search]);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Support hash navigation too
    const hash = window.location.hash.replace("#", "");
    if (hash === "settings" && settingsRef.current) {
      settingsRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "profile" && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? user?.displayName ?? "");
    setPhone(profile?.phone ?? "");
    setPhotoURL(profile?.photoURL ?? user?.photoURL ?? "");
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setSavingProfile(true);
      await updateUserProfile(user.uid, { displayName, phone, photoURL });
      await updateProfile(user, { displayName, photoURL: photoURL || undefined });
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Could not update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      setMessage("You must be logged in to change your password.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    try {
      setSavingSecurity(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Could not change password. Please check your current password and try again.");
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h1 className="text-2xl font-semibold text-white">Account</h1>
          <p className="mt-2 text-sm text-slate-300">Manage your profile information and account security settings.</p>
          {message && <p className="mt-4 rounded-xl bg-yellow-400/20 px-4 py-2 text-xs text-yellow-100">{message}</p>}
        </header>

        <section ref={profileRef} id="profile" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Edit profile</h2>
          <div className="mt-4 grid gap-3 text-sm text-white">
            <label className="flex flex-col gap-1">
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1">
              Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1">
              Photo URL
              <input value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
            </label>
            <button onClick={handleSaveProfile} disabled={savingProfile} className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          </div>
        </section>

        <section ref={settingsRef} id="settings" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Account settings</h2>
          <div className="mt-4 grid gap-3 text-sm text-white">
            <div className="rounded-lg border border-white/10 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">Change password</p>
              <div className="mt-3 grid gap-3">
                <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
                <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
                <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
                <button onClick={handleChangePassword} disabled={savingSecurity} className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed">
                  {savingSecurity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update password
                </button>
                <p className="text-xs text-slate-400">For security, you may be asked to re-enter your current password.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}


