---
title: Why not just predict pixels?
date: 2026-10-02
tags: [jepa, self-supervised-learning]
---

# Why not just predict pixels?

*Opening: the obvious way to learn from images and video is to hide part of the input and reconstruct it. Say why that is wasteful.*

[JEPA](jepa.html) (Joint Embedding Predictive Architecture) is one answer: predict an abstract representation of the missing part, not the pixels themselves.

## Reconstructing pixels

*Masked autoencoders and generative models such as diffusion. What they learn well, and what they spend capacity on.*

## Comparing views

*Contrastive and related methods. What they need (augmentations, negative pairs) and where that breaks down.*

## Predicting representations

*What JEPA does differently, in two or three sentences.*

## Side by side

| Approach | What it predicts | What it needs | Main weakness |
|---|---|---|---|
| Masked autoencoder | | | |
| Contrastive | | | |
| Generative (diffusion) | | | |
| JEPA | | | |

## What I take from this

*Your own verdict.*
