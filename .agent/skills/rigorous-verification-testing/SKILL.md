---
name: rigorous-verification-testing
description: >-
  Systematic verification, testing, and quality assurance workflows for large software systems before releasing changes.
---

# Rigorous Verification & Quality Assurance Skill

This skill establishes verification standards to ensure that every bug fix, refactor, or feature addition is thoroughly tested and does not cause regressions.

## Verification Checklist

1. **Static Analysis & Type Checking:**
   - Backend: run full TypeScript compilation (`npm run build` or `nest build`).
   - Frontend: verify type safety without emitting artifacts (`npx tsc --noEmit`).
   - Zero unresolved compiler errors, missing imports, or invalid typings.

2. **Regression Boundary Analysis:**
   - When modifying a shared service or utility (e.g., invoice generation, authentication, date parsing):
     - Identify all upstream callers using repository-wide symbol search (`git grep`).
     - Verify that every caller's expected return signature and behavior remain compatible.

3. **Production Parity Testing:**
   - Test queries with timezones, date formats (`YYYY-MM-DD` vs local vs UTC), and edge cases (e.g. end of month, leap years, negative quantities).
   - Ensure permissions and environment variables exist in the target environment (e.g. EC2/systemd) before deployment.

4. **Dry-Run & Verification Queries:**
   - After applying changes to a database or backend, run immediate verification queries to validate data integrity (e.g., checking totals, unassigned records, and status distributions).
