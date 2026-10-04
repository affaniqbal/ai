---
title: Simulation
date: 2026-10-03
tags: [simulation, world-models]
---

# Simulation

Of the three jobs a [world model](world-models.html) can do (render, simulate, plan), simulation is the one that has to get the physics right. A simulator predicts how the state of a system evolves over time, and outputs that state in a form a program can compute on, not just one a person can look at. The test is simple to state: given the current state plus an action or a time step, what is the next state, and is it physically faithful?

## Two lineages

Two different things both get called simulation.

**Classical numerical simulation** solves known governing equations on a mesh. Finite element, finite volume and computational fluid dynamics (CFD) are all of this kind.

**Learned simulation** uses neural networks to approximate the same dynamics, either from data or from the equations themselves.

The world-models conversation is really the second eating into the first. Learned simulators are either much faster, or they work where clean equations don't exist.

## Four distinctions

**State and observation.** The true state is the full physical description needed to predict the future. An observation is a partial, noisy measurement of it. A renderer goes from state to observation. A simulator goes from state to next state.

**Forward and inverse.** A forward problem starts from the state and the rules and predicts the outcome. An inverse problem starts from the outcome and infers the state or the parameters. World-model simulators are mostly forward.

**Physical fidelity and visual plausibility.** Generated video can look right while violating conservation laws. A true simulator must be right in the state variables. This is the tension in products such as Marble, which render well but do not yet simulate.

**Deterministic and stochastic.** A deterministic simulator gives one next state for a given state and action. A stochastic one gives a distribution over next states. Noisy and chaotic systems often need the stochastic framing.

## Classical methods

These are the incumbents: finite element, finite volume, finite difference and spectral methods for partial differential equations, CFD for flow, molecular dynamics at the atomic scale, and Monte Carlo for stochastic systems. They are accurate and trusted. But they are slow, and they need the equations and boundary conditions to be known in advance. In ammonia production, for example, the incumbents are process simulators such as Aspen and CFD models of the reactor.

## Learned simulators

There are four main families.

**Neural surrogates and operator learning.** A physics-informed neural network (PINN) has the governing equations built into its training loss ([Raissi, Perdikaris and Karniadakis](https://doi.org/10.1016/j.jcp.2018.10.045), 2019). A neural operator learns the map from a problem's inputs to its solution across a whole family of problems, rather than solving one instance. The best known are the [Fourier Neural Operator](https://arxiv.org/abs/2010.08895) (2020) and [DeepONet](https://arxiv.org/abs/1910.03193) (2019). Once trained, they answer in milliseconds where the solver took hours.

**Graph neural network simulators.** The system is represented as particles or mesh nodes connected by edges, and each node's state is updated from its neighbours. The landmarks are DeepMind's [Learning to Simulate](https://arxiv.org/abs/2002.09405) (2020) and [MeshGraphNets](https://arxiv.org/abs/2010.03409) (2020). They suit fluids, deformable materials and irregular geometry.

**Generative and sequence world models.** These roll dynamics forward in a latent space, as in the Dreamer line, or bend diffusion and video predictors towards physical prediction. The gap between plausibility and fidelity bites hardest here. This family is the closest to the [world-model taxonomy](world-models.html).

**Differentiable simulation.** Here the classical solver itself is made differentiable, so gradients can be passed back through the physics. That allows gradient-based control, optimisation and system identification (fitting the model's parameters to measurements). It gets less attention than the others, but it matters a great deal when the goal is to optimise a process rather than only predict it.

## Building one you can trust

A learned simulator goes through roughly five stages.

1. **Governing equations and conservation laws.** Start from what must be true: mass, momentum and energy are conserved. These become either the solver or the sanity checks.
2. **Data generation.** Learned simulators are often trained on the output of classical solvers. That needs a sampling strategy that covers the part of the state space that matters, not just the easy regions.
3. **Training.** The main choice is how much physics to inject. A purely data-driven model learns everything from examples. A physics-informed model has the equations in its loss. A physics-constrained model has an architecture that cannot violate certain laws. More physics built in means less data is needed and extrapolation is better. This trade-off is the central craft.
4. **Validation.** Check that conserved quantities are conserved. Test generalisation outside the training distribution. Watch the error over long rollouts, since small per-step errors compound. Quantify uncertainty, so it is clear when the model is guessing.
5. **Deployment.** A surrogate can sit inside an optimisation loop, drive model predictive control (MPC, see [AI abbreviations](abbreviations.html)), or run alongside the real plant as a digital twin.
