#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token, Address, Env, String, Symbol, Vec,
};

// ============================================================
//  TEST HELPERS
// ============================================================

fn create_test_env() -> (Env, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Deploy a mock token contract (represents USDC or XLM)
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());

    (env, token_admin, token_contract)
}

fn make_collaborators(env: &Env, addresses: Vec<Address>, bps: Vec<u32>) -> Vec<Collaborator> {
    let mut collabs = Vec::new(env);
    for (addr, bp) in addresses.iter().zip(bps.iter()) {
        collabs.push_back(Collaborator {
            address: addr.clone(),
            alias: String::from_str(env, "Test User"),
            basis_points: bp,
        });
    }
    collabs
}

// ============================================================
//  CREATION TESTS
// ============================================================

#[test]
fn test_create_project_success() {
    let (env, _admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice.clone(), bob.clone()]),
        Vec::from_slice(&env, &[6000u32, 4000u32]), // 60% / 40%
    );

    client.create_project(
        &owner,
        &Symbol::new(&env, "afrobeats_vol3"),
        &String::from_str(&env, "Afrobeats Vol. 3"),
        &String::from_str(&env, "music"),
        &token,
        &collabs,
    );
    assert_eq!(client.get_project_count(), 1);

    let project = client.get_project(&Symbol::new(&env, "afrobeats_vol3")).unwrap();
    assert_eq!(project.collaborators.len(), 2);
    assert_eq!(project.locked, false);
    assert_eq!(project.total_distributed, 0);
}

#[test]
fn test_create_project_fails_invalid_split() {
    let (env, _admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    // 60% + 30% = 90% — does NOT sum to 100%
    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice.clone(), bob.clone()]),
        Vec::from_slice(&env, &[6000u32, 3000u32]),
    );

    let result = client.try_create_project(
        &owner,
        &Symbol::new(&env, "bad_split"),
        &String::from_str(&env, "Bad Split Project"),
        &String::from_str(&env, "music"),
        &token,
        &collabs,
    );

    assert_eq!(result, Err(Ok(SplitError::InvalidSplit)));
}

#[test]
fn test_create_project_fails_too_few_collaborators() {
    let (env, _admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);

    // Only 1 collaborator — minimum is 2
    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice.clone()]),
        Vec::from_slice(&env, &[10000u32]),
    );

    let result = client.try_create_project(
        &owner,
        &Symbol::new(&env, "solo"),
        &String::from_str(&env, "Solo Project"),
        &String::from_str(&env, "art"),
        &token,
        &collabs,
    );

    assert_eq!(result, Err(Ok(SplitError::TooFewCollaborators)));
}

#[test]
fn test_create_project_fails_duplicate_id() {
    let (env, _admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice.clone(), bob.clone()]),
        Vec::from_slice(&env, &[5000u32, 5000u32]),
    );

    // First creation — should succeed
    client.create_project(
        &owner,
        &Symbol::new(&env, "dup_test"),
        &String::from_str(&env, "Duplicate Test"),
        &String::from_str(&env, "film"),
        &token,
        &collabs.clone(),
    );

    // Second creation with same ID — should fail
    let result = client.try_create_project(
        &owner,
        &Symbol::new(&env, "dup_test"),
        &String::from_str(&env, "Duplicate Test"),
        &String::from_str(&env, "film"),
        &token,
        &collabs,
    );

    assert_eq!(result, Err(Ok(SplitError::ProjectExists)));
}

// ============================================================
//  LOCK TESTS
// ============================================================

#[test]
fn test_lock_project_success() {
    let (env, _admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice, bob]),
        Vec::from_slice(&env, &[7000u32, 3000u32]),
    );

    client.create_project(
        &owner,
        &Symbol::new(&env, "nollywood_film"),
        &String::from_str(&env, "Nollywood Feature Film"),
        &String::from_str(&env, "film"),
        &token,
        &collabs,
    );

    client.lock_project(&Symbol::new(&env, "nollywood_film"), &owner);

    let project = client.get_project(&Symbol::new(&env, "nollywood_film")).unwrap();
    assert_eq!(project.locked, true);
}

// ============================================================
//  DISTRIBUTION TESTS
// ============================================================

#[test]
fn test_distribute_splits_correctly() {
    let (env, _token_admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    // 50% / 30% / 20% split
    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice.clone(), bob.clone(), carol.clone()]),
        Vec::from_slice(&env, &[5000u32, 3000u32, 2000u32]),
    );

    client.create_project(
        &owner,
        &Symbol::new(&env, "podcast_ep1"),
        &String::from_str(&env, "Podcast Episode 1"),
        &String::from_str(&env, "podcast"),
        &token,
        &collabs,
    );

    // Fund the contract with 1000 tokens (in stroops = 1000 * 10^7)
    let token_client = token::StellarAssetClient::new(&env, &token);
    token_client.mint(&contract_id, &1_000_0000000i128);

    // Distribute
    client.distribute(&Symbol::new(&env, "podcast_ep1"));

    // Check balances: 50%, 30%, 20% of 1000 tokens
    let token_balance = token::Client::new(&env, &token);
    assert_eq!(token_balance.balance(&alice), 500_0000000i128);  // 50%
    assert_eq!(token_balance.balance(&bob),   300_0000000i128);  // 30%
    assert_eq!(token_balance.balance(&carol), 200_0000000i128);  // 20%

    // Check claimed ledger
    assert_eq!(client.get_claimed(&Symbol::new(&env, "podcast_ep1"), &alice), 500_0000000i128);

    // Check project total_distributed updated
    let project = client.get_project(&Symbol::new(&env, "podcast_ep1")).unwrap();
    assert_eq!(project.total_distributed, 1_000_0000000i128);
}

#[test]
fn test_distribute_fails_no_balance() {
    let (env, _admin, token) = create_test_env();
    let contract_id = env.register_contract(None, SplitNairaContract);
    let client = SplitNairaContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let collabs = make_collaborators(
        &env,
        Vec::from_slice(&env, &[alice, bob]),
        Vec::from_slice(&env, &[5000u32, 5000u32]),
    );

    client.create_project(
        &owner,
        &Symbol::new(&env, "empty_project"),
        &String::from_str(&env, "Empty Project"),
        &String::from_str(&env, "art"),
        &token,
        &collabs,
    );

    // No tokens deposited — distribute should fail
    let result = client.try_distribute(&Symbol::new(&env, "empty_project"));
    assert_eq!(result, Err(Ok(SplitError::NoBalance)));
}
