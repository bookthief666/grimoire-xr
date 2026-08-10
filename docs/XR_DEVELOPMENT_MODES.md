# Grimoire XR — Development and XR Test Modes

Grimoire XR intentionally separates three test modes so evidence from one is not accidentally promoted to another.

## 1. Flat browser — default

Open the app normally.

This renders the same R3F scene without an immersive XR session. Use it for:

- fast layout iteration;
- Fold/desktop touch and mouse smoke testing;
- Forge/oracle/archive behavior;
- visual inspection;
- ordinary Vercel preview checks.

`@react-three/xr`'s localhost device emulator is disabled by default. This prevents a machine without native WebXR from silently switching a normal flat-browser test into an emulated session.

## 2. Explicit desktop XR emulation

Append:

```text
?emulate=1
```

The XR store then enables the library's Meta Quest 3 IWER emulator. This is useful for exercising more of the XR session/input path on a development machine without putting on the headset.

Treat this as an intermediate test tier only. It does not validate:

- Quest GPU performance;
- optics/readability;
- real controller tracking or hand tracking;
- headset reference-space behavior;
- thermals;
- browser/device lifecycle edge cases.

The upstream emulator is experimental, so an emulation failure must be distinguished from a real-device failure before changing product behavior.

## 3. Real immersive Quest session — release evidence

Use the HTTPS LAN or deployed URL on the headset and enter `immersive-vr`.

This is the only tier that can close the real-headset items in `QUEST_QUALIFICATION.md`, including:

- XR origin / eye height;
- controller-ray capture and drift;
- headset-scale sightlines;
- sustained frame timing;
- repeated enter/exit behavior;
- chamber morph comfort and stability.

## Performance instrumentation

The performance probe is independent of the emulation switch:

```text
?perf=1
```

Examples:

```text
# Flat browser with performance report
?perf=1

# Explicit desktop XR emulator with performance report
?emulate=1&perf=1
```

On a real Quest, use `?perf=1` without `emulate=1`; native WebXR must be the runtime under qualification.

The most recent stable report is exposed at:

```js
window.__GRIMOIRE_XR_PERF__
```

See `QUEST_QUALIFICATION.md` for the required chamber capture sequence and promotion rules.
