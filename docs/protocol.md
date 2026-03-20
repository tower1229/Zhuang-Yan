# persona-skill Protocol (v1)

This document defines the final input/output contract of `persona-skill`.
It is the implementation-facing protocol extracted from `persona-skill-design.md`.

## Skill Role

`persona-skill` is the expression layer:

- Consume factual state from `timeline-skill`
- Apply personality baseline (`SOUL`/`MEMORY`)
- Adjust interaction strategy using user/session signals
- Produce structured expressive state for consumer skills (e.g., Stella)

`persona-skill` does not own factual timeline generation.

## Input

### Explicit Input

- None required from end-user-facing callers.
- Runtime is triggered by orchestration (`timeline -> persona` chain).

### Internal Auto-Collected Inputs

- `timeline-skill` output (`TimelineWindow` / selected episode facts)
- `SOUL.md`
- `MEMORY.md`
- `USER.md`
- recent session signals (for interaction style tuning)

## Output

### Primary Output: Expressive State JSON

```json
{
  "scene": {
    "location": "indoor-home",
    "time_of_day": "evening",
    "activity": "resting-after-work"
  },
  "emotion": {
    "primary": "calm",
    "secondary": "slightly-satisfied",
    "intensity": 0.4
  },
  "appearance": {
    "outfit_style": "casual-comfortable",
    "grooming": "relaxed",
    "posture_energy": "low-key"
  },
  "camera": {
    "suggested_mode": "direct",
    "distance": "close-up",
    "lighting": "warm-indoor"
  },
  "confidence": 0.78,
  "signal_sources": ["timeline", "soul", "memory", "session-recent"]
}
```

## Required Contract for Downstream Consumers

Required output fields:

- `scene.location`
- `scene.activity`
- `scene.time_of_day`
- `emotion.primary`
- `appearance.outfit_style`
- `camera.suggested_mode`
- `camera.lighting`
- `confidence`

If required fields are missing, consumers must degrade safely.

## Consumption Contract from timeline-skill

Required fields from timeline input:

- `schema_version`
- `window.calendar_date`
- `resolution.mode`
- `episodes` (at least one)
- `episodes[*].temporal.start`
- `episodes[*].state_snapshot.scene.location_label`
- `episodes[*].state_snapshot.scene.activity`
- `episodes[*].state_snapshot.scene.time_of_day`
- `episodes[*].state_snapshot.emotion.primary`
- `episodes[*].state_snapshot.appearance.outfit_style`
- `episodes[*].provenance.confidence`

If no consumable episode exists, return low-confidence expressive output so
consumers can trigger fallback.

## Write Responsibility Boundary

- `persona-skill` is not the canonical memory writer.
- Pre-compaction flush or runtime backfill writes are executed by `timeline-skill`.
- `persona-skill` may trigger or prompt write behavior, but should not directly
  persist canonical timeline memory entries.

## Versioning

- `major` mismatch: reject and degrade.
- `minor` mismatch: ignore unknown fields when backward-compatible.
- Protocol upgrades must be synchronized with timeline and stella protocols.
