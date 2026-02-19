<img width="841" height="239" alt="FairFortune Banner" src="https://github.com/user-attachments/assets/bd9f3a7a-eade-4311-bb48-8444ffc4c61e" />

# FairFortune: A Budget-Constrained Hongbao System

**Author:** Taechasith Kangkhuntod  
Human–Computer Interaction & Computational Design  
Bangkok, Thailand — February 2026  

**Live System:** https://fair-fortune.vercel.app/

**Acknowledgements:**  
This project was assigned and supervised by **Serhii Denysov**, Harbour.Space Institute of Technology, for the **Mathematical Foundations of Computing (M8 — BKK — 2026)** module. The numerical foundations and algorithmic structure of this system were developed within that course.

---

# Abstract

FairFortune is a culturally-aware web platform that formalizes Chinese New Year hongbao allocation as a numerical computing problem while preserving emotional, relational, and ritual meaning. The system integrates spline-based age modeling, systems of linear equations, iterative solvers, root-finding correction, culturally-aware rounding rules, and stability diagnostics within a collaborative giver–receiver interaction model.

Unlike traditional calculators, FairFortune emphasizes **explainability, transparency, and human-centered interaction**. The system supports both family ritual use and academic exploration of numerical algorithms.

---

# 1. Introduction

Hongbao (red envelope) giving during Chinese New Year (ตรุษจีน) represents intergenerational respect, blessing, and continuity. However, allocation decisions are often:

- subjective  
- inconsistent  
- emotionally stressful  
- opaque to recipients  

FairFortune reframes hongbao allocation as a constrained numerical system while embedding it within a collaborative interaction environment between giver and receiver.

This project bridges:

- Human–Computer Interaction (HCI)
- Numerical Methods
- Cultural Computing
- Explainable Systems Design

---

# 2. System Overview

FairFortune consists of:

## A. Allocation Engine (Numerical Core)

Implements:

- Age-based weighting via natural cubic splines
- Budget constraint enforcement via linear systems
- Iterative solvers (Jacobi, Gauss–Seidel)
- Direct solver (Gaussian elimination)
- Culturally-aware rounding module
- Root-finding correction (Bisection + safeguarded Newton)
- Stability & sensitivity diagnostics

## B. Collaboration Layer (Current Production Version)

The deployed system now includes real-time giver–receiver collaboration:

- Account authentication
- Project creation
- Secure two-user room model
- Messaging
- Gratitude logging
- Bank detail sharing
- Transfer slip image upload

This expands FairFortune from a computational tool into a **shared digital ritual space**.

---

# 3. Mathematical Foundations

## 3.1 Age-Based Weighting

We define:

Amount(age) = Base × f(age)

Where f(age) is computed via:

- Piecewise interpolation
- Natural cubic spline:
  - S(x_i) = y_i
  - S, S', S'' continuous
  - S''(x0) = S''(xn) = 0

This ensures smooth transitions across life stages.

---

## 3.2 Linear System Formulation

Constraints are modeled as:

A x = b

Where:

- x = allocation vector
- A = constraint matrix
- b = target vector (budget, proportional relationships)

Solvers:

- Gaussian Elimination (direct)
- Jacobi Iteration
- Gauss–Seidel Iteration

Residuals:

r = A x − b  
||r||₂ and ||r||∞ reported in Lab Mode

---

## 3.3 Culturally-Aware Rounding

Steps:

1. Round to base unit (10 or 100)
2. Avoid forbidden endings (e.g., 4)
3. Prefer lucky endings (e.g., 8, 9)
4. Respect bounds

---

## 3.4 Root-Finding Correction

Define:

F(α) = Σ RoundLucky(α · raw_i) − Budget

Solve:

F(α) = 0

Using:

- Bisection (robust)
- Newton (accelerated with safeguards)

---

## 3.5 Stability & Sensitivity

Supports:

- Age perturbation experiments
- Output delta visualization
- Convergence behavior inspection
- Conditioning intuition

---

## 3.6 How Each Algorithm Is Used in FairFortune

- **Natural Cubic Spline (`lib/math/ageCurve.ts`)**  
  Used to generate smooth age-to-weight mapping so gift recommendations do not jump sharply between nearby ages.

- **Gaussian Elimination (`lib/math/linearAlgebra.ts`)**  
  Used as the direct solver path when the allocation constraints are solved from matrix form in one deterministic pass.

- **Jacobi Iteration (`lib/math/solvers.ts`)**  
  Used in Lab Mode to demonstrate iterative convergence behavior and compare speed/stability against other methods.

- **Gauss-Seidel Iteration (`lib/math/solvers.ts`)**  
  Used as a faster iterative alternative to Jacobi in many diagonally dominant cases, with residual tracking for learning.

- **Root Finding: Bisection + Newton (`lib/math/rootFinding.ts`)**  
  Used after lucky-number rounding to correct budget drift by solving for a scale factor so final rounded totals stay close to target budget.

- **Lucky Rounding Rules (`lib/math/luckyRounding.ts`)**  
  Used to enforce cultural constraints (avoid endings, prefer lucky endings, rounding units) while keeping allocations explainable.

- **Allocation Orchestration (`lib/math/engine.ts`)**  
  Combines age weighting, constraint solving, rounding, and correction into the final per-recipient result shown in Giver/Receiver modes.

---

# 4. Current Production Version Features

## What Is Included Now

- Login and registration
- Privacy consent modal
- Project creation with custom situation (family/work/custom text)
- Secure room code collaboration
- Receiver bank details storage
- Gratitude notes saved in room
- Messaging system:
  - Private messages
  - Room-visible messages
- Giver transfer slip image upload
- Allocation engine with explanation panel
- Warning indicators
- Dark mode and light mode support

---

# 5. Main User Flows

1. User registers or logs in
2. Giver creates project and receives room code
3. Giver shares room code
4. Receiver joins room
5. Receiver adds bank details
6. Messaging and gratitude exchange
7. Giver runs allocation and reviews explanation
8. Giver uploads transfer slip

---

# 6. Privacy and Access Model

- Each room limited to:
  - One giver
  - One receiver
- Receiver slot locks after assignment
- Private messages visible only to sender + intended recipient
- File-based server storage (temporary persistence)

---

# 7. Technical Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Local JSON scenario storage (browser)
- File-based server persistence (room/auth/project)

---

# 8. Project Structure

- `app/login/page.tsx`
- `app/giver/page.tsx`
- `app/receiver/page.tsx`
- `app/api/auth/*`
- `app/api/projects/route.ts`
- `app/api/rooms/*`
- `lib/server/collabStore.ts`
- `lib/math/*`

---

# 9. Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```
