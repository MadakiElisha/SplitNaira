#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-Split-Naira/SplitNaira}"
BASE="${2:-1}"
GH_ARGS=("-R" "$REPO")
GH_BIN="${GH_BIN:-gh}"

if ! command -v "$GH_BIN" >/dev/null 2>&1; then
  if [[ -x "/mnt/c/Program Files/GitHub CLI/gh.exe" ]]; then
    GH_BIN="/mnt/c/Program Files/GitHub CLI/gh.exe"
  elif [[ -x "/c/Program Files/GitHub CLI/gh.exe" ]]; then
    GH_BIN="/c/Program Files/GitHub CLI/gh.exe"
  else
    echo "gh CLI not found in PATH. Set GH_BIN or add gh to PATH." >&2
    exit 1
  fi
fi

num() {
  echo $((BASE + $1 - 1))
}

I1=$(num 1)
I2=$(num 2)
I3=$(num 3)
I4=$(num 4)
I5=$(num 5)
I6=$(num 6)
I7=$(num 7)
I8=$(num 8)
I9=$(num 9)
I10=$(num 10)
I11=$(num 11)
I12=$(num 12)
I13=$(num 13)
I14=$(num 14)
I15=$(num 15)
I16=$(num 16)
I17=$(num 17)
I18=$(num 18)
I19=$(num 19)
I20=$(num 20)

# 1
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
None

Background
The contract currently distributes the full contract balance regardless of project, which risks cross-project fund mixing.

Tasks
- Add a storage key for per-project balance
- Add a deposit function that credits a specific project
- Update distribute to use the project balance only

Acceptance Criteria
- Deposits are tied to a project ID
- Distribution only uses that project balance
- Existing tests updated and new tests added for multi-project scenarios
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I1" -t "Contract: Add project-scoped deposits and balances" -F - <<<"$BODY"

# 2
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
None

Background
Duplicate addresses can skew payouts or unintentionally merge shares.

Tasks
- Add a duplicate-address check during project creation
- Add unit tests for duplicate collaborator rejection

Acceptance Criteria
- Creation fails when two collaborators share the same address
- Error surfaced via SplitError
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I2" -t "Contract: Enforce unique collaborator addresses" -F - <<<"$BODY"

# 3
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
None

Background
Teams often refine splits before final release. The contract should allow changes until locked.

Tasks
- Add update_collaborators method for project owner
- Prevent updates when project is locked
- Validate basis points sum to 10,000

Acceptance Criteria
- Owner can update collaborators while unlocked
- Updates are rejected once locked
- Tests cover success and failure paths
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I3" -t "Contract: Allow updating collaborators before lock" -F - <<<"$BODY"

# 4
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
None

Background
Tracking distribution rounds improves auditability and enables richer UIs.

Tasks
- Add a distribution_round counter per project
- Increment on each successful distribute
- Emit the round number in distribution events

Acceptance Criteria
- Round increments only when distribution succeeds
- Events include round number
- Tests added for round behavior
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I4" -t "Contract: Add distribution round tracking" -F - <<<"$BODY"

# 5
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
None

Background
Long-lived royalty splits should not expire unexpectedly.

Tasks
- Bump TTL on project read/write paths
- Add configurable TTL constants

Acceptance Criteria
- TTL is extended on create, update, distribute, and get_project
- Behavior documented in code comments
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I5" -t "Contract: Extend storage TTL for active projects" -F - <<<"$BODY"

# 6
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
None

Background
Restricting token contracts reduces risk and simplifies accounting.

Tasks
- Add optional allowlist of token contract addresses
- Enforce allowlist on create_project
- Add admin methods to manage allowlist

Acceptance Criteria
- Projects can only be created with allowed tokens when allowlist is set
- Tests cover allowlist on and off
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I6" -t "Contract: Add allowed-token validation" -F - <<<"$BODY"

# 7
BODY=$(cat <<EOF
Phase
Phase 1: Contract foundation

Depends on
- #${I1}

Background
We need explicit coverage for project balance isolation.

Tasks
- Create two projects with different collaborators
- Deposit to one project and distribute
- Assert only that project collaborators receive payouts

Acceptance Criteria
- Tests fail without isolation and pass with correct logic
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I7" -t "Contract tests: Multi-project distribution isolation" -F - <<<"$BODY"

# 8
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
None

Background
Users need to connect a wallet to create or manage splits.

Tasks
- Add wallet connect button and state
- Show connected address and network
- Handle disconnect/reconnect

Acceptance Criteria
- User can connect Freighter and see address
- UI shows connection status changes
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I8" -t "Frontend: Connect Freighter wallet" -F - <<<"$BODY"

# 9
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
- #${I8}
- #${I16}

Background
Current UI is a static scaffold and does not submit on-chain. Use the backend to build the unsigned transaction and sign with Freighter.

Tasks
- Build create split form using contract client
- Call backend POST /splits to get unsigned XDR
- Sign and submit the transaction
- Display success and error states

Acceptance Criteria
- New project is created on testnet
- UI surfaces transaction hash or status
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I9" -t "Frontend: Wire split creation form to Soroban" -F - <<<"$BODY"

# 10
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
- #${I9}

Background
Split inputs should guide users and prevent invalid totals.

Tasks
- Enforce basis points total = 10,000
- Validate addresses format
- Prevent duplicate addresses in UI

Acceptance Criteria
- UI blocks invalid submission
- Validation messages are clear and actionable
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I10" -t "Frontend: Collaborator validation UX" -F - <<<"$BODY"

# 11
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
- #${I15}

Background
Creators need visibility into existing projects and splits. Use backend data for consistency.

Tasks
- Add a list view seeded from a local list of project IDs
- Add detail view powered by GET /splits/:projectId
- Render collaborator breakdown

Acceptance Criteria
- Project detail loads from backend
- Details show collaborators and split percentages
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I11" -t "Frontend: Project list and detail view" -F - <<<"$BODY"

# 12
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
- #${I8}
- #${I1}

Background
Owners or collaborators should be able to trigger distributions safely.

Tasks
- Add distribute button per project
- Show confirmation modal with amounts
- Handle pending/failed/success states

Acceptance Criteria
- Distribution call works on testnet
- UI shows progress and outcome clearly
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I12" -t "Frontend: Distribution trigger with confirmation" -F - <<<"$BODY"

# 13
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
- #${I4}

Background
Creators should see payout history for transparency.

Tasks
- Query Horizon events for contract
- Render timeline with amounts and recipients

Acceptance Criteria
- History shows recent payments and distribution rounds
- Links to explorer for verification
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I13" -t "Frontend: Transaction history using Horizon events" -F - <<<"$BODY"

# 14
BODY=$(cat <<EOF
Phase
Phase 3: Frontend integration

Depends on
None

Background
Network and wallet errors should be handled gracefully.

Tasks
- Add global toast system
- Add error boundary for app router

Acceptance Criteria
- Errors show in a consistent UI
- App does not crash on failed requests
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I14" -t "Frontend: Toasts and error boundary" -F - <<<"$BODY"

# 15
BODY=$(cat <<EOF
Phase
Phase 2: Backend API

Depends on
None

Background
A backend endpoint simplifies frontend data access and caching.

Tasks
- Fetch project data from Soroban RPC
- Normalize response fields

Acceptance Criteria
- GET returns full project data for valid ID
- Returns 404 for missing project
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I15" -t "Backend: GET /splits/:projectId via Soroban RPC" -F - <<<"$BODY"

# 16
BODY=$(cat <<EOF
Phase
Phase 2: Backend API

Depends on
- #${I17}

Background
Backend can prepare transaction payloads for the frontend to sign.

Tasks
- Validate inputs with Zod
- Build unsigned transaction XDR
- Return to frontend for signing

Acceptance Criteria
- Endpoint returns unsigned XDR and metadata
- Invalid payloads return 400
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I16" -t "Backend: POST /splits to build create_project tx" -F - <<<"$BODY"

# 17
BODY=$(cat <<EOF
Phase
Phase 2: Backend API

Depends on
None

Background
Input validation prevents malformed data and improves error messages.

Tasks
- Add Zod validation middleware helper
- Apply to POST endpoints

Acceptance Criteria
- Invalid requests return structured errors
- Valid requests pass through
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I17" -t "Backend: Add request validation middleware" -F - <<<"$BODY"

# 18
BODY=$(cat <<EOF
Phase
Phase 2: Backend API

Depends on
None

Background
Separate readiness and liveness checks help deployments and uptime.

Tasks
- Add /health/live (always ok)
- Add /health/ready (checks config)

Acceptance Criteria
- Liveness returns ok immediately
- Readiness fails on missing env config
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I18" -t "Backend: Add /health/ready and /health/live" -F - <<<"$BODY"

# 19
BODY=$(cat <<EOF
Phase
Phase 4: Docs and onboarding

Depends on
- #${I1}
- #${I9}

Background
Contributors need clear steps to deploy and test the contract.

Tasks
- Document Soroban build and deploy commands
- Add steps for setting contract ID in frontend/backend

Acceptance Criteria
- README or docs include end-to-end testnet setup
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I19" -t "Docs: Testnet deployment guide" -F - <<<"$BODY"

# 20
BODY=$(cat <<EOF
Phase
Phase 4: Docs and onboarding

Depends on
- #${I18}

Background
Backend CD is needed for fast iteration and testing.

Tasks
- Choose a deployment target (Render, Fly.io, Railway, etc.)
- Add GitHub Actions workflow for deployment
- Document required secrets

Acceptance Criteria
- CD workflow runs on main branch merges
- Deployment target is documented and configurable
EOF
)
"$GH_BIN" issue edit "${GH_ARGS[@]}" "$I20" -t "CI/CD: Add backend deploy workflow" -F - <<<"$BODY"

printf "Updated issue bodies with hierarchy and dependencies for %s (base #%s)\n" "$REPO" "$BASE"