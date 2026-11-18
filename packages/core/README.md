# `@maky/text-barrier-core`

Deterministic readability and plain-language barrier detector for **English (`en`)** and **Spanish (`es`)** text. Zero runtime dependencies, no DOM, no network calls.

## Usage

```ts
import { analyze, findBarriers } from '@maky/text-barrier-core';

const report = analyze('The report was written by the team. She is turned on.', { lang: 'en' });
const issues = findBarriers('The report was written by the team. She is turned on.', { lang: 'en' });
```
