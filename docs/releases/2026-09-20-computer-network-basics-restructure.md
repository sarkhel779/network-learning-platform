# Computer Network Basics release checklist

## Verified locally

- [x] Full unit and component suite passed: `vitest run --pool=forks --maxWorkers=1` — 270 files, 1,358 tests
- [x] Type checking passed
- [x] Lint passed
- [x] Production build passed
- [ ] Local database reset and SQL tests passed — blocked because Docker or Podman is not installed on this computer
- [ ] Local dark/light and desktop/mobile browser review passed

## Before merge

- [ ] Vercel preview reviewed
- [ ] Production Supabase backup verified
- [ ] Pull request approved and merged to `main`

## Production rollout

- [ ] Apply `202609200002_computer_network_basics_restructure.sql` only after the backup gate is confirmed
- [ ] Confirm the Vercel production deployment is Ready
- [ ] Smoke-test all eight public lessons and the account-only final quiz
- [ ] Confirm quiz answers are the only completion mechanism
- [ ] Confirm `/learn/networking-foundations/hubs-bridges-and-switches` redirects to `/learn/networking-foundations/hubs`
- [ ] Confirm the relocated lesson URLs and sitemap remain available

## Rollback rule

Do not delete learner progress rows. If the application deployment must be rolled back, redeploy the previous application commit and leave the additive manifests and carry-forward history intact.
