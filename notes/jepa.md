---
title: JEPA
date: 2026-10-02
tags: [jepa, world-models]
---

# JEPA

Large language models are now everywhere, and they work remarkably well. But they learn by predicting the next word of text. Critics, Yann LeCun loudest among them, argue that this leaves them without a grounded model of how the physical world behaves. Without one, they struggle to plan, to reason about the consequences of actions, or to learn as efficiently as an animal does just by watching. The proposed fix is a world model: a system that learns how the world works, often from video, and can predict what will happen next. JEPA is one strand of that effort.

JEPA stands for Joint Embedding Predictive Architecture. LeCun, the French-American computer scientist, proposed it in 2022 while he was chief AI scientist at Meta's FAIR lab. The original proposal is his position paper [A Path Towards Autonomous Machine Intelligence](https://openreview.net/forum?id=BZ5a1r-kVsf).

## Embeddings

An embedding is a list of numbers (a vector) that a neural network produces to represent an input. Similar inputs end up with nearby vectors, so the numbers capture what the model has learned is important about the input rather than its raw pixels or words.

## How JEPA works

The core idea is to predict in embedding space rather than pixel space. Most generative image and video models reconstruct the missing part of an input pixel by pixel. A JEPA model instead predicts the embedding of the missing part. That lets it ignore details that are unpredictable or irrelevant, such as the exact texture of leaves on a tree.

A JEPA model has three parts. A context encoder turns the visible part of an input into an embedding. A target encoder does the same for the hidden part. A predictor then tries to produce the target's embedding from the context's embedding. The training loss is the distance between the predicted and actual embeddings, so no pixels are ever reconstructed.

## The collapse problem

What collapses is the embeddings. The loss only asks that the predicted embedding match the target embedding. The encoders can satisfy that by cheating: if they map every input (a cat, a car, random noise) to the same vector, the prediction is always perfect and the loss is zero. But the embeddings now carry no information, and the model has learned nothing. This failure is called representation collapse.

The original JEPA models avoid it by not training the target encoder directly. No gradients flow through it, and its weights are a slowly updated average of the context encoder's weights. This works in practice, but it is a heuristic rather than a guarantee, and later work replaced it (see LeJEPA below).

## Why it matters

A system that has to plan needs to predict what will happen next, but not every pixel of it. Predicting in an abstract space is LeCun's proposed route to models that understand how the world behaves well enough to plan in it, rather than only generating plausible output.

## Other kinds of world model

JEPA is not the only approach. The main alternatives differ in what they predict.

**Generative video models** predict future frames in pixels. Google DeepMind's [Genie 3](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) (August 2025) generates a world from a text prompt that a user can move through in real time, at 720p and 24 frames per second, for a few minutes at a time. OpenAI's Sora report was titled [Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/) (2024), and NVIDIA's open [Cosmos](https://arxiv.org/abs/2501.03575) models (2025) generate video for training robots and self-driving cars.

**Spatial, 3D world models** are the focus of World Labs, the startup founded by Fei-Fei Li (creator of ImageNet) with Justin Johnson, Christoph Lassner and Ben Mildenhall. Its first product, [Marble](https://www.worldlabs.ai/blog/marble-world-model), became generally available in November 2025. It turns text, images or video into persistent 3D environments that can be walked through, edited and exported as Gaussian splats or meshes. Li frames this as spatial intelligence: language models taught machines to read and write, and these models should teach them to see and build in three dimensions.

**Latent world models** compress each observation (a video frame, say) into a small embedding, called a latent state, and learn how that state changes over time and in response to actions. "Latent" just means hidden: the model's internal summary rather than the raw pixels. An agent can then plan or practise by imagining futures inside this compact space, which is far cheaper than rendering every frame. The idea goes back to Ha and Schmidhuber's [World Models](https://arxiv.org/abs/1803.10122) (2018) and continues in Danijar Hafner's Dreamer series. [DreamerV3](https://www.nature.com/articles/s41586-025-08744-2) (Nature, 2025) was the first algorithm to collect diamonds in Minecraft from scratch, and [Dreamer 4](https://arxiv.org/abs/2509.24527) (2025) did it purely from recorded gameplay, without ever playing the game itself. JEPA world models are latent world models too. The difference is how the latent space is learned: Dreamer-style models usually learn it by also reconstructing the pixels, while JEPA learns it by prediction alone.

The generative approaches render the world. JEPA bets that a model only needs to predict an abstract summary of it.

## Where it has gone since

Meta released versions for images ([I-JEPA](https://arxiv.org/abs/2301.08243), 2023) and video ([V-JEPA](https://arxiv.org/abs/2404.08471), 2024). [V-JEPA 2](https://arxiv.org/abs/2506.09985) (2025) added action-conditioned prediction. After extra training on just 62 hours of unlabelled robot video, it could plan pick-and-place moves on a robot arm in a lab it had never seen, by imagining the outcome of each move in embedding space. [VL-JEPA](https://arxiv.org/abs/2512.10942) (December 2025) extended the idea to vision and language: it predicts the embedding of an answer rather than generating it word by word.

[LeJEPA](https://arxiv.org/abs/2511.08544) (November 2025, Randall Balestriero and LeCun) fixed the collapse problem properly. It drops the moving-average target encoder and adds a regulariser called SIGReg (Sketched Isotropic Gaussian Regularization), which pushes the embeddings to spread out evenly in every direction. Since the embeddings can no longer all sit at one point, collapse is ruled out by construction.

[LeWorldModel](https://arxiv.org/abs/2603.19312) (LeWM, March 2026, Lucas Maes, Quentin Le Lidec, Damien Scieur, LeCun and Balestriero) applies this to world models. It is the first JEPA trained stably end to end from raw pixels, using only two terms: next-embedding prediction plus SIGReg. It needs no moving-average target encoder and no pretrained components. With 15 million parameters, it trains on a single GPU in a few hours and plans up to 48 times faster than world models built on large pretrained encoders.

LeCun left Meta at the end of 2025 to found AMI Labs (Advanced Machine Intelligence) and continue this line of work.

## LeWorldModel in more detail

LeWM is a small, clean example of the whole JEPA world-model idea working end to end, so it is worth walking through. This section draws on the paper and on [AI Papers Academy's explainer](https://aipapersacademy.com/leworldmodel/).

### What it learns from

LeWM is trained on recordings of an agent acting in an environment: a sequence of camera frames plus the action taken between each pair of frames. The behaviour in the recordings doesn't need to be good, and there are no rewards or task labels. The model only has to learn how the world responds to actions, not what to do.

### The model

LeWM has two parts, about 15 million parameters in total.

- **Encoder.** A small Vision Transformer (ViT, see [abbreviations](abbreviations.html)) turns each frame into a single 192-number embedding. A ViT normally produces one embedding per image patch, but LeWM keeps only the summary embedding for the whole image. Each frame becomes one compact vector, roughly 200 times fewer tokens than DINO-WM, an earlier world model that uses Meta's pretrained DINO encoder.
- **Predictor.** A transformer takes the embeddings of the last few frames plus the actions taken, and predicts the embedding of the next frame.

### Training

The loss has just two terms.

1. **Prediction.** The mean squared error between the predicted embedding of the next frame and the encoder's actual embedding of it.
2. **SIGReg.** This is the anti-collapse term from LeJEPA. It projects the batch of embeddings onto 1,024 random directions, then uses a statistical test to check whether the values along each direction look like a standard bell curve (a normal distribution). Embeddings that have collapsed to one point, or squashed into a few directions, fail the test and are penalised. That forces the embeddings to stay spread out and informative.

The encoder and predictor are trained together with this one loss. There is no moving-average target encoder, no stop-gradient trick and no pretrained encoder, and only one weighting knob to tune, down from six in the nearest earlier end-to-end method. It trains in a few hours on a single GPU.

### Planning

To reach a goal, LeWM is given an image of the goal state and encodes it. It then plans by imagination.

1. Sample many candidate action sequences.
2. For each one, roll the predictor forward step by step, entirely in embedding space, to imagine where the sequence ends up.
3. Score each sequence by how close its imagined final embedding is to the goal embedding.
4. Shift the sampling towards the best sequences and repeat. This is the cross-entropy method.

The agent then carries out only the first action, looks at the new frame, and plans again. This is called model predictive control. Because each frame is a single small vector, a full plan takes about a second, against roughly 47 seconds for DINO-WM. That is where the "48 times faster" figure comes from.

### Results

It was tested on four simulated control tasks: Two-Room (navigating between rooms), Reacher (moving an arm to a target), Push-T (pushing a T-shaped block into place) and OGBench-Cube (manipulating a cube in 3D).

- LeWM beats the baselines on Push-T and Reacher. On Push-T it beats DINO-WM even when DINO-WM is also given the robot's own position data.
- DINO-WM does slightly better on OGBench-Cube, the most visually complex task, where a large pretrained encoder helps.
- LeWM does worse on Two-Room. That environment is so simple that forcing the embeddings into a spread-out Gaussian seems to over-constrain them.

### Does it understand physics?

Two checks suggest the embeddings capture real physical state.

- **Probing.** A small network trained to read the block's position out of LeWM's embeddings on Push-T recovers it almost perfectly (0.999 correlation).
- **Surprise.** Shown videos where something physically impossible happens, such as an object teleporting, LeWM's prediction error spikes. It is much more surprised by teleportation than by an object suddenly changing colour. So it has learned that objects move continuously, and treats colour as less important. This mirrors the violation-of-expectation tests used on human infants.

### Limitations

- It only plans over short horizons.
- It needs recorded data that covers enough of the possible interactions.
- It needs the actions to be labelled, which can be costly to collect.
- Visually complex scenes are harder without a big pretrained encoder.
