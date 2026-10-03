---
title: World models
date: 2026-10-03
tags: [world-models]
---

# World models

A world model is a system that learns how an environment behaves, so it can predict what will happen next, often in response to an action. The term covers very different things: a video generator, a physics surrogate and a robot's planner all get called world models. This note is the map. The detail lives in the notes it links to: [JEPA](jepa.html) and [Simulation](simulation.html).

## Three jobs: render, simulate, plan

Fei-Fei Li and World Labs sort world models by what they output. The setting is the classic agent loop: an agent observes the world, acts, and the world moves to a new state. The agent never sees the full state, only partial and noisy observations of it. This is formalised as a partially observable Markov decision process (POMDP, see [abbreviations](abbreviations.html)).

- **Renderer.** Maps state to observation. It outputs pixels for human eyes and is judged on visual fidelity.
- **Simulator.** Maps state to next state. It outputs physically faithful state that a program can compute on.
- **Planner.** Outputs the actions an agent should take.

The categories are starting to blend. Marble, World Labs' first product, outputs Gaussian splats for visual exploration, which is rendering, plus collision meshes that a physics engine can operate on, which is a hook into simulation. Today it is a mature renderer with a bridge into simulation, not yet a full simulator.

The simulator in this taxonomy is also still flavoured by 3D geometry: cups on tables. The bridge from there to simulating an industrial process is not automatic. [Simulation](simulation.html) covers that side.

## The main approaches

The approaches differ in what they predict.

**Generative video models** predict future frames in pixels. Google DeepMind's [Genie 3](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) (August 2025) generates a world from a text prompt that a user can move through in real time, at 720p and 24 frames per second, for a few minutes at a time. OpenAI's Sora report was titled [Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/) (2024), and NVIDIA's open [Cosmos](https://arxiv.org/abs/2501.03575) models (2025) generate video for training robots and self-driving cars.

**Spatial, 3D world models** are the focus of World Labs, the startup founded by Fei-Fei Li (creator of ImageNet) with Justin Johnson, Christoph Lassner and Ben Mildenhall. Its first product, [Marble](https://www.worldlabs.ai/blog/marble-world-model), became generally available in November 2025. It turns text, images or video into persistent 3D environments that can be walked through, edited and exported as Gaussian splats or meshes. Li frames this as spatial intelligence: language models taught machines to read and write, and these models should teach them to see and build in three dimensions.

**Latent world models** compress each observation (a video frame, say) into a small embedding, called a latent state, and learn how that state changes over time and in response to actions. "Latent" just means hidden: the model's internal summary rather than the raw pixels. An agent can then plan or practise by imagining futures inside this compact space, which is far cheaper than rendering every frame. The idea goes back to Ha and Schmidhuber's [World Models](https://arxiv.org/abs/1803.10122) (2018) and continues in Danijar Hafner's Dreamer series. [DreamerV3](https://www.nature.com/articles/s41586-025-08744-2) (Nature, 2025) was the first algorithm to collect diamonds in Minecraft from scratch, and [Dreamer 4](https://arxiv.org/abs/2509.24527) (2025) did it purely from recorded gameplay, without ever playing the game itself.

**JEPA** models are latent world models too. The difference is how the latent space is learned: Dreamer-style models usually learn it by also reconstructing the pixels, while JEPA learns it by prediction alone. See [JEPA](jepa.html).

**Learned physics simulators** predict the state variables of a physical system, such as a flow field or the temperatures in a reactor, rather than images of it. They come from scientific computing more than from video or robotics, and they are judged on whether the physics is right. See [Simulation](simulation.html).

The generative approaches render the world. JEPA bets that a model only needs to predict an abstract summary of it. Learned simulators have to get the state itself right.
