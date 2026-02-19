- **Giver Mode page**
  This is where the full allocation is run when the user presses **Calculate**.  
  What happens behind the scenes:
  age weights are built by interpolation (piecewise or natural cubic spline), then the budget split is adjusted by constraints, then lucky rounding is applied, and finally a root-finding correction (bisection or Newton with safeguards) is used to keep the rounded total near the target budget.
  Users see final amounts, difference from budget, and friendly warnings when exact matching is not possible.

- **Receiver Mode page**
  This page shows the same computed result in a read-focused way.
  Users see the rounded hongbao amounts and explanation text per person, including whether the budget match is exact or closest stable.

- **Lab (Behind the Scenes) page**
  This is the study page where numerical methods are visible.
  Users see:
  solver comparison (Gaussian elimination, Jacobi, Gauss-Seidel),
  residual metrics (`||r||2` and `||r||inf` where `r = Ax - b`),
  convergence history charts for iterative solvers,
  and sensitivity behavior from age perturbation (+1 year) to understand conditioning/error propagation.
  Floating-point effects are explicitly noted to remind that values are double-precision approximations.

## Topic-to-page mapping
- **Numerical accuracy & stability**
  Mainly visible on the **Lab** page (residuals, convergence, sensitivity), and also on **Giver/Receiver** pages through stability/exactness warnings.
- **Linear algebra (SLE)**
  Presented on the **Lab** page via `Ax = b`, residual `r = Ax - b`, and norm readouts.
- **Linear system solvers**
  Presented on the **Lab** page through side-by-side direct vs iterative solver behavior and convergence tracking.
- **Interpolation for age modeling**
  Used in **Giver Mode settings and calculation flow**, and affects final results seen by both **Giver** and **Receiver** pages.
  Lagrange is conceptual background; the live system uses piecewise linear and natural cubic spline.
- **Root finding for budget correction**
  Used in the **Giver/Receiver result flow** after lucky rounding to pull totals back toward the budget with practical stopping/safeguards.