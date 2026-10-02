---
title: JEPA
date: 2026-10-02
tags: [jepa, world-models]
---

# JEPA

JEPA stands for Joint Embedding Predictive Architecture. It was proposed in 2022 by Yann LeCun, the French-American computer scientist, while he was chief AI scientist at Meta's FAIR lab. The original proposal is his position paper [A Path Towards Autonomous Machine Intelligence](https://openreview.net/forum?id=BZ5a1r-kVsf).

The core idea is to predict in representation space rather than pixel space. Most generative image and video models today reconstruct the missing part of an input pixel by pixel. A JEPA model instead predicts an abstract embedding of it, which lets it ignore details that are unpredictable or irrelevant.

## How it works

A JEPA model has three parts. A context encoder turns the visible part of an input into an embedding. A target encoder does the same for the hidden part. A predictor then tries to produce the target's embedding from the context's embedding. The training loss is the distance between the predicted and actual embeddings, so no pixels are ever reconstructed.

## The collapse problem

This setup has a trivial solution: if both encoders output the same embedding for every input, the prediction is always perfect and the model has learned nothing. JEPA models avoid this by not training the target encoder directly. Its weights are a slowly updated average of the context encoder's weights, and no gradients flow through it.

## Why it matters

This matters for world models. A system that has to plan needs to predict what will happen next, but not every pixel of it. Predicting in an abstract space is LeCun's proposed route to models that understand how the world behaves well enough to plan in it, rather than only generating plausible output.

Meta has since released versions for images ([I-JEPA](https://arxiv.org/abs/2301.08243)) and video ([V-JEPA](https://arxiv.org/abs/2404.08471), then [V-JEPA 2](https://arxiv.org/abs/2506.09985)).
