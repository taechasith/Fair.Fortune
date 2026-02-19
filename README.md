<img width="841" height="239" alt="image" src="https://github.com/user-attachments/assets/bd9f3a7a-eade-4311-bb48-8444ffc4c61e" />

# FairFortune: A Budget-Constrained Hongbao System  
**Author:** Taechasith Kangkhuntod  
**Field:** Human–Computer Interaction (HCI) + Numerical Algorithms  
**Last Update:** 02/19/2026  
**Live Demo:** https://fair-fortune.vercel.app/

**Acknowledgements:**  
This project was assigned and supervised by **Serhii Denysov** (Harbour.Space Institute of Technology) for the **Mathematical Foundations of Computing (M8 — BKK — 2026)** module.

---

## Abstract
Hongbao giving during Chinese New Year (ตรุษจีน) is a culturally significant practice that involves distributing monetary gifts according to family relationships, age expectations, and tradition. Despite its social importance, the process is often informal and inconsistent, and can produce confusion or perceived unfairness. **FairFortune** is a web-based system that formalizes hongbao allocation as a set of *numerical problems*—including interpolation/splines for age weighting, solving linear systems for constraints, culturally-aware rounding rules, and root-finding to correct post-rounding budget drift. Beyond calculation, FairFortune integrates giver/receiver collaboration (room code pairing, bank details, gratitude notes, and messaging) to preserve the relational meaning of the ritual while making decisions transparent and explainable.

---

## 1. Introduction
Chinese New Year hongbao (อั่งเปา / 红包) giving is a ritual that communicates care, respect, and generational continuity. In practice, families must balance a fixed budget, multiple recipients with different ages and roles, culturally meaningful “lucky number” patterns, and perceived fairness. FairFortune treats this as an HCI + numerical algorithms design problem: **how to digitize a traditional ritual without turning it into a black-box calculator**, and how to make the reasoning legible enough to build trust and strengthen relationships.

---

## 2. Motivation and Background

### 2.1 Cultural and interaction motivation
Hongbao decisions are often made quickly and privately. This can lead to:
- confusion (“why did I get this amount?”),
- stress for the giver (“did I do it fairly?”),
- weakened ritual meaning when the process feels arbitrary.

FairFortune reframes the ritual as an *interactive, explainable allocation experience* and adds structured collaboration so that planning and receiving become a shared, respectful interaction rather than one-sided output.

### 2.2 Numerical foundations motivation
The allocation task maps directly to numerical computing topics taught in the module:
- floating-point behavior and rounding,
- interpolation and natural cubic splines,
- systems of linear equations (direct + iterative methods),
- root-finding (bisection/Newton),
- stability, sensitivity, and conditioning.

---

## 3. System Overview
FairFortune supports three modes designed around distinct user goals.

### 3.1 Giver Mode (planning + control)
**Goal:** help a giver produce a fair plan that respects budget and cultural preferences.

**Key interactions**
- input total budget and recipients (name, age, optional role weight, optional min/max),
- configure “lucky number” rounding rules (avoid/prefer endings, rounding unit),
- set fairness style (more equal vs more age-weighted),
- run allocation and review explainable results and warnings,
- collaborate with the receiver in a shared room (messages, notes, bank details, transfer slip).

**Outputs**
- per-recipient suggested amounts,
- explanation panel and constraint warnings,
- fairness/stability indicators.

### 3.2 Receiver Mode (explainability + bonding)
**Goal:** turn an amount into understanding and gratitude.

**Key interactions**
- join the giver’s room via code,
- add bank details for real transfer workflow,
- view “why this amount?” explanation,
- write gratitude notes and communicate in-room.

### 3.3 Lab Mode (education + comparison)
**Goal:** support numerical methods learning through interactive experimentation.

**Key interactions**
- compare solvers (Gaussian elimination, Jacobi, Gauss–Seidel),
- view convergence history and residual norms,
- perturb inputs (e.g., age + 1) and observe sensitivity,
- explore when iterative solvers converge/fail (diagonal dominance intuition).

---

## 4. Methods and Algorithms

### 4.1 Age-based weighting via interpolation / splines
To avoid unrealistic stepwise behavior across ages, FairFortune models a smooth weighting function:

`Amount(age) = Base × f(age)`

Where `f(age)` is estimated from anchor points (life-stage weights) using:
- piecewise interpolation and/or
- **natural cubic spline** (default).

Natural cubic spline constraints enforce smoothness:
- interpolation at anchor points,
- continuity of `S`, `S'`, and `S''`,
- natural boundary conditions `S''(x0)=0`, `S''(xn)=0`.

**HCI rationale:** smooth curves better match how people expect fairness to evolve with age, improving perceived legitimacy.

### 4.2 Constraint formulation via systems of linear equations (SLE)
Allocation under constraints can be expressed as:

`A x = b`

Where:
- `x` is the allocation vector,
- `A` encodes constraints (budget sum, proportional relationships),
- `b` encodes the budget target and constraint constants.

Solvers supported (for analysis + learning):
- **Gaussian elimination (direct)**
- **Jacobi iteration (iterative)**
- **Gauss–Seidel iteration (iterative)**

Lab Mode exposes residual computation:
- `r = A x − b`
- norms such as `||r||₂` and `||r||∞` for convergence tracking.

### 4.3 Culturally-aware rounding and lucky-number rules
Hongbao amounts often follow culturally meaningful numerals (e.g., avoid 4; prefer 8/9) and are commonly rounded to units like 10 or 100.

FairFortune implements deterministic rounding:
1. round to base unit,
2. adjust away from forbidden endings,
3. optionally move toward preferred endings using minimal adjustment,
4. respect min/max bounds where applicable.

### 4.4 Root-finding to correct post-rounding budget drift
Rounding changes totals. FairFortune introduces a scale parameter `α`:

`F(α) = Σ RoundLucky(α · raw_i) − Budget`

and solves `F(α)=0` using:
- **Bisection** (robust bracketing-based method),
- **Newton’s method** (faster, with safeguards; derivative may be approximated numerically).

If exact equality is impossible under the selected rounding unit and constraints, the system returns the closest feasible solution and explicitly warns the user.

### 4.5 Stability and sensitivity diagnostics
FairFortune supports:
- input perturbation (e.g., age + 1),
- output delta comparison,
- residual/convergence reporting,
- warnings when results are sensitive to small changes.

This links numerical stability to a familiar cultural scenario.

---

## 5. FairFortune (Current Version)
FairFortune is a Next.js web app for culturally aware hongbao planning with giver/receiver collaboration.

### What Is Included Now
- login and registration
- privacy consent modal on login
- project creation with custom situation (family, work, or any text)
- room code collaboration between giver and receiver
- receiver bank details in room
- gratitude notes saved in room
- messaging in room with visibility options:
  - **Private** (between the two room members)
  - **Room-visible**
- giver transfer slip image upload
- allocation engine with explanation panel and warnings
- dark mode and light mode support

### Main User Flows
1. user signs up or logs in  
2. giver creates a project and gets a room code  
3. giver shares room code with receiver  
4. receiver joins room and adds bank details  
5. both sides send messages and gratitude notes  
6. giver runs allocation and reviews explanation  

### Privacy and Access Model
- room access is limited to two users:
  - one giver
  - one receiver
- if a receiver is already assigned, other users cannot join that room
- private messages are only visible to sender and intended recipient

---

## 6. Implementation

### Tech Stack
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- local JSON persistence for scenario state (browser)
- server-side room/auth/project store using JSON file or temp storage

### Project Structure (Important Parts)
- `app/login/page.tsx` — login/register + consent UI
- `app/giver/page.tsx` — giver workflow, project + room code + messaging
- `app/receiver/page.tsx` — receiver workflow, bank details + notes + messaging
- `app/api/auth/*` — login/register/session APIs
- `app/api/projects/route.ts` — project list/create API
- `app/api/rooms/*` — room create/join/get/message/note/bank APIs
- `lib/server/collabStore.ts` — server data model and persistence
- `lib/math/*` — allocation and numerical methods engine

---

## 7. Run Locally
```bash
npm install
npm run dev
