# Reward Gaming Platform Security Spec

## Data Invariants
1. **Coin Ownership Integrity**: Users can only modify their own profiles. Coin balances can only be updated if transaction logs exist synchronously, or verified via game success. Users cannot adjust other players' balances.
2. **Read Restrictiveness**: A user cannot read another user's coin history or transaction entries. Leaderboards are public query projections of public fields like display names and coin totals, but private PII (such as emails) is strictly inaccessible.
3. **Immutability of Log History**: All items written to the `transactions` or `referrals` collections are strictly read-only after creation (immutable `createdAt` and values).
4. **Referral Reward Integrity**: Referrals require unique references. Referral rewards can only be claimed once, and the referrer Uid must exist and match a valid, registered user profile.

---

## The "Dirty Dozen" Threat Payloads
Here are 12 malicious payloads intended to breach security, all of which will be rejected by our secure rules:

1. **Self-Awarding Coins / Client Spoofing**: `PUT /users/attacker-uid` changing `coins: 999999` directly via client-side code.
2. **Altering Another User's Wallet**: `PUT /users/victim-uid` changing and depleting their `coins` count.
3. **Fake Referral Self-Claiming**: `POST /referrals/new-id` claiming a referral reward with nonexistent or matching `referrerUid` equals `newUserUid`.
4. **Transaction Counterfeiting (System Credit Injection)**: `POST /transactions/faked-id` creating a high coin credit with source `admin` set by standard client.
5. **Score Injection Bypass**: `POST /game_sessions/faked-id` setting direct high score with maximum coins earned without executing the actual Phaser engine constraints.
6. **Altering Log History**: `UPDATE /transactions/existing-id` changing the coin amount or type after a ledger entry is already written.
7. **Identity Theft / User Cloaking**: Doing `POST /users/victim-uid` when signing up to hijack an existing account ID.
8. **PII Data Scraping**: Performing collection queries on `/users` to grab emails of other players.
9. **Referral Infinite Loop / Circular References**: Designing referral nodes with cyclical IDs or double-claiming a referral.
10. **State short-circuiting**: Setting `isAdmin: true` dynamically during client-side registration.
11. **Null ID / Injection Attack**: Sending massive junk IDs like `users/../../../etc/passwd` or extremely bloated 1MB keys to crash index paths.
12. **Future Timestamp Spoofing**: Injecting `createdAt: "2050-01-01T00:00:00Z"` rather than standard `request.time`.

---

## Firestore Rules Structure

The final `firestore.rules` checks authentication state, compares incoming document types and schemas, prevents updating system-assigned fields (e.g., `isAdmin`, `coins` via direct updates), and enforces the master validation blueprint.
