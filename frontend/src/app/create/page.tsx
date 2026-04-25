import type { Metadata } from "next";

import { SplitApp } from "@/components/split-app";

export const metadata: Metadata = {
  title: "Create Split",
  description: "Create a royalty split project on Stellar with SplitNaira."
};

export default function CreatePage() {
  return (
    <main className="shell-page">
      <SplitApp />
    </main>
  );
}
