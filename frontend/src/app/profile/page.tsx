import type { Metadata } from "next";

import { ProfileStudio } from "@/components/profile-studio";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your SplitNaira creator profile."
};

export default function ProfilePage() {
  return (
    <main className="shell-page">
      <ProfileStudio />
    </main>
  );
}
