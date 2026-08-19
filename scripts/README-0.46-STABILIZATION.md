# 0.46 Stabilization Command Order

Run from a clean `agent/0.46-relic-chamber-reliquary` checkout after pulling the latest remote head.

1. Restore only the Fold-gated runtime files:
   - `src/App.jsx`
   - `src/tarotBridge/OracleLivingBook.jsx`
2. Apply base 0.46 integration.
3. Apply the cardId opening fix.
4. Apply the tested resolver integration.
5. Run Reliquary QA.
6. Run base integration verifier.
7. Run opening-fix verifier.
8. Run tested-resolver verifier.
9. Run behavioral regression gate.
10. Run behavioral-policy gate.
11. Run `git diff --check`.
12. Run full `npm run check`.
13. Perform Fold behavioral checklist.
14. Commit only the exact runtime files after physical acceptance.

This order is intentional: runtime code is regenerated from accepted parent shapes, then all bug fixes are layered through guarded activators so the device candidate is reproducible.
