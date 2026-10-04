---
title: LeWorldModel
date: 2026-10-02
tags: [jepa, world-models, papers]
---

# LeWorldModel

LeWorldModel (LeWM) is a small, clean example of the whole JEPA world-model idea working end to end. It is the first JEPA trained stably end to end from raw pixels, using only two terms: next-embedding prediction plus SIGReg. It needs no moving-average target encoder and no pretrained components. With 15 million parameters, it trains on a single GPU in a few hours and plans up to 48 times faster than world models built on large pretrained encoders.

This note walks through how it works. The background on JEPA, embeddings and SIGReg is in [JEPA](jepa.html). This note draws on the [paper](https://arxiv.org/abs/2603.19312) and on [AI Papers Academy's explainer](https://aipapersacademy.com/leworldmodel/).

## What it learns from

LeWM is trained on recordings of an agent acting in an environment: a sequence of camera frames plus the action taken between each pair of frames. The behaviour in the recordings doesn't need to be good, and there are no rewards or task labels. The model only has to learn how the world responds to actions, not what to do.

## The model

LeWM has two parts, about 15 million parameters in total.

- **Encoder.** A small Vision Transformer (ViT, see [AI abbreviations](abbreviations.html)) turns each frame into a single 192-number embedding. A ViT normally produces one embedding per image patch, but LeWM keeps only the summary embedding for the whole image. Each frame becomes one compact vector, roughly 200 times fewer tokens than DINO-WM, an earlier world model that uses Meta's pretrained DINO encoder.
- **Predictor.** A transformer takes the embeddings of the last few frames plus the actions taken, and predicts the embedding of the next frame.

## Training

The loss has just two terms.

1. **Prediction.** The mean squared error between the predicted embedding of the next frame and the encoder's actual embedding of it.
2. **SIGReg.** This is the anti-collapse term from LeJEPA. It projects the batch of embeddings onto 1,024 random directions, then uses a statistical test to check whether the values along each direction look like a standard bell curve (a normal distribution). Embeddings that have collapsed to one point, or squashed into a few directions, fail the test and are penalised. That forces the embeddings to stay spread out and informative.

The encoder and predictor are trained together with this one loss. There is no moving-average target encoder, no stop-gradient trick and no pretrained encoder, and only one weighting knob to tune, down from six in the nearest earlier end-to-end method. It trains in a few hours on a single GPU.

## Planning

To reach a goal, LeWM is given an image of the goal state and encodes it. It then plans by imagination.

1. Sample many candidate action sequences.
2. For each one, roll the predictor forward step by step, entirely in embedding space, to imagine where the sequence ends up.
3. Score each sequence by how close its imagined final embedding is to the goal embedding.
4. Shift the sampling towards the best sequences and repeat. This is the cross-entropy method.

The agent then carries out only the first action, looks at the new frame, and plans again. This is called model predictive control. Because each frame is a single small vector, a full plan takes about a second, against roughly 47 seconds for DINO-WM. That is where the "48 times faster" figure comes from.

## Results

It was tested on four simulated control tasks: Two-Room (navigating between rooms), Reacher (moving an arm to a target), Push-T (pushing a T-shaped block into place) and OGBench-Cube (manipulating a cube in 3D).

- LeWM beats the baselines on Push-T and Reacher. On Push-T it beats DINO-WM even when DINO-WM is also given the robot's own position data.
- DINO-WM does slightly better on OGBench-Cube, the most visually complex task, where a large pretrained encoder helps.
- LeWM does worse on Two-Room. That environment is so simple that forcing the embeddings into a spread-out Gaussian seems to over-constrain them.

## Does it understand physics?

Two checks suggest the embeddings capture real physical state.

- **Probing.** A small network trained to read the block's position out of LeWM's embeddings on Push-T recovers it almost perfectly (0.999 correlation).
- **Surprise.** Shown videos where something physically impossible happens, such as an object teleporting, LeWM's prediction error spikes. It is much more surprised by teleportation than by an object suddenly changing colour. So it has learned that objects move continuously, and treats colour as less important. This mirrors the violation-of-expectation tests used on human infants.

## Limitations

- It only plans over short horizons.
- It needs recorded data that covers enough of the possible interactions.
- It needs the actions to be labelled, which can be costly to collect.
- Visually complex scenes are harder without a big pretrained encoder.

## Related notes

- [JEPA](jepa.html) — the broader JEPA landscape
- [World models](world-models.html) — how LeWM fits with other approaches
- [Core concepts](concepts.html) — embeddings, encoders, decoders explained
