---
title: Core concepts
date: 2026-10-03
tags: [concepts, world-models]
---

# Core concepts

The other notes lean on a small set of ideas: state, the Markov property, embeddings, encoders and decoders, loss and regularisation. This note explains them in plain language, in an order where each one builds on the last. Part one is about how a world changes over time. Part two is about how a neural network represents that world. Part three is about how a network learns. Part four joins them.

## Part one: how a world changes

### State

The **state** is everything about a system that you would need to know to predict what it does next. Nothing more is needed, and nothing less will do.

For a thrown ball, the state is its position and its velocity. Position alone is not enough: a ball at the same spot could be going up or coming down. For a chemical reactor, it might be the temperature, pressure and composition at every point inside. For a game of chess, it is the arrangement of the pieces and whose turn it is.

The individual quantities that make up the state are called **state variables**. The set of all states the system could possibly be in is the **state space**. A ball's state is six numbers (three for position, three for velocity), so its state space has six dimensions. A reactor's state space has thousands or millions.

What counts as the state depends on what you want to predict. To predict where the ball lands, position and velocity are enough. To predict how it bounces, you also need its spin and how elastic it is. The state is a modelling choice, and choosing it well is much of the work.

### Observation

An **observation** is what you actually get to see or measure. It falls short of the state in two ways.

It is **partial**: some of the state does not show up in it at all. A single photograph of the ball shows its position but not its velocity. A reactor has a few dozen sensors, not a reading at every point.

It is **noisy**: what does show up is measured imperfectly. A thermocouple reads a degree or two off. A camera image is blurred and grainy.

The same state can also produce very different observations. A room looks nothing alike from two camera angles, or with the lights on and off, but it is the same room in the same state. Much of what a model has to learn is to see through those differences.

The gap between state and observation is the reason most of the machinery in part two exists. A model is given observations, but to predict well it needs something closer to the state.

### Action, time step and trajectory

An **action** is something an agent does that affects the state, such as a robot moving its arm or an operator opening a valve.

Time is usually cut into **time steps**: the state is recorded at regular moments, such as every frame of a video or every second of plant data, rather than continuously.

A **trajectory** is the sequence of states (or observations) and actions over a stretch of time. Recorded trajectories are what a world model learns from. When a model generates a trajectory itself, by predicting one step and then feeding its prediction back in to predict the next, that is called a **rollout**.

### The Markov property

A system has the Markov property if the future depends only on the present state, not on how the system got there. Once you know the state now, the history adds nothing.

This is less a fact about the world than a test of whether you chose the state well. The ball's position on its own is not Markov, because you would need earlier positions to work out which way it is moving. Position plus velocity is Markov. If the past still helps you predict, something is missing from your state.

### Markov chains

A Markov chain is the simplest model with this property. It has a set of states and, for each state, the probabilities of moving to each other state at the next step. Nobody is making decisions. The system just evolves.

Take weather with two states, sunny and rainy. Suppose that after a sunny day the next day is sunny with probability 0.8 and rainy with probability 0.2, and after a rainy day it is rainy with probability 0.6 and sunny with probability 0.4. Those four numbers are the whole model. They are called the **transition probabilities**. To forecast several days ahead, you apply them repeatedly.

Two things are worth noticing. The model is stochastic: it gives a distribution over next states, not a single answer. And forecasting further ahead means rolling the same one-step rule forward again and again, which is exactly how a world model predicts a long future.

### Markov decision processes

A Markov decision process (MDP) is a Markov chain with an agent added. It has four parts.

- **States.** As before.
- **Actions.** What the agent can do in each state.
- **Transitions.** The probability of each next state, which now depends on the current state and the action taken.
- **Rewards.** A number after each step that says how good the outcome was.

The agent's rule for choosing an action in each state is called a **policy**. Reinforcement learning (RL, see [AI abbreviations](abbreviations.html)) is the search for a policy that collects as much reward as possible over time.

The transitions are the part that matters most for these notes. A world model is, at its core, a learned version of the transition rule: given this state and this action, what comes next?

### Partial observability

An MDP assumes the agent can see the state. Usually it cannot. Chess is fully observable, since the board shows everything. Poker is not, since the other players' cards are hidden. A robot with a camera sees one view of a room, not the positions and velocities of everything in it.

A partially observable Markov decision process (POMDP) adds this to the model. The underlying state still evolves in a Markov way, but the agent only receives observations of it, which are partial and noisy.

The agent then has to make up for what it cannot see. The usual fix is memory: it combines the history of observations and actions into its own best estimate of the state. In the ball example, two photographs a moment apart are enough to recover the velocity. Many systems do the same thing and feed a model the last few frames rather than one. The internal estimate a model builds this way is what the other notes call a latent state.

## Part two: how a network represents a world

### Vectors

A neural network only works with numbers. Anything it handles, whether an image, a word or a sensor reading, first becomes a list of numbers. Such a list is called a vector. A list of 192 numbers can be thought of as a point in a space with 192 dimensions, in the same way that a list of two numbers is a point on a map.

### Embeddings

An embedding is a vector that a network has learned to use as its representation of an input. Two things make it more useful than the raw input.

It is compact. A small image has hundreds of thousands of pixel values. Its embedding might have a few hundred numbers.

It is organised by meaning. Training arranges the space so that inputs the network should treat alike end up close together. Two photographs of the same cat from different angles differ in almost every pixel, but their embeddings are near each other. Distance in the embedding space means "different in ways that matter", not "different pixel by pixel".

The individual numbers in an embedding usually have no readable meaning on their own. What carries the information is where the point sits relative to other points.

### Encoders

An encoder is the network that produces the embedding. It takes a raw input and outputs a vector.

Encoding is deliberately lossy. The encoder cannot keep everything, so training decides what it keeps. That makes the training objective the real design choice: an encoder trained to help reconstruct images keeps fine visual detail, while an encoder trained to help predict what happens next keeps whatever is predictable and useful for that.

### Decoders

A decoder goes the other way. It takes an embedding and produces something in the original form, such as an image, a sound or a sentence.

Decoding is harder than it sounds, because the embedding threw detail away and the decoder has to fill it back in. A decoder asked to draw a tree from a compact embedding must invent the exact arrangement of leaves. This is why generative models are large and expensive.

### Autoencoders and latent space

Put an encoder and a decoder together and train them so that the output matches the input. This is an autoencoder. The embedding in the middle is much smaller than the input, so it acts as a bottleneck: the network is forced to work out what is essential, because it cannot pass everything through.

The space of embeddings in the middle is called the **latent space**, and a point in it is a **latent**. "Latent" just means hidden: it is the model's internal summary, not something directly observed.

### A note on the word "decoder" in language models

The same two words are used slightly differently for transformers, the architecture behind large language models. There, an encoder is a model that reads a whole input at once to build a representation of it, and a decoder is a model that generates output one token at a time, each token depending on the ones before. ChatGPT, Claude and Gemini are called decoder-only models for that reason. The underlying idea is the same (encoders read, decoders generate), but no bottleneck is involved.

## Part three: how a network learns

### Parameters

A neural network is a long chain of simple arithmetic, and inside it are millions of adjustable numbers called **parameters** or **weights**. They decide what the network computes. A network with random weights outputs nonsense. Training is the process of finding weights that make it output something useful.

### Loss

To improve the weights, you need a way to say how wrong the network currently is. The **loss** is that measure: a single number, computed from the network's output, that is large when the output is bad and small when it is good.

For prediction, the usual choice is the gap between what the network predicted and what actually happened. The mean squared error is the most common version: take the difference for each number, square it, and average.

The loss is the only thing training tries to reduce. So the loss defines what the network will learn, and anything it does not measure is left to chance. Choosing it is the main design decision in most of the methods in these notes.

### Gradient descent

Training works by small corrections. For each weight, calculus gives the **gradient**: whether nudging that weight up or down would lower the loss, and by how much. All the weights are then moved a small step in the direction that helps. Repeating this many thousands of times, on fresh batches of examples, is **gradient descent**. The size of each step is the **learning rate**.

A picture that helps is a walker on a hilly landscape in fog, where height is the loss. They cannot see the valley, but they can feel which way the ground slopes under their feet, so they keep stepping downhill.

### Overfitting and generalisation

A network with millions of weights can lower its loss in two ways. It can learn the real pattern in the data, or it can memorise the particular examples it was shown, noise and all. Memorising is called **overfitting**. It gives a low loss on the training examples and poor results on anything new.

What matters is **generalisation**: how well the network does on examples it has not seen. This is why some data is always held back as a test set and never used for training.

Fitting a curve through data points shows the problem. A wiggly curve can pass exactly through every point and still be a terrible description of the trend, while a straight line that misses every point slightly is far better at predicting the next one.

### Regularisation

Regularisation is anything added to training that steers the network towards one kind of solution over another, beyond just fitting the data. It is extra pressure, expressing a preference the data alone does not enforce.

Its classic use is against overfitting, where the preference is for simpler solutions.

- **Weight decay** adds a penalty to the loss for large weights. Smaller weights give smoother functions, like preferring the straight line to the wiggly curve.
- **Dropout** switches off a random set of the network's units at each training step, so it cannot depend on any single one.
- **Early stopping** ends training when performance on held-back data stops improving, before memorisation sets in.
- **Data augmentation** shows the network altered copies of each example (cropped, rotated, with noise added), so it learns to ignore those changes.

The most common form is an extra term in the loss. The total becomes the main loss plus a weight times the regularisation term, and that weight sets how hard the preference is pushed. Too little and it does nothing. Too much and the network cares more about the preference than about the task.

The same idea is used for purposes other than overfitting. In [JEPA](jepa.html), the main loss can be driven to zero by mapping every input to the same embedding, which is useless. SIGReg is a regulariser that rules this out by pushing the embeddings to stay spread out. In a physics-informed network, the governing equations are added to the loss so that solutions violating them are penalised (see [Simulation](simulation.html)). In both cases a term is added to say what a good solution looks like, because the main loss alone would accept bad ones.

### Learning without labels

In **supervised learning**, each training example comes with the right answer attached by a person, such as a photograph labelled "cat". Labels are expensive, so this does not scale to the volume of data that large models need.

**Self-supervised learning** gets the answer from the data itself. Part of each example is hidden and the network is trained to predict it from the rest: the next word of a sentence, a masked patch of an image, the next frame of a video. No one has to label anything. Language models, JEPA and most world models are trained this way.

### Errors that build up

A world model is usually trained to predict one step ahead, but used to predict many. In a rollout, each prediction becomes the input to the next, so each small error is carried forward and added to. After enough steps the prediction can drift a long way from reality, even when every single step looked accurate. This is called **compounding error**, and it is why a model has to be tested on long rollouts and not just on its one-step loss.

## Part four: putting it together

A world model combines all three.

1. An **encoder** turns each observation into a latent state. This is the answer to partial observability: the model builds its own compact state from what it can see.
2. A **predictor** takes the latent state and an action and outputs the next latent state. This is the learned transition rule from the Markov decision process, working in latent space.
3. A **decoder**, if there is one, turns a latent state back into an observation such as a video frame.

A good latent state is one that is close to Markov: it holds enough that the predictor can work out what comes next without looking back at the history.

All of it is trained by self-supervised prediction on recorded trajectories: the loss compares the predicted next step with what actually came next, with regularisation added where that loss alone would accept a bad answer.

The approaches in [World models](world-models.html) differ mainly in the third step. Generative video models put most of their effort into decoding, since the output is the picture. Dreamer-style models use a decoder during training to make sure the latent state keeps enough information. [JEPA](jepa.html) drops the decoder altogether and trains the encoder and predictor on prediction alone. A physics [simulator](simulation.html) often needs no encoder or decoder in this sense at all, because it is handed the state variables directly.
