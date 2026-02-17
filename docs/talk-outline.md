# 10-Minute Talk Outline

## 1. Problem (1 min)
- Hongbao giving should be fair, explainable, and budget-safe.
- Cultural lucky-number constraints make plain proportional rounding insufficient.

## 2. Model (2 min)
- Age curve gives relative weight by life stage.
- Role factor adjusts context (child/student/elder).
- Fairness slider blends equality and age-based weighting.

## 3. Numerical Core (3 min)
- Interpolation: linear vs natural cubic spline.
- Constrained allocation with min/max clamping and redistribution.
- Root-finding correction on scaling factor alpha after lucky rounding.

## 4. Lab Mode (2 min)
- Construct `Ax=b` from proportional constraints + budget sum.
- Compare Gaussian PP, Jacobi, Gauss-Seidel.
- Discuss residual norms and diagonal-dominance warnings.

## 5. Stability (1 min)
- Perturb age by +1 year.
- Show delta vector and amplification proxy.
- Mention floating-point and rounding effects.

## 6. UX and Deployment (1 min)
- Giver/Receiver/Lab modes.
- Local-storage persistence + JSON sharing.
- Vercel-ready Next.js build.