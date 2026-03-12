#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
GH_ARGS=()
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

if [[ -n "$REPO" ]]; then
  GH_ARGS+=("-R" "$REPO")
fi

create_issue() {
  local title="$1"
  shift
  "$GH_BIN" issue create "${GH_ARGS[@]}" -t "$title" -F -
}

create_issue "Contract: Add project-scoped deposits and balances" <<'EOF'
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

create_issue "Contract: Enforce unique collaborator addresses" <<'EOF'
Background
Duplicate addresses can skew payouts or unintentionally merge shares.

Tasks
- Add a duplicate-address check during project creation
- Add unit tests for duplicate collaborator rejection

Acceptance Criteria
- Creation fails when two collaborators share the same address
- Error surfaced via SplitError
EOF

create_issue "Contract: Allow updating collaborators before lock" <<'EOF'
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

create_issue "Contract: Add distribution round tracking" <<'EOF'
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

create_issue "Contract: Extend storage TTL for active projects" <<'EOF'
Background
Long-lived royalty splits should not expire unexpectedly.

Tasks
- Bump TTL on project read/write paths
- Add configurable TTL constants

Acceptance Criteria
- TTL is extended on create, update, distribute, and get_project
- Behavior documented in code comments
EOF

create_issue "Contract: Add allowed-token validation" <<'EOF'
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

create_issue "Contract tests: Multi-project distribution isolation" <<'EOF'
Background
We need explicit coverage for project balance isolation.

Tasks
- Create two projects with different collaborators
- Deposit to one project and distribute
- Assert only that project collaborators receive payouts

Acceptance Criteria
- Tests fail without isolation and pass with correct logic
EOF

create_issue "Frontend: Connect Freighter wallet" <<'EOF'
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

create_issue "Frontend: Wire split creation form to Soroban" <<'EOF'
Background
Current UI is a static scaffold and does not submit on-chain.

Tasks
- Build create split form using contract client
- Submit create_project transaction
- Display success and error states

Acceptance Criteria
- New project is created on testnet
- UI surfaces transaction hash or status
EOF

create_issue "Frontend: Collaborator validation UX" <<'EOF'
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

create_issue "Frontend: Project list and detail view" <<'EOF'
Background
Creators need visibility into existing projects and splits.

Tasks
- Add a list view for projects
- Add detail view with collaborator breakdown
- Pull data from backend or Soroban RPC

Acceptance Criteria
- Project list renders from on-chain or backend data
- Details show collaborators and split percentages
EOF

create_issue "Frontend: Distribution trigger with confirmation" <<'EOF'
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

create_issue "Frontend: Transaction history using Horizon events" <<'EOF'
Background
Creators should see payout history for transparency.

Tasks
- Query Horizon events for contract
- Render timeline with amounts and recipients

Acceptance Criteria
- History shows recent payments and distribution rounds
- Links to explorer for verification
EOF

create_issue "Frontend: Toasts and error boundary" <<'EOF'
Background
Network and wallet errors should be handled gracefully.

Tasks
- Add global toast system
- Add error boundary for app router

Acceptance Criteria
- Errors show in a consistent UI
- App does not crash on failed requests
EOF

create_issue "Backend: GET /splits/:projectId via Soroban RPC" <<'EOF'
Background
A backend endpoint simplifies frontend data access and caching.

Tasks
- Fetch project data from Soroban RPC
- Normalize response fields

Acceptance Criteria
- GET returns full project data for valid ID
- Returns 404 for missing project
EOF

create_issue "Backend: POST /splits to build create_project tx" <<'EOF'
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

create_issue "Backend: Add request validation middleware" <<'EOF'
Background
Input validation prevents malformed data and improves error messages.

Tasks
- Add Zod validation middleware helper
- Apply to POST endpoints

Acceptance Criteria
- Invalid requests return structured errors
- Valid requests pass through
EOF

create_issue "Backend: Add /health/ready and /health/live" <<'EOF'
Background
Separate readiness and liveness checks help deployments and uptime.

Tasks
- Add /health/live (always ok)
- Add /health/ready (checks config)

Acceptance Criteria
- Liveness returns ok immediately
- Readiness fails on missing env config
EOF

create_issue "Docs: Testnet deployment guide" <<'EOF'
Background
Contributors need clear steps to deploy and test the contract.

Tasks
- Document Soroban build and deploy commands
- Add steps for setting contract ID in frontend/backend

Acceptance Criteria
- README or docs include end-to-end testnet setup
EOF

create_issue "CI/CD: Add backend deploy workflow" <<'EOF'
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
