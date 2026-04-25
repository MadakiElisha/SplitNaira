"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { rpc, Transaction } from "@stellar/stellar-sdk";

import { buildCreateSplitXdr, getSplit } from "@/lib/api";
import {
  connectFreighter,
  getFreighterWalletState,
  signWithFreighter,
  type WalletState
} from "@/lib/freighter";
import { formatBasisPoints } from "@/lib/stellar";

import { useToast } from "./toast-provider";

interface CollaboratorInput {
  id: string;
  address: string;
  alias: string;
  basisPoints: string;
}

const projectTypes = [
  {
    id: "music",
    label: "Music",
    description: "Singles, EPs, albums"
  },
  {
    id: "film",
    label: "Film",
    description: "Scores, trailers, edits"
  },
  {
    id: "podcast",
    label: "Podcast",
    description: "Hosts, editors, theme writers"
  },
  {
    id: "visual",
    label: "Visual",
    description: "Art direction and content"
  },
  {
    id: "live",
    label: "Live",
    description: "Events, sessions, performance"
  },
  {
    id: "other",
    label: "Other",
    description: "Custom collaborative work"
  }
];

function createCollaboratorInput(basisPoints = "0"): CollaboratorInput {
  return {
    id: crypto.randomUUID(),
    address: "",
    alias: "",
    basisPoints
  };
}

function createInitialCollaborators() {
  return [createCollaboratorInput("5000"), createCollaboratorInput("5000")];
}

function truncateValue(value: string | null) {
  if (!value) {
    return "-";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function SplitApp() {
  const { showToast } = useToast();

  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: null
  });
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("music");
  const [token, setToken] = useState("");
  const [collaborators, setCollaborators] = useState<CollaboratorInput[]>(() =>
    createInitialCollaborators()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const totalBasisPoints = useMemo(
    () =>
      collaborators.reduce((sum, collaborator) => {
        const parsedBasisPoints = Number.parseInt(collaborator.basisPoints, 10);
        return sum + (Number.isFinite(parsedBasisPoints) ? parsedBasisPoints : 0);
      }, 0),
    [collaborators]
  );

  const readyCollaborators = useMemo(
    () =>
      collaborators.filter(
        (collaborator) =>
          collaborator.address.trim() &&
          collaborator.alias.trim() &&
          collaborator.basisPoints.trim()
      ).length,
    [collaborators]
  );

  const isSplitBalanced = totalBasisPoints === 10_000;
  const allocationPercent = Math.max(0, Math.min(100, totalBasisPoints / 100));

  useEffect(() => {
    void getFreighterWalletState()
      .then(setWallet)
      .catch(() => {
        setWallet({ connected: false, address: null, network: null });
      });
  }, []);

  async function onConnectWallet() {
    try {
      const state = await connectFreighter();
      setWallet(state);
      showToast("Wallet connected.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection failed.";
      showToast(message, "error");
    }
  }

  async function onReconnectWallet() {
    try {
      const state = await getFreighterWalletState();
      setWallet(state);
      showToast(state.connected ? "Wallet reconnected." : "Wallet not authorized.", "info");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet refresh failed.";
      showToast(message, "error");
    }
  }

  function onDisconnectWallet() {
    setWallet({ connected: false, address: null, network: null });
    showToast("Wallet disconnected in app. Reconnect to continue.", "info");
  }

  function updateCollaborator(id: string, patch: Partial<CollaboratorInput>) {
    setCollaborators((currentCollaborators) =>
      currentCollaborators.map((collaborator) =>
        collaborator.id === id ? { ...collaborator, ...patch } : collaborator
      )
    );
  }

  function addCollaborator() {
    setCollaborators((currentCollaborators) => [
      ...currentCollaborators,
      createCollaboratorInput()
    ]);
  }

  function removeCollaborator(id: string) {
    setCollaborators((currentCollaborators) =>
      currentCollaborators.length <= 2
        ? currentCollaborators
        : currentCollaborators.filter((collaborator) => collaborator.id !== id)
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!wallet.connected || !wallet.address) {
      showToast("Connect Freighter wallet first.", "error");
      return;
    }

    if (!isSplitBalanced) {
      showToast("Collaborator shares must total 10000 basis points.", "error");
      return;
    }

    const collaboratorPayload = collaborators.map((collaborator) => ({
      address: collaborator.address.trim(),
      alias: collaborator.alias.trim(),
      basisPoints: Number.parseInt(collaborator.basisPoints, 10)
    }));

    setIsSubmitting(true);
    setTxHash(null);

    try {
      const buildResponse = await buildCreateSplitXdr({
        owner: wallet.address,
        projectId: projectId.trim(),
        title: title.trim(),
        projectType: projectType.trim(),
        token: token.trim(),
        collaborators: collaboratorPayload
      });

      const signedTxXdr = await signWithFreighter(
        buildResponse.xdr,
        buildResponse.metadata.networkPassphrase
      );

      const server = new rpc.Server(
        process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
        { allowHttp: true }
      );
      const transaction = new Transaction(signedTxXdr, buildResponse.metadata.networkPassphrase);
      const submitResponse = await server.sendTransaction(transaction);

      if (submitResponse.status === "ERROR") {
        const errorResult = submitResponse.errorResult?.result();
        throw new Error(
          errorResult ? `Transaction submission failed: ${errorResult}` : "Transaction submission failed."
        );
      }

      setTxHash(submitResponse.hash ?? null);
      showToast("Split project created successfully.", "success");

      await getSplit(projectId.trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create split project.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <aside className="space-y-6">
          <div className="glass-panel p-6 md:p-8">
            <span className="section-kicker">Split studio</span>
            <h1 className="mt-5 font-display text-4xl tracking-tight text-[color:var(--ink)] md:text-5xl">
              Create a payout-ready split.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              Connect Freighter, define collaborators, and send the Soroban transaction once the
              basis points line up. This is the operational side of the release, designed to stay
              calm even when the project itself is moving fast.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onConnectWallet} className="button-primary">
                Connect wallet
              </button>
              <button type="button" onClick={onReconnectWallet} className="button-secondary">
                Reconnect
              </button>
              <button type="button" onClick={onDisconnectWallet} className="button-secondary">
                Disconnect
              </button>
            </div>

            <div className="mt-8 space-y-4 rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Wallet status
                </p>
                <span
                  className={clsx(
                    "status-pill",
                    wallet.connected
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-100"
                      : "border-rose-500/30 bg-rose-500/15 text-rose-800 dark:text-rose-100"
                  )}
                >
                  {wallet.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="grid gap-3 text-sm text-[color:var(--muted)]">
                <div className="rounded-[1.2rem] bg-[color:var(--surface)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Address</p>
                  <p className="mt-2 break-all text-[color:var(--ink)]">
                    {wallet.address ?? "No wallet connected yet"}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[color:var(--surface)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Network</p>
                  <p className="mt-2 text-[color:var(--ink)]">{wallet.network ?? "Not available"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Allocation health
                </p>
                <p className="mt-3 font-display text-4xl tracking-tight text-[color:var(--ink)]">
                  {allocationPercent.toFixed(0)}%
                </p>
              </div>
              <span className="status-pill">
                {isSplitBalanced ? "Balanced split" : "Needs adjustment"}
              </span>
            </div>

            <div className="mt-6 h-2 rounded-full bg-[color:var(--track)]">
              <div
                className={clsx(
                  "h-2 rounded-full transition-all duration-300",
                  isSplitBalanced
                    ? "bg-gradient-to-r from-emerald-500 to-gold"
                    : "bg-gradient-to-r from-greenMid to-gold"
                )}
                style={{ width: `${allocationPercent}%` }}
              />
            </div>

            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              {isSplitBalanced
                ? "The split is mathematically ready to submit."
                : "Adjust collaborator shares until the total reaches exactly 10000 basis points."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Collaborators ready
                </p>
                <p className="mt-3 font-display text-3xl text-[color:var(--ink)]">
                  {readyCollaborators}/{collaborators.length}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  Filled-out collaborator rows with address, alias, and basis points.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Active signer
                </p>
                <p className="mt-3 font-display text-3xl text-[color:var(--ink)]">
                  {truncateValue(wallet.address)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  Freighter stays in the loop from draft to transaction approval.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="glass-panel p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="section-kicker">Project details</span>
              <h2 className="mt-4 font-display text-3xl tracking-tight text-[color:var(--ink)] md:text-4xl">
                Set up the release
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
                Choose the project type, add the token contract address, then define every
                collaborator in basis points. The form stays human-friendly while preserving exact
                payout math for the backend.
              </p>
            </div>
            <span className="status-pill">Soroban transaction</span>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Project type
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {projectTypes.map((type) => {
                const isActive = projectType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProjectType(type.id)}
                    className={clsx(
                      "rounded-[1.5rem] border p-4 text-left transition",
                      isActive
                        ? "border-[color:var(--gold)] bg-[color:var(--tag-bg)] shadow-[0_16px_40px_-30px_rgba(20,20,18,0.65)]"
                        : "border-[color:var(--border)] bg-[color:var(--surface-strong)] hover:border-[color:rgba(201,146,42,0.45)]"
                    )}
                  >
                    <p className="font-display text-xl tracking-tight text-[color:var(--ink)]">
                      {type.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm md:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Project ID
              </span>
              <input
                required
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                placeholder="afrobeats_001"
                className="form-input"
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Project title
              </span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Eko After Hours"
                className="form-input"
              />
            </label>

            <label className="space-y-2 text-sm md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Token contract address
              </span>
              <input
                required
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Token contract address"
                className="form-input"
              />
            </label>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Collaborators
                </p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Add every collaborator that should receive a payout from this release.
                </p>
              </div>

              <button type="button" onClick={addCollaborator} className="button-secondary">
                Add collaborator
              </button>
            </div>

            <div className="space-y-3">
              {collaborators.map((collaborator, index) => {
                const parsedBasisPoints = Number.parseInt(collaborator.basisPoints, 10);
                const shareLabel = Number.isFinite(parsedBasisPoints)
                  ? formatBasisPoints(parsedBasisPoints)
                  : "0.00%";

                return (
                  <div
                    key={collaborator.id}
                    className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl tracking-tight text-[color:var(--ink)]">
                          Collaborator {index + 1}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">
                          Current share: {shareLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCollaborator(collaborator.id)}
                        disabled={collaborators.length <= 2}
                        className="button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-12">
                      <label className="space-y-2 text-sm md:col-span-5">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          Stellar address
                        </span>
                        <input
                          required
                          value={collaborator.address}
                          onChange={(event) =>
                            updateCollaborator(collaborator.id, { address: event.target.value })
                          }
                          placeholder="G..."
                          className="form-input"
                        />
                      </label>

                      <label className="space-y-2 text-sm md:col-span-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          Alias
                        </span>
                        <input
                          required
                          value={collaborator.alias}
                          onChange={(event) =>
                            updateCollaborator(collaborator.id, { alias: event.target.value })
                          }
                          placeholder="Lead artist"
                          className="form-input"
                        />
                      </label>

                      <label className="space-y-2 text-sm md:col-span-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          Basis points
                        </span>
                        <input
                          required
                          type="number"
                          min={1}
                          max={10_000}
                          value={collaborator.basisPoints}
                          onChange={(event) =>
                            updateCollaborator(collaborator.id, {
                              basisPoints: event.target.value
                            })
                          }
                          placeholder="2500"
                          className="form-input"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-[1.7rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Total basis points
                </p>
                <p className="mt-2 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                  {totalBasisPoints} / 10000
                </p>
              </div>
              <span
                className={clsx(
                  "status-pill",
                  isSplitBalanced
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-100"
                    : "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-100"
                )}
              >
                {isSplitBalanced ? "Ready to sign" : "Keep editing"}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              SplitNaira requires exact basis points so the final payout math is unambiguous.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !isSplitBalanced}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create split on testnet"}
            </button>
            <p className="text-sm text-[color:var(--muted)]">
              Signer: {truncateValue(wallet.address)}
            </p>
          </div>
        </form>
      </section>

      {txHash ? (
        <section className="glass-panel p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="section-kicker">Transaction submitted</span>
              <h2 className="mt-4 font-display text-3xl tracking-tight text-[color:var(--ink)]">
                Split created successfully.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
                Your split request has been sent. Keep the transaction hash handy while you verify
                the result with the backend or a Stellar explorer.
              </p>
            </div>
            <span className="status-pill border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-100">
              Submitted
            </span>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Transaction hash
            </p>
            <p className="mt-3 break-all font-mono text-sm text-[color:var(--ink)]">{txHash}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
