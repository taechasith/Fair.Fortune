# FairFortune: A Budget-Constrained Hongbao System

FairFortune is a Next.js 14 + TypeScript web app for allocating a fixed hongbao budget with explainable numerical methods.

## Concept
- Giver Mode: configure budget, recipients, fairness, lucky-number rules, and run allocation.
- Receiver Mode: inspect one recipient's final amount and explanation.
- Lab Mode: compare linear solvers, convergence behavior, and sensitivity to perturbations.

## Algorithms
- Age curve interpolation:
  - Piecewise linear interpolation
  - Natural cubic spline (`S''(x_0)=S''(x_n)=0`)
- Target weights:
  - `w_i = ageWeight(age_i) * roleFactor_i`
  - `w_i' = (1-?)*1 + ?*w_i`
  - `p_i = w_i' / Sw_i'`
- Continuous allocation:
  - `x_i = Budget * p_i`
  - Bounds via iterative clamp + proportional redistribution
- Lucky rounding:
  1. round to unit (10/100)
  2. avoid forbidden endings
  3. prefer lucky endings by nearest minimal adjustment
- Budget correction after rounding:
  - `F(a)=SRoundLucky(a*x_i)-Budget`
  - Bisection with bracket expansion
  - Newton with numerical derivative and bisection fallback
- Lab linear systems:
  - Gaussian elimination with partial pivoting
  - Jacobi iteration
  - Gauss-Seidel iteration
  - residual norms `||r||_2`, `||r||_8`

## Tech Stack
- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn-style UI primitives
- Recharts
- Vitest

## Local Run
```bash
npm install
npm run dev
```

## Build and Test
```bash
npm run test
npm run build
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import project in Vercel.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Deploy.

## Persistence
- Local storage key: `fairfortune_state_v1`
- JSON export/import supported in Giver Mode.

## Folder Structure
- `app/` routes: landing, giver, receiver, lab
- `components/` UI + feature components
- `lib/math/` numerical engine modules
- `lib/state/` defaults + local storage helpers
- `lib/types/` shared strict TypeScript types
- `tests/` Vitest unit tests
- `docs/` short talk outline and demo script