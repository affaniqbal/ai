---
title: AI abbreviations
date: 2026-10-03
tags: [glossary]
---

# AI abbreviations

Short definitions of abbreviations that come up in these notes, in alphabetical order.

**EMA (exponential moving average).** A running average where recent values count more than old ones. In the original [JEPA](jepa.html) models, the target encoder's weights are an EMA of the context encoder's weights, which helps stop the embeddings collapsing.

**JEPA (Joint Embedding Predictive Architecture).** Yann LeCun's proposal for learning by predicting the embedding of a missing part of the input rather than its pixels. See [JEPA](jepa.html).

**LLM (large language model).** A model trained on huge amounts of text to predict the next word (strictly, the next token). ChatGPT, Claude and Gemini are built on LLMs.

**RL (reinforcement learning).** Training an agent by trial and error, rewarding actions that lead to good outcomes. World models let an RL agent practise in imagination instead of in the real world.

**SIGReg (Sketched Isotropic Gaussian Regularization).** The training term introduced in [LeJEPA](https://arxiv.org/abs/2511.08544) that pushes embeddings to spread out evenly in every direction, so they cannot collapse to a single point.

**ViT (Vision Transformer).** A transformer, the architecture behind LLMs, applied to images. It cuts an image into small square patches and treats each patch like a word in a sentence. Introduced in [An Image is Worth 16x16 Words](https://arxiv.org/abs/2010.11929) (Google, 2020), it is now the standard image encoder, including in I-JEPA and V-JEPA.

**VLA (vision-language-action model).** A model that takes in camera images and a written instruction ("put the cup in the sink") and outputs actions for a robot to carry out. Most are built by taking a VLM and training it to produce motor commands as well as text. Examples are Google DeepMind's [RT-2](https://arxiv.org/abs/2307.15818) (2023), [OpenVLA](https://arxiv.org/abs/2406.09246) (2024) and Physical Intelligence's [π0](https://arxiv.org/abs/2410.24164) (2024).

**VLM (vision-language model).** A model that takes in both images and text and answers in text, such as describing a photo or answering questions about a chart.

**WM (world model).** A model that learns how an environment behaves, so it can predict what will happen next, often in response to an action. It is used in names such as LeWM ([LeWorldModel](https://arxiv.org/abs/2603.19312)) and DINO-WM. See the world-model section of [JEPA](jepa.html).
