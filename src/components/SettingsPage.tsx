"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SellerProfile } from "@/lib/types";
import { ArrowLeft, Loader2, Store, Eye, EyeOff } from "lucide-react";

interface SettingsPageProps {
  userId: string;
  onBack: () => void;
}

export function SettingsPage({ userId, onBack }: SettingsPageProps) {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Fetch profile ──────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // Profile doesn't exist yet — create one with defaults
        const { data: created } = await supabase
          .from("seller_profiles")
          .insert({ user_id: userId, store_name: "Thrift Store", show_storefront: true })
          .select()
          .single();

        if (created) {
          setProfile({
            id: created.id,
            userId: created.user_id,
            storeName: created.store_name,
            showStorefront: created.show_storefront,
          });
        }
      } else {
        setProfile({
          id: data.id,
          userId: data.user_id,
          storeName: data.store_name,
          showStorefront: data.show_storefront,
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  // ── Toggle storefront ──────────────────────────────────────────────────
  async function toggleStorefront(value: boolean) {
    if (!profile) return;
    setSaving(true);

    // Optimistic update
    setProfile({ ...profile, showStorefront: value });

    const { error } = await supabase
      .from("seller_profiles")
      .update({ show_storefront: value, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating storefront setting:", error);
      // Revert on error
      setProfile({ ...profile, showStorefront: !value });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to inventory
      </button>

      <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Manage your store display preferences.
      </p>

      {/* Settings cards */}
      <div className="mt-6 space-y-4">
        {/* Store info */}
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
              <Store size={18} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {profile?.storeName || "Thrift Store"}
              </p>
              <p className="text-xs text-neutral-400">Store name</p>
            </div>
          </div>
        </div>

        {/* Display toggle */}
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  profile?.showStorefront ? "bg-green-100" : "bg-neutral-100"
                }`}
              >
                {profile?.showStorefront ? (
                  <Eye size={18} className="text-green-600" />
                ) : (
                  <EyeOff size={18} className="text-neutral-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Display clothes on landing page
                </p>
                <p className="text-xs text-neutral-400">
                  {profile?.showStorefront
                    ? "Visitors can browse your clothes catalog"
                    : "Visitors will only see the login page"}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => toggleStorefront(!profile?.showStorefront)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                profile?.showStorefront ? "bg-neutral-900" : "bg-neutral-200"
              }`}
              role="switch"
              aria-checked={profile?.showStorefront ?? true}
              aria-label="Toggle storefront visibility"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  profile?.showStorefront ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {saving && (
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 size={12} className="animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
