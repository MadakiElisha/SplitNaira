export interface CreatorProfile {
  displayName: string;
  role: string;
  email: string;
  location: string;
  walletAddress: string;
  payoutPreference: string;
  disciplines: string;
  availability: string;
  about: string;
}

export const PROFILE_STORAGE_KEY = "splitnaira-profile";

export const defaultCreatorProfile: CreatorProfile = {
  displayName: "Amina Okonkwo",
  role: "Producer and creative lead",
  email: "amina@splitnaira.africa",
  location: "Lagos, Nigeria",
  walletAddress: "GBQ6SPLIT4AMINA5FLOW7NAIRA2CREATOR3PAYOUT4TEAM",
  payoutPreference: "USDC on Stellar testnet",
  disciplines: "Afrobeats, Sync production, Live arrangements, Release ops",
  availability: "Open for label partnerships and soundtrack work in Q2.",
  about: `# About

Amina produces Afrobeats records, live sessions, and sync-ready arrangements for collaborative releases that need clean ownership from day one.

## Working style

- Leads release planning from rough demo to final masters.
- Coordinates writers, vocalists, and session players across Lagos and London.
- Prefers **USDC on Stellar** when a project needs fast reconciliation after launch.

> Splits should feel calm, clear, and impossible to argue about after release day.

## Current focus

Building repeatable payout systems for artists, managers, and producers who work across borders.`
};

export function hydrateCreatorProfile(value: unknown): CreatorProfile {
  const record =
    value && typeof value === "object"
      ? (value as Partial<Record<keyof CreatorProfile, unknown>>)
      : {};

  return {
    displayName:
      typeof record.displayName === "string"
        ? record.displayName
        : defaultCreatorProfile.displayName,
    role: typeof record.role === "string" ? record.role : defaultCreatorProfile.role,
    email: typeof record.email === "string" ? record.email : defaultCreatorProfile.email,
    location:
      typeof record.location === "string" ? record.location : defaultCreatorProfile.location,
    walletAddress:
      typeof record.walletAddress === "string"
        ? record.walletAddress
        : defaultCreatorProfile.walletAddress,
    payoutPreference:
      typeof record.payoutPreference === "string"
        ? record.payoutPreference
        : defaultCreatorProfile.payoutPreference,
    disciplines:
      typeof record.disciplines === "string"
        ? record.disciplines
        : defaultCreatorProfile.disciplines,
    availability:
      typeof record.availability === "string"
        ? record.availability
        : defaultCreatorProfile.availability,
    about: typeof record.about === "string" ? record.about : defaultCreatorProfile.about
  };
}
