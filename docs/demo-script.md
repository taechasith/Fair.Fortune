# Demo Script (10 minutes)

1. Open `/` and introduce the 3 modes.
2. Go to `/giver`.
3. Edit recipient list: add one child, one elder, set min/max for one person.
4. Set budget to 888, fairness slider near 0.75.
5. Keep lucky rules: avoid `4`, prefer `8,9`, rounding unit `10`.
6. Run allocation and explain:
   - total check
   - alpha correction
   - exact/best-effort warning logic
7. Export JSON and re-import it.
8. Go to `/receiver`:
   - pick a recipient
   - show explanation + age curve chart
   - enter gratitude note
9. Go to `/lab`:
   - show solver table and residual norms
   - inspect convergence chart
   - run perturbation (+1 age) and discuss delta vector and amplification
10. Conclude with deployment readiness (`npm run build`, Vercel).