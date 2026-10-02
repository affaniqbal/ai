---
title: JEPA
date: 2026-10-02
tags: [jepa, world models]
---

# JEPA

JEPA stands for Joint Embedding Predictive Architecture. It was proposed in 2022 by Yann LeCun, the French-American computer scientist, while he was chief AI scientist at Meta's FAIR lab.

The core idea is to predict in representation space rather than in pixel space, which is the common approach in video / image generative AI today. 

The approach JEPA takes is that instead of  reconstructing the missing part of an input in full detail (i.e. pixel by pixel), a JEPA model predicts an abstract "embedding" of it, which lets it ignore details that are unpredictable or irrelevant.

Meta has since released versions for images (I-JEPA) and video
([V-JEPA](https://ai.meta.com/research/vjepa/)).
