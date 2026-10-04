---
title: JEPA
date: 2026-10-02
tags: [jepa, world-models]
---

# JEPA

Large language models are now everywhere, and they work remarkably well. But they learn by predicting the next word of text. Critics argue this leaves them without a grounded model of how the physical world behaves. Yann LeCun is loudest among them. Without such a model, LLMs struggle to plan, to reason about consequences of actions, or to learn as efficiently as an animal does just by watching. The proposed fix is a world model: a system that learns how the world works, often from video, and can predict what will happen next. JEPA is one strand of that effort.

JEPA stands for Joint Embedding Predictive Architecture. LeCun, the French-American computer scientist, proposed it in 2022 while he was chief AI scientist at Meta's FAIR lab. The original proposal is his position paper [A Path Towards Autonomous Machine Intelligence](https://openreview.net/forum?id=BZ5a1r-kVsf).

## Embeddings

An embedding is a list of numbers (a vector) that a neural network produces to represent an input. Similar inputs end up with nearby vectors, so the numbers capture what the model has learned is important about the input rather than its raw pixels or words. [Core concepts](concepts.html) builds this up, along with encoders and decoders.

## How JEPA works

The core idea is to predict in embedding space rather than pixel space. Most generative image and video models reconstruct the missing part of an input pixel by pixel. A JEPA model instead predicts the embedding of the missing part. That lets it ignore details that are unpredictable or irrelevant, such as the exact texture of leaves on a tree.

A JEPA model has three parts. A context encoder turns the visible part of an input into an embedding. A target encoder does the same for the hidden part. A predictor then tries to produce the target's embedding from the context's embedding. The training loss is the distance between the predicted and actual embeddings, so no pixels are ever reconstructed.

## The collapse problem

What collapses is the embeddings. The loss only asks that the predicted embedding match the target embedding. The encoders can satisfy that by cheating: if they map every input (a cat, a car, random noise) to the same vector, the prediction is always perfect and the loss is zero. But the embeddings now carry no information, and the model has learned nothing. This failure is called representation collapse.

The original JEPA models avoid it by not training the target encoder directly. No gradients flow through it, and its weights are a slowly updated average of the context encoder's weights. This works in practice, but it is a heuristic rather than a guarantee, and later work replaced it (see LeJEPA below).

## Why it matters

A system that has to plan needs to predict what will happen next, but not every pixel of it. Predicting in an abstract space is LeCun's proposed route to models that understand how the world behaves well enough to plan in it, rather than only generating plausible output.

## Other kinds of world model

JEPA is not the only approach. Generative video models predict future frames in pixels, spatial models such as Marble build 3D scenes, latent world models such as Dreamer learn a compact state by also reconstructing pixels, and learned physics simulators predict physical state directly. [World models](world-models.html) compares them.

The generative approaches render the world. JEPA bets that a model only needs to predict an abstract summary of it.

## Where it has gone since

Meta released versions for images ([I-JEPA](https://arxiv.org/abs/2301.08243), 2023) and video ([V-JEPA](https://arxiv.org/abs/2404.08471), 2024). [V-JEPA 2](https://arxiv.org/abs/2506.09985) (2025) added action-conditioned prediction. After pre-training on video, 62 hours of robot data with action labels taught it to plan pick-and-place moves on a robot arm in a lab it had never seen, by imagining the outcome of each move in embedding space. [VL-JEPA](https://arxiv.org/abs/2512.10942) (December 2025) extended the idea to vision and language: it predicts the embedding of an answer rather than generating it word by word.

[LeJEPA](https://arxiv.org/abs/2511.08544) (November 2025, Randall Balestriero and LeCun) fixed the collapse problem properly. It drops the moving-average target encoder and adds a regulariser called SIGReg (Sketched Isotropic Gaussian Regularization), which pushes the embeddings to spread out evenly in every direction. Since the embeddings can no longer all sit at one point, collapse is ruled out by construction.

[LeWorldModel](lewm.html) (LeWM, March 2026, Lucas Maes, Quentin Le Lidec, Damien Scieur, LeCun and Balestriero) applies this to world models. It is the first JEPA trained stably end to end from raw pixels, using only two terms: next-embedding prediction plus SIGReg. It needs no moving-average target encoder and no pretrained components. With 15 million parameters, it trains on a single GPU in a few hours and plans up to 48 times faster than world models built on large pretrained encoders. The linked note walks through how it works.

LeCun left Meta at the end of 2025 to found AMI Labs (Advanced Machine Intelligence) and continue this line of work.

## Related notes

- [World models](world-models.html) — the broader landscape
- [Core concepts](concepts.html) — embeddings, encoders, decoders explained
- [LeWorldModel](lewm.html) — a clean example of JEPA working end to end
