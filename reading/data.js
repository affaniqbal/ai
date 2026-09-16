window.READING = {
  "entries": [
    {
      "id": "lecun-jepa",
      "title": "A Path Towards Autonomous Machine Intelligence",
      "type": "arxiv",
      "source": "arxiv.org/abs/2206.13749",
      "url": "https://arxiv.org/abs/2206.13749",
      "date": "2026-09",
      "tags": [
        "world-models",
        "planning",
        "self-supervised"
      ],
      "summary": "Proposes a modular, non-generative architecture in which a world model predicts in a learned representation space rather than in pixels, enabling an agent to plan action sequences under uncertainty.",
      "claims": [
        "Prediction should happen in abstract representation space, not raw sensor space.",
        "A single world model, conditioned on actions, supports planning.",
        "Energy-based, non-generative objectives sidestep the intractability of predicting every detail."
      ],
      "comment": "The core bet I keep coming back to: intelligence needs a model of the world, and language is a thin slice of that. Connects directly to Craik.",
      "links": [
        "craik-explanation",
        "friston-fep"
      ]
    },
    {
      "id": "craik-explanation",
      "title": "The Nature of Explanation",
      "type": "book",
      "source": "Kenneth Craik, 1943",
      "url": "",
      "date": "2026-09",
      "tags": [
        "world-models",
        "representation",
        "history"
      ],
      "summary": "Craik argues the nervous system carries a 'small-scale model' of external reality and of its own possible actions, using it to try out alternatives before acting.",
      "claims": [
        "Organisms internally model reality to predict and choose.",
        "Thought is the running of an internal model, not a mirror of the world."
      ],
      "comment": "The 1943 origin of 'world models'. Worth quoting when people think the idea is new.",
      "links": [
        "lecun-jepa"
      ]
    },
    {
      "id": "gpml",
      "title": "Gaussian Processes for Machine Learning",
      "type": "web",
      "source": "Rasmussen & Williams",
      "url": "https://gaussianprocess.org/gpml/",
      "date": "2026-08",
      "tags": [
        "gaussian-processes",
        "bayesian",
        "uncertainty"
      ],
      "summary": "The standard reference for GP regression and classification: priors over functions, kernels, and principled uncertainty estimates.",
      "claims": [
        "A GP places a prior directly over functions.",
        "The kernel encodes assumptions about smoothness and structure.",
        "Predictions come with calibrated uncertainty for free."
      ],
      "comment": "Where a lot of my earlier work lived. Uncertainty is the thread that ties this to world models.",
      "links": [
        "friston-fep"
      ]
    },
    {
      "id": "friston-fep",
      "title": "The free-energy principle (note + screenshot)",
      "type": "screenshot",
      "source": "captured from a talk",
      "url": "",
      "date": "2026-08",
      "tags": [
        "world-models",
        "prediction",
        "uncertainty"
      ],
      "summary": "Frames perception and action as minimising prediction error (variational free energy) against a generative model of the world.",
      "claims": [
        "Agents act to make their sensory input match their model's predictions.",
        "Perception and action are two ways of reducing the same error."
      ],
      "comment": "Overlapping vocabulary with JEPA-style planning, from a different tradition. Flagging the tension to think about later.",
      "links": [
        "lecun-jepa",
        "gpml"
      ]
    }
  ]
};
