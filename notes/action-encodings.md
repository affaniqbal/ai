---
title: Action encodings
date: 2026-10-03
tags: [world-models, robotics, papers]
---

# Action encodings

A note on [Robot World Models Are Not Invariant to How the Actions Are Written](https://arxiv.org/abs/2609.23252) (Ahmed Karim and Leon Chlon, September 2026). It starts with the idea in plain terms and then builds up to the paper's test, its theory and its fix. The background terms (state, action, embedding, loss, rollout) are in [Core concepts](concepts.html).

## The short version

A robot command can be written down in more than one way. "Move the joint to 40 degrees" and "move the joint 10 degrees further" are the same command if the joint is at 30 degrees now.

A [world model](world-models.html) for a robot takes the current scene and a command, and predicts what happens next. The paper shows that if such a model is trained on commands written one way and is then given the same commands written the other way, its predictions fall apart. Nothing about the robot or the motion has changed. Only the notation has.

The fix is to train on both notations at once, and the paper shows there is a right and a wrong way to do that.

## Two ways to write the same command

Robot datasets record actions in one of two conventions.

- **Absolute.** Each action is the target position: where each joint should end up.
- **Relative.** Each action is a change from where the robot is now, also called a delta.

The two are linked by a simple rule: the relative action is the absolute action minus the current state. So each can be turned into the other, but only if you know the current state. The action numbers on their own are not enough.

Which convention to use is a real engineering choice in robot learning, and different datasets and controllers choose differently. A world model that takes actions as input inherits that choice without anyone deciding it should.

## Why the model cares

A person reads the action as a description of a motion. The model does not. It is given a list of numbers and trained to predict well from them. In the paper's words, nothing in the training signal indicates that the action is a notation for a trajectory rather than the trajectory itself.

So the model learns whatever mapping from numbers to outcomes works on its training data. Hand it the same motion as different numbers, and it has no reason to respond in the same way.

## The setup

The experiments use a deliberately small model, so the effect is easy to isolate.

- **Encoder.** A frozen, pretrained I-JEPA Vision Transformer (see [JEPA](jepa.html)) turns each camera frame into an embedding. It is not trained further.
- **Predictor.** A small network takes the current embedding plus the actions over the next few seconds and predicts the embedding of the future frame.
- **Training.** The loss is contrastive: the predictor is rewarded for picking the true future frame out of a set of candidates.

It is run on three public robot datasets from the LeRobot collection: two with a two-armed ALOHA robot (opening a cabinet and making coffee, 14 action dimensions each) and Push-T, where a robot pushes a T-shaped block on a table (2 action dimensions).

## How the failure is measured

Three measurements are used.

**Retrieval rank.** Given the model's prediction, sort all the candidate future frames by how close they are to it. The rank is the position of the true one, so 1 is perfect. When the action encoding is switched, the rank gets worse by a factor of 9.9 on the cabinet task, 13.4 on the coffee task and 2.6 on Push-T.

**Agreement between the two predictions.** Give the model the same motion in both encodings and compare the two predicted embeddings using cosine similarity. This measures whether two vectors point the same way: 1 means the same direction, 0 means unrelated, and −1 means opposite. The average is about 0.37 on the two ALOHA tasks and 0.07 on Push-T, where the worst case is −0.38. On Push-T the two predictions about the same future are close to unrelated. The model is not giving a slightly worse answer. It is answering a different question.

**Choosing an action.** Given a goal and 32 candidate actions, does the model pick the right one? In its own encoding it does 53% of the time. In the other encoding it does 15% of the time.

## Why this is not ordinary distribution shift

The usual explanation when a model fails on new inputs is that the new inputs lack something, or come from a different situation. That does not apply here.

The authors check that each encoding can be reconstructed from the other. From the action and the state together, a simple linear fit recovers the other encoding almost perfectly (R² of 0.996, where 1 is perfect). No information is lost in the change. From the action alone the fit is much worse (R² of 0.757), which matches the rule above: the conversion needs the current state.

The failure also does not go away with more data. Across training sets from 150 to 1,200 examples, the agreement between the two predictions stays flat at around 0.35. More data makes the model sharper in its own encoding and no better in the other.

## When should a model be invariant?

It is tempting to conclude that a model should always give the same answer however its input is written. The paper argues that this is only right for some changes, and gives a test with two parts.

1. **Predictive parity.** A model trained on either version predicts about equally well.
2. **Reconstructibility.** Each version can be recovered from the other, checked on the whole input (state and action together) and not on one channel alone.

A change that passes both is a true rewriting: the same content in different notation. A change that fails is a lossy summary, where one version holds less than the other.

This matters because forcing a model to treat two versions identically has a price when they are not equivalent. The paper proves that the cost is at least the gap in prediction quality between the best and worst version. Forcing a model to ignore a real difference throws information away.

The set of all equivalent ways of writing one input is called its **orbit**, a term borrowed from the mathematics of symmetry. Applied to four candidate changes, the test accepts only one as a true rewriting. Absolute versus relative actions passes.

## The repair

The fix is to train on both encodings. There are two ways to combine them, and only one works well.

**Average the predictions.** Run the model on each encoding, average the outputs, and train a model to match that average. This fails for a geometric reason. The predictions are directions (vectors of length one), and the average of several directions can be worse than every one of them. If one prediction points the right way and two others point nearly the opposite way but to either side, each is scored on its own merits, while their average points squarely the wrong way.

**Average the loss.** Compute the loss separately for each encoding and add them up. The model is then asked to be right in each encoding and is never asked to match a blend of its own outputs.

On top of this the authors add a **disagreement penalty**, a regularisation term that penalises the model when its predictions for the two encodings differ. A weight sets how strongly it is applied.

The results, for the model trained on a single encoding and then the two repairs:

| | Rank in the other encoding | Action choice, own encoding | Action choice, other encoding | Agreement (mean) |
|---|---|---|---|---|
| Trained on one encoding | 61.5 | 53% | 15% | 0.37 |
| Both, loss averaged, no penalty | 6.0 | | 40% | |
| Both, loss averaged, with penalty | 5.3 | 41% | 41% | 0.99 |

Averaging the predictions instead gives a rank of about 11.6, roughly twice as bad as averaging the loss.

Two things stand out. Training on both encodings does most of the work without the penalty. And the repair is not free: action choice in the model's original encoding falls from 53% to 41%. The model is now equally good in both, at a level below its best in one.

The penalty earns its place over long rollouts. When predictions are fed back in over several steps, the two encodings drift apart. With the penalty, agreement at the end of the rollout is near 1.0 on both ALOHA tasks, mean and worst case. Push-T remains hard: mean agreement reaches 0.87, but the worst case is only 0.14.

## A control from physics

To show that the problem lies in how the input is represented and not in the data, the authors run the same test on a molecular dynamics system. Two encoders are given the same atoms. One uses a description that is unchanged by the symmetry in question by construction (a radial distribution function, which records only the distances between atoms). The other uses the raw coordinates flattened into a list.

The first shows no defect. The second breaks under the same symmetry, with accuracy falling from 0.86 to 0.46. The data and the symmetry are the same in both cases. The representation determines the outcome.

## Limitations

The authors state these themselves.

- Results come from three random seeds, so the direction of each effect is more reliable than its size.
- The predictor is a small network on top of a frozen encoder, not a full-scale world model.
- Evaluation is offline. Choosing among candidate actions stands in for control, and no robot is run.
- The reconstructibility check uses a linear fit, so it could wrongly reject a rewriting that is exact but nonlinear.
- The repair works by listing the equivalent encodings and training on each. Where there are too many to list, or a continuous range of them, this is not possible.

## Why it matters

A world model is a learned transition rule: state plus action gives next state. This paper shows that the rule a model learns is tied to the notation its inputs came in, even where a person would see two notations as obviously the same. Any model trained on data from several sources, with different conventions for actions, units or coordinates, is exposed to this. The molecular dynamics control points to the more durable answer, which is to build the equivalence into the representation where that is possible, and to train across the encodings where it is not.
