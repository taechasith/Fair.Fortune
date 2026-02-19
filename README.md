# FairFortune: A Budget-Constrained Hongbao System  
**Author:** Taechasith Kangkhuntod  
**Field:** Human–Computer Interaction (HCI) + Numerical Algorithms  

<img width="841" height="239" alt="image" src="https://github.com/user-attachments/assets/bd9f3a7a-eade-4311-bb48-8444ffc4c61e" />

**Live Demo:** https://fair-fortune.vercel.app/

---

## Abstract

Hongbao giving during Chinese New Year (ตรุษจีน) is a culturally significant practice that involves distributing monetary gifts according to family relationships, age expectations, and tradition. Despite its social importance, the process is often informal and inconsistent, and can produce confusion or perceived unfairness. **FairFortune** is a web-based system that formalizes hongbao allocation as a set of *numerical problems*—including interpolation/splines for age weighting, solving linear systems for constraints, culturally-aware rounding rules, and root-finding to correct post-rounding budget drift. The system provides transparent, explainable allocations for both givers and receivers, and includes a lab mode that supports solver comparison and numerical behavior analysis for educational use.

---

## 1. Introduction

Chinese New Year hongbao (อั่งเปา / 红包) giving is a ritual that communicates care, respect, and generational continuity. In practice, however, families must balance multiple competing factors:

- a fixed total budget,
- different recipient ages and roles,
- cultural preferences for “lucky numbers,” and
- perceived fairness and consistency.

FairFortune addresses this as an HCI + numerical algorithms design problem: **how to digitize a traditional ritual without reducing it to a black-box calculator**, and how to make the reasoning visible enough to strengthen trust and family bonds.

---

## 2. Motivation and Background

### 2.1 Cultural and interaction motivation
Hongbao allocation decisions are often made quickly and privately. This can lead to:
- confusion (“why did I get this amount?”),
- stress for the giver (“did I do it fairly?”), and
- weakened ritual meaning when the process feels arbitrary.

FairFortune reframes the ritual as an *interactive, explainable allocation experience* that encourages reflection rather than replacing human judgment.

### 2.2 Numerical foundations motivation
The allocation task naturally maps to numerical computing topics taught in the module:
- floating-point behavior and rounding,
- interpolation and natural cubic splines,
- systems of linear equations (direct + iterative methods),
- root-finding (bisection/Newton),
- stability, sensitivity, and conditioning.

---

## 3. System Overview

FairFortune provides three user modes designed around distinct HCI goals:

### 3.1 Giver Mode (planning + control)
**Goal:** Help a giver produce a fair plan that respects budget and cultural preferences.

**Key interactions**
- input total budget and recipients (name, age, optional role weight, optional min/max),
- configure “lucky number” rounding rules (avoid/prefer endings, rounding unit),
- set fairness style (more equal vs more age-weighted),
- run allocation and review explainable results.

**Outputs**
- per-recipient suggested amounts,
- fairness and stability indicators,
- warnings when constraints/rounding prevent exact satisfaction.

---

### 3.2 Receiver Mode (explainability + bonding)
**Goal:** Turn the output into understanding and gratitude (not just a number).

**Key interactions**
- select a recipient profile,
- view “why this amount” explanations,
- see age curve visualization and rounding effects,
- optional gratitude note / message artifact.

---

### 3.3 Lab Mode (education + comparison)
**Goal:** Support numerical methods learning through interactive experimentation.

**Key interactions**
- compare solvers (Gaussian elimination, Jacobi, Gauss–Seidel),
- view convergence history and residual norms,
- perturb inputs (e.g., age + 1) and observe sensitivity,
- explore when iterative solvers converge/fail (diagonal dominance intuition).

---

## 4. Methods and Algorithms

### 4.1 Age-based weighting via interpolation / splines
To avoid unrealistic “step function” behavior across ages, FairFortune models a smooth weighting function:

`Amount(age) = Base × f(age)`

Where `f(age)` is estimated from anchor points (life-stage weights) using:
- **piecewise interpolation** and/or
- **natural cubic spline** (default).

Natural cubic spline constraints are used to enforce smoothness:
- interpolation at anchor points,
- continuity of `S`, `S'`, and `S''`,
- natural boundary conditions `S''(x0)=0`, `S''(xn)=0`.

**HCI rationale:** Smooth curves better match user expectations of gradual change with age, improving perceived fairness.

---

### 4.2 Constraint formulation via systems of linear equations (SLE)
Allocation under constraints can be expressed as:

`A x = b`

Where:
- `x` is the vector of allocations,
- `A` encodes constraints (budget sum, proportional relationships),
- `b` encodes the budget target and constraint constants.

Solvers supported (for analysis + learning):
- **Gaussian elimination (direct)**  
- **Jacobi iteration (iterative)**  
- **Gauss–Seidel iteration (iterative)**  

Lab Mode exposes residual computation:
- `r = A x − b`
- norms such as `||r||₂` and `||r||∞` for convergence tracking.

---

### 4.3 Culturally-aware rounding and lucky-number rules
Hongbao amounts often follow culturally meaningful numerals (e.g., avoid 4; prefer 8/9), and are frequently rounded to units like 10 or 100.

FairFortune implements deterministic rounding:
1. round to base unit,
2. adjust away from forbidden endings,
3. optionally move toward preferred endings using minimal adjustment,
4. respect min/max bounds where applicable.

**HCI rationale:** The system treats “lucky numbers” as first-class user constraints rather than optional decoration.

---

### 4.4 Root-finding to correct post-rounding budget drift
Rounding changes totals. FairFortune introduces a scale parameter `α`:

`F(α) = Σ RoundLucky(α · raw_i) − Budget`

and solves `F(α)=0` using:
- **Bisection** (robust bracketing-based method),
- **Newton’s method** (faster, with safeguards; derivative may be approximated numerically).

If exact equality is impossible under the selected rounding unit and constraints, the system returns the closest feasible solution and provides an explicit warning.

---

### 4.5 Stability and sensitivity diagnostics
FairFortune supports:
- **input perturbation** (e.g., age + 1),
- comparison of output deltas,
- residual and convergence reporting,
- warnings when results are sensitive to small changes.

**Educational rationale:** Connects numerical stability concepts to a familiar cultural scenario.

---

## 5. Implementation

FairFortune is implemented as a client-side web application designed for deployment on Vercel.

**Implementation goals**
- fast iteration and low barrier for demo use,
- privacy-first (no required backend),
- transparent math engine with separated modules,
- visual explanations and charts for learning and trust.

**Typical components**
- recipients manager (CRUD),
- settings for rounding/lucky rules,
- solver selector and metrics output,
- charts for age curve and convergence histories,
- JSON export/import for sharing scenarios.

---

## 6. Evaluation and Use Cases

### 6.1 Family use case (ritual support)
A family configures recipients across ages and roles, sets a budget, and applies lucky-number rules. The system generates allocations and explains tradeoffs between:
- equality vs age-weighting,
- rounding preferences vs exact budget satisfaction,
- constraint limits vs fairness perception.

Outcome: improved clarity (“why this amount?”) and reduced giver stress.

### 6.2 Educational use case (numerical methods learning)
Students compare direct vs iterative solvers, observe convergence behavior, and test sensitivity. The system acts as an interactive companion to course concepts such as:
- residual norms,
- diagonal dominance intuition,
- rounding error,
- stability and sensitivity.

---

## 7. Discussion

FairFortune demonstrates that numerical algorithms can be used to support cultural practices without stripping them of meaning. The HCI contribution is not merely computation, but *interaction design for transparency*: users can see why results occur, explore alternatives, and communicate across generations through explainable outputs.

At the same time, the system provides an applied sandbox for numerical methods—connecting abstract course content to a culturally grounded, real-world decision process.

---

## 8. Conclusion

FairFortune is an HCI-driven numerical system that digitizes hongbao allocation as a transparent, culturally-aware computational process. It supports families through explainable fairness planning, and supports education through solver comparison, convergence visualization, and sensitivity experiments.

---

## Acknowledgements

This project was assigned and supervised by **Serhii Denysov** at **Harbour.Space Institute of Technology** for the **Mathematical Foundations of Computing (M8 — BKK — 2026)** module.

---
