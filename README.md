# @gagandeep023/pulse-weave

**Feel the rhythm. Thread the needle.**

A rhythm-timing browser game where concentric rings pulse and rotate around the center of the screen. Each ring has a gap. Tap to advance your dot outward through the gaps. Miss a gap and you bounce back to the center.

## Install

```bash
npm install @gagandeep023/pulse-weave
```

## Usage

```tsx
import { PulseWeaveGame } from '@gagandeep023/pulse-weave/frontend';
import '@gagandeep023/pulse-weave/frontend/styles.css';

function App() {
  return <PulseWeaveGame />;
}
```

## How to Play

1. Rings rotate around the center. Each has a gap.
2. Tap anywhere to jump to the next ring outward.
3. Time it right to pass through the gap.
4. Miss the gap and you bounce back to the center.
5. Three bounces in one level and the run ends.

Reach the outermost ring to complete a level. Score is total levels cleared.

## Exports

- `@gagandeep023/pulse-weave/frontend` - React components and game engine
- `@gagandeep023/pulse-weave/types` - TypeScript type definitions
- `@gagandeep023/pulse-weave/frontend/styles.css` - Default dark theme styles

## Requests and feedback

[![Request a feature](https://img.shields.io/badge/request-a%20feature-64ffda)](https://github.com/Gagandeep023/pulse-weave/discussions/new?category=ideas)
[![Report a bug](https://img.shields.io/badge/report-a%20bug-cc4444)](https://github.com/Gagandeep023/pulse-weave/issues/new?template=bug_report.yml)

Ideas and questions go to Discussions, bugs to Issues.

## License

MIT
