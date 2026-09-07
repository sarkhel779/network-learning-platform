# Task 1 report: lock the 23-lesson catalog contract

## Changes

- Replaced obsolete 13-lesson and module-order assertions in `src/features/catalog/catalog.repository.test.ts` with the exact approved six-module, 23-lesson curriculum.
- Added stable published-route migration assertions for the three existing public slugs and their approved titles.
- Added security-boundary assertions excluding Firewall Fundamentals, Palo Alto, IPsec, and VPN lessons.
- Added access-order assertions requiring public sections only for the first two foundations, no public OSI sections, and a final Pro Deep Dive section for all three checked lessons.
- Updated adjacency assertions for the approved curriculum order and final boundary.
- Retained unknown lesson and unknown pathway error-contract tests.

## Verification

Command executed with the bundled Node runtime:

```text
C:\Users\Pranita Pati\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules/vitest/vitest.mjs run src/features/catalog/catalog.repository.test.ts --configLoader runner
```

Result: 1 test file failed; 4 tests failed and 2 tests passed. The failures are the intended red-state catalog mismatches: the implementation still has the old 13-lesson curriculum, obsolete titles/order, missing access sections, and old adjacency.

The brief's `pnpm vitest run ...` form could not execute because the available fallback `pnpm.cmd` did not resolve the local Vitest binary (`'vitest' is not recognized`).

`git diff --check` completed with no whitespace errors.
