"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  PROFILE_STORAGE_KEY,
  defaultCreatorProfile,
  hydrateCreatorProfile,
  type CreatorProfile
} from "@/lib/profile";
import { renderRichText } from "@/lib/rich-text";

import { useToast } from "./toast-provider";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((segment) => segment[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncateWallet(address: string) {
  if (address.length <= 16) {
    return address;
  }

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function ProfileStudio() {
  const { showToast } = useToast();

  const [savedProfile, setSavedProfile] = useState<CreatorProfile>(defaultCreatorProfile);
  const [draftProfile, setDraftProfile] = useState<CreatorProfile>(defaultCreatorProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const nextProfile = rawProfile
        ? hydrateCreatorProfile(JSON.parse(rawProfile) as unknown)
        : defaultCreatorProfile;

      setSavedProfile(nextProfile);
      setDraftProfile(nextProfile);
    } catch {
      setSavedProfile(defaultCreatorProfile);
      setDraftProfile(defaultCreatorProfile);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const profileCompletion = useMemo(() => {
    const completedFields = [
      draftProfile.displayName,
      draftProfile.role,
      draftProfile.email,
      draftProfile.location,
      draftProfile.walletAddress,
      draftProfile.payoutPreference,
      draftProfile.disciplines,
      draftProfile.availability,
      draftProfile.about
    ].filter((field) => field.trim()).length;

    return Math.round((completedFields / 9) * 100);
  }, [draftProfile]);

  const disciplineTags = useMemo(
    () =>
      draftProfile.disciplines
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    [draftProfile.disciplines]
  );

  const isDirty = useMemo(
    () => JSON.stringify(savedProfile) !== JSON.stringify(draftProfile),
    [savedProfile, draftProfile]
  );

  function updateField<Key extends keyof CreatorProfile>(field: Key, value: CreatorProfile[Key]) {
    setDraftProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draftProfile));
      setSavedProfile(draftProfile);
      showToast("Profile saved for this browser.", "success");
    } catch {
      showToast("We could not save this profile locally.", "error");
    }
  }

  function resetProfile() {
    setDraftProfile(defaultCreatorProfile);
    setSavedProfile(defaultCreatorProfile);

    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultCreatorProfile));
      showToast("Profile reset to the starter example.", "info");
    } catch {
      showToast("The starter profile loaded, but local reset could not be saved.", "error");
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
        <div className="space-y-4">
          <span className="section-kicker">Creator profile</span>
          <h1 className="max-w-3xl font-display text-4xl tracking-tight text-[color:var(--ink)] md:text-5xl">
            View your public profile while you edit the details that collaborators see.
          </h1>
        </div>
        <div className="glass-panel p-6">
          <p className="text-sm leading-7 text-[color:var(--muted)]">
            This profile page stores your draft locally for now. It is designed to feel like a
            creator-facing studio, with a live preview styled by Tailwind Typography for richer bio
            content.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <form onSubmit={saveProfile} className="glass-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl tracking-tight text-[color:var(--ink)]">
                Edit profile
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {isLoaded ? "Saved locally in this browser." : "Loading your saved profile..."}
              </p>
            </div>
            <span className="status-pill">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Display name
              </span>
              <input
                value={draftProfile.displayName}
                onChange={(event) => updateField("displayName", event.target.value)}
                className="form-input"
                placeholder="Your creator name"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Role
              </span>
              <input
                value={draftProfile.role}
                onChange={(event) => updateField("role", event.target.value)}
                className="form-input"
                placeholder="Producer, artist, manager..."
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Email
              </span>
              <input
                type="email"
                value={draftProfile.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="form-input"
                placeholder="you@example.com"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Location
              </span>
              <input
                value={draftProfile.location}
                onChange={(event) => updateField("location", event.target.value)}
                className="form-input"
                placeholder="City, Country"
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Stellar wallet
              </span>
              <input
                value={draftProfile.walletAddress}
                onChange={(event) => updateField("walletAddress", event.target.value)}
                className="form-input"
                placeholder="G..."
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Disciplines
              </span>
              <input
                value={draftProfile.disciplines}
                onChange={(event) => updateField("disciplines", event.target.value)}
                className="form-input"
                placeholder="Afrobeats, Production, Sound design"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Payout preference
              </span>
              <input
                value={draftProfile.payoutPreference}
                onChange={(event) => updateField("payoutPreference", event.target.value)}
                className="form-input"
                placeholder="USDC on Stellar"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Availability
              </span>
              <input
                value={draftProfile.availability}
                onChange={(event) => updateField("availability", event.target.value)}
                className="form-input"
                placeholder="Open for new projects"
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                About and notes
              </span>
              <textarea
                value={draftProfile.about}
                onChange={(event) => updateField("about", event.target.value)}
                rows={14}
                className="form-input min-h-[18rem] resize-y"
                placeholder="Use headings, bullet lists, quotes, and simple emphasis."
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="submit" className="button-primary">
              Save profile
            </button>
            <button type="button" onClick={resetProfile} className="button-secondary">
              Reset starter profile
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <section className="glass-panel p-6 md:p-8">
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-[color:var(--tag-bg)] font-display text-3xl font-semibold text-[color:var(--greenDeep)]">
                {getInitials(draftProfile.displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="section-kicker">Public preview</span>
                <h2 className="mt-4 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                  {draftProfile.displayName}
                </h2>
                <p className="mt-2 text-base text-[color:var(--muted)]">{draftProfile.role}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {disciplineTags.map((discipline) => (
                    <span key={discipline} className="status-pill">
                      {discipline}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                <span>Profile completeness</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[color:var(--track)]">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-gold to-greenMid"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Contact
                </p>
                <p className="mt-3 text-sm text-[color:var(--ink)]">{draftProfile.email}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{draftProfile.location}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Payout route
                </p>
                <p className="mt-3 text-sm text-[color:var(--ink)]">
                  {draftProfile.payoutPreference}
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {truncateWallet(draftProfile.walletAddress)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Availability
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]">
                {draftProfile.availability}
              </p>
            </div>
          </section>

          <section className="glass-panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="section-kicker">Rich text preview</span>
                <h3 className="mt-4 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                  Bio and release notes
                </h3>
              </div>
              <p className="text-sm text-[color:var(--muted)]">Styled with Tailwind Typography</p>
            </div>

            <div className="brand-prose prose mt-8 max-w-none dark:prose-invert">
              {renderRichText(draftProfile.about)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
