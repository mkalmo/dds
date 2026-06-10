# TODO — Issues found in code review (2026-06-10)

Build status at time of review: `tsc --noEmit` clean, webpack build OK (bundle-size warnings only), all 7 Jest tests pass.

## Confirmed bugs

- [ ] **`modules/Trick.ts` — inverted validation in constructor (line 11)**
  `if (plays.length > 4) throw Error('incomplete trick')` never fires (a trick can't exceed 4 plays).
  Should be `plays.length !== 4`. An incomplete trick crashes `winner()`, which hard-codes
  `for (let i = 1; i < 4; i++)` and reads `this.plays[i].card` on undefined.

- [ ] **`comp/PlayBoardComp.tsx` — crash at end of game in `makeOpponentMoveIfNeeded()`**
  No `board.isCompleted()` guard. After the 52nd card, if the final trick is won by an opponent,
  `getCorrectPlays(board)` runs on an empty board; the solver returns
  `{"error": -2, "message": "Zero cards"}` (verified) and `Wasm.nextPlays` throws.
  - Declarer mode (line ~129): triggers when E/W wins the last trick.
  - Defense mode (lines ~123–127): triggers whenever the last winner isn't the defense player.
  Fix: return early when `board.isCompleted()`.

- [ ] **`api.php` — uncaught exceptions from `BoardRepository`**
  `save()`/`create()`/`update()` throw `RuntimeException` (duplicate PBN, missing fields,
  board not found) but `api.php` has no try/catch. Client gets a 500 with a PHP fatal-error
  body instead of JSON, so the UI only shows "API call failed with status 500".
  Fix: wrap handlers in try/catch and return a JSON error with an appropriate status code.

- [ ] **`BoardRepository.php` — dynamic properties on `BoardDto` (lines 139–140)**
  `$board->createdAt` / `$board->updatedAt` are not declared on the class. Deprecated in
  PHP 8.2+ (notices can corrupt the JSON response). Also dropped on read (`fromArray()`
  ignores them) and `update()` never refreshes `updatedAt`.
  Fix: declare the properties on `BoardDto` and handle them in `fromArray()`/`update()`.

## Minor / fragile spots

- [ ] **`modules/NextPlaysResult.ts` (line 38)** — `[play.rank, ...play.equals].sort()` sorts
  ranks lexicographically ('2' < 'A' < 'J' < 'Q' < 'T'), not by card value. Consumers taking
  `correctPlays[0]` get an arbitrary, alphabetically-first card.

- [ ] **`BoardRepository.php` — `loadData()`** — empty/corrupted `data.json` makes
  `json_decode` return `null`, violating the `array` return type (fatal error).

- [ ] **`comp/GeneratePrintBoardListComp.tsx`** — `count` prop typed `number` but receives a
  string from the route param; works only via coercion in `Array.from({length: count})`.
  Same pattern in `ControlsComp`: `setCount(e.target.value)` stores a string in number state.

- [ ] **`comp/PrintBoardComp.tsx` / `comp/TrickComp.tsx`** — `key` declared in Props; React
  reserves `key` and never delivers it as a prop.

- [ ] **`modules/Deal.ts` — `parsePBNStrings()`** — doesn't handle the PBN convention of `-`
  for an empty hand; double spaces break the 4-part split.

- [ ] **`modules/Board.ts`** — `tricks` declared `readonly` but mutated via `this.tricks.pop()`
  in `undoPlay()`; legal at runtime but contradicts declared intent.

- [ ] **`CLAUDE.md` stale** — references `DefensePlayBoardComp.tsx` and a `/defense` route;
  actual code uses `PlayBoardComp` with a `mode` prop and routes `/defence_w` / `/defence_e`.

## Suggested follow-up

- [ ] Add a test for the end-of-game scenario in `spec/board.spec.ts` (opponent wins final trick).

## Design / architectural issues

- [ ] **Strict TypeScript is off** — `tsconfig.json` has `noImplicitAny` but no `strict`/`strictNullChecks`.
  Several confirmed bugs (nullable `getLastPlay()`, `findHCPCombination` returning `null` into a
  `string[]`) are exactly what `strictNullChecks` catches. Enable `strict: true` and fix the fallout.

- [ ] **Mutable domain model fighting React** — components mutate `Board`/`Deal` in place, then mirror
  state into React via `redrawBoard()`; `PlayBoardComp` keeps a duplicate copy that can desync.
  `AppComp.getPlayBoard()` constructs a new `Board` on every render and passes it as a prop.
  Fix: make `Board` the single source of truth re-rendered off a version counter (or immutable plays),
  and create the board in `useMemo` keyed by `pbn`/`strain`.

- [ ] **Side effects in render + synchronous WASM on the UI thread** —
  `GeneratePrintBoardListComp` generates/solves boards in the render body (runs twice under
  StrictMode, re-runs on re-render); `ShowPrintBoardListComp` synchronously solves a full playout
  per saved board in `componentDidMount`, freezing the UI.
  Fix: move into `useEffect`/`useMemo`; longer-term run the solver in a Web Worker.

- [ ] **Global `Module` + ad-hoc `new Wasm(Module)`** — five files declare the global and construct
  fresh `Wasm` instances (each re-doing `cwrap`); no guard that WASM init finished before first use.
  Fix: initialize once at startup, gate rendering on readiness, provide via context/singleton.

- [ ] **Dual build systems** — webpack for production, SystemJS + in-browser Babel for dev, with
  vendored React bundles in `libs/` (version drift risk) and `.ts`-extension imports existing only
  to serve SystemJS. Fix: consolidate on Vite; drop `libs/`, `systemjs-setup.js`, `babel.min.js`.

- [ ] **No real API contract; inconsistent error handling** — client `ApiResponse` is synthesized from
  HTTP status alone; PHP returns raw DTOs or varying error shapes whose bodies are discarded.
  TS code throws strings in some places, `Error` in others; `error-reporter.ts` manipulates the DOM
  outside React; `api-caller` console-logs while callers also call `showApiError`.
  Fix: PHP always returns `{success, data, error}`; throw only `Error`; one user-facing error channel.

- [ ] **`data.json` read-modify-write with no locking** — concurrent saves can lose writes, `nextId`
  can race. Fix: `flock()` or SQLite.

- [ ] **`PlayBoardComp` has too many responsibilities** — opponent AI, mode logic, undo semantics,
  keyboard handling, wrong-card acceptance, and rendering in one class component.
  Fix: extract a non-React `GameController` (unit-testable), leave the component as a thin view.

- [ ] **Untyped WASM boundary** — cwrap'd functions are `any`, results are `JSON.parse` + `as` casts,
  `DDSModule.setValue` typed `() => any` but called with 3 args. Fix: type the boundary and validate
  solver responses in `fromRaw`.

- [ ] **Thin test coverage where logic is trickiest** — no tests for `Trick.winner()` trump logic,
  undo edge cases, `NextPlayCalculator`, `generator.ts`, `isValidPlay` discard rules, or components.
  Both confirmed bugs live in untested areas.

- [ ] **Repository cruft** — `scratch/`, `prompts/`, `proto/`, `plan-refactor-playboard-mode.md`,
  commented-out blocks (generator.ts, PrintBoardComp), unused deps (`underscore`, `mocha`, `chai`,
  `babel-core@5`), `main: "old/dds.js"` pointing nowhere, duplicate `SUIT_RANKS`/`SUIT_RANKS1`,
  stale CLAUDE.md. Do a cleanup pass.

### Priority order

1. Enable `strict` TypeScript.
2. Fix render-phase side effects; add WASM init/readiness gate.
3. Standardize API envelope + error handling.
4. Extract game logic from `PlayBoardComp`; add tests around it.
5. Consolidate build on Vite; cleanup pass.
6. Opportunistic: immutable/source-of-truth board model, file locking.
