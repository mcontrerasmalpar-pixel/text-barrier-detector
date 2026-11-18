# `@maky/text-barrier-core`

Deterministic readability and plain-language barrier detector for **English (`en`)** and **Spanish (`es`)** text. Zero runtime dependencies, no DOM, no network calls.

## Installation

```bash
npm install @maky/text-barrier-core
```

## Usage

```ts
import { analyze, findBarriers } from '@maky/text-barrier-core';

const report = analyze('The report was written by the team. She is turned on.', { lang: 'en' });
console.log(report.overallScore); // 77
console.log(report.passiveCount); // 1 ("She is turned on" is ignored)
console.log(report.level);        // { level: 'A2', label: 'Easy', disclaimer: '...', ... }

const issues = findBarriers('Se registró el usuario. Se me olvidó la contraseña.', { lang: 'es' });
console.log(issues);
// [
//   { type: 'passive', start: 0, end: 11, sentenceIndex: 0, text: 'Se registró', lang: 'es', reason: '...' },
//   { type: 'complex_word', start: 40, end: 50, sentenceIndex: 1, text: 'contraseña', lang: 'es', reason: '...' }
// ]
```

## License

[MIT](./LICENSE) © 2026 Maria Contreras
