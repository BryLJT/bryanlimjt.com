# How the Obsidian graph feel was cloned

*The projects page graph on bryanlimjt.com feels like Obsidian's graph view. This is the story of how that happened. It was not luck, and it was not tuning by eye. It came from refusing to guess at any step: every number in the physics engine traces back to a primary source that was read directly.*

*(Plain-language version. The engineering record lives in `docs/superpowers/plans/2026-07-29-graph-obsidian-physics.md`, addenda 1 and 2.)*

## The problem: "feel" is physics, not visuals

The old graph looked like Obsidian's but did not move like it. The difference was not colors or shapes. It was three behaviours:

1. **Settle:** Obsidian's graph blooms open, glides to a stop, and then holds perfectly still. The old graph never stopped moving. It drifted forever, because its simulation had no concept of cooling down.
2. **Drag response:** in Obsidian, grabbing a node wakes the whole web up. Neighbours swim along, distant nodes stir slightly, and heavily-connected hub nodes resist while lightly-connected leaf nodes swing freely.
3. **Release:** let go, and everything exhales back into stillness.

All three come from the physics engine, so cloning the feel meant cloning the physics.

## Step 1: Port the real engine, not an imitation of it

Obsidian's graph is built on the mechanics of **d3-force**, the standard force-simulation library. Instead of writing physics that "behaves roughly like" d3-force, the actual d3-force source code was read file by file, and each formula was hand-copied into a new module, `lib/forceSim.ts`.

Think of it as a cover band versus playing from the original sheet music. A cover band listens and approximates. Here, every bar was transcribed from the score:

- **The heat lifecycle.** The sim has a temperature called *alpha*. It starts hot (1.0), cools a little every frame, and below a threshold the simulation literally goes to sleep: zero computation, zero drift. Dragging injects heat again. This one mechanism is the whole "settles, then wakes" character.
- **Repulsion.** Every node pushes every other node away, like same-pole magnets. Strength fades with distance squared.
- **Springs with a hierarchy.** Links act as springs with a rest length, but the force is deliberately lopsided: a hub connected to many nodes resists, a leaf connected to one node swings. That asymmetry is why dragging feels organic instead of mechanical.
- **Even the randomness.** d3 breaks perfect symmetry with microscopic random nudges. The port copies d3's exact random-number generator, so behaviour is reproducible in tests.

Each force was written test-first: 17 automated tests pin the behaviour to the d3 source, including one that runs the site's real graph to sleep and checks it spreads out and stops.

## Step 2: Steal the settings from Obsidian itself

A correct engine with wrong settings still feels wrong, like a real piano tuned badly. The usual approach is to eyeball sliders until it "feels close." That was rejected.

Instead: Obsidian is installed on this Mac, and desktop apps like it ship their source code in a readable archive (an `.asar` file). Inside Obsidian 1.12.7's own files sits `sim.js`, the exact worker that runs its graph view. It was opened and read.

That single read produced things no amount of eyeballing would find:

- **The exact constants.** Repulsion −1000, link length 250, center pull 0.1, and the drag rule: on grab, Obsidian *jumps* the temperature straight to 0.3 rather than warming up gradually. That jump is why Obsidian responds instantly under your finger.
- **A whole missing force.** Obsidian runs a *collision* force (nodes have solid bodies, radius 60, that cannot overlap). Our engine did not have one. It was ported the same day. Without reading the source, we would have chased that gap with sliders forever and never closed it.
- **The exact force order.** Forces are applied in a specific sequence each frame. Matched.

## Step 3: Scale it to our world

Our graph runs in a smaller coordinate world than Obsidian's, 0.4 times the size. Distances scale by 0.4, but forces scale by 0.4² (0.16), the same way physics scales in a scale model. So Obsidian's repel −1000 becomes −160 here, link 250 becomes 100, collision radius 60 becomes 24. The trajectories stay geometrically identical, just smaller.

*(2026-08-01: repel was later tuned to −224, the equivalent of −1400 in Obsidian units, so node labels sit further apart and stay readable on mobile. A deliberate taste change on top of a faithful baseline.)*

## Step 4: Prove it with numbers, not vibes

"It feels the same" is a claim. To make it a measurement, Obsidian's own shipped simulator was executed in a sandbox on this site's real graph (25 nodes, 27 links, identical starting positions), side by side with our engine at Obsidian's native scale:

| Measurement | Obsidian's engine | Our engine |
|---|---|---|
| Frames until the graph falls asleep | 300 | 300 (exact match) |
| Average edge length at rest | 263.9 | 260.4 (within 1.3%) |
| Overall spread of the layout | 330.4 | 336.8 (within 1.9%) |

Individual node paths diverge frame to frame. That is expected and unavoidable: force layouts are chaotic systems, and Obsidian's engine uses an approximation for repulsion while ours computes it exactly. Even Obsidian run against itself twice will not match frame for frame. What defines *feel* is the statistical behaviour, and that matches within 2%.

## Why this worked

One principle, applied three times: **go to the primary source instead of approximating.**

1. Physics formulas came from d3-force's source code, not from memory of how force graphs work.
2. Settings came from Obsidian's own shipped code, not from slider guessing.
3. "It matches" came from racing the two engines on the same data, not from squinting at two screens.

At every layer where most projects would guess, the real thing was read. The result is not "inspired by Obsidian." It is Obsidian's simulation, transcribed, verified, and then tuned one notch to taste.
