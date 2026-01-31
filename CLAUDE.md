# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dds.js** - A Double Dummy Solver for Bridge card game. Interactive web application for practicing bridge play (declarer and defense) with an optimal play solver powered by WebAssembly.

## Build Commands

```bash
npm install          # Install dependencies
npx webpack          # Build production bundle (outputs to dist/code.bundle.js)
npm test             # Run Jest test suite
```

**Development server**: Use `http-server .` to serve static files (PHP server needed for API endpoints).

**Deployment**: `./deploy.sh` copies build to `/var/www/html/dds`.

## Testing

- Framework: Jest with ts-jest
- Test files: `spec/` directory (`board.spec.ts`, `deal.spec.ts`, `wasm.spec.ts`)
- Run single test: `npx jest spec/board.spec.ts`

## Architecture

### Module Loading

Uses two parallel module systems:
1. **Webpack** for production bundling (entry: `index.tsx`)
2. **SystemJS** with runtime Babel transpilation for development (`systemjs-setup.js` - fetches `.tsx`/`.ts` files and transpiles in browser)

### Core Domain Models (`modules/`)

- **Card.ts** - Card representation (rank + suit), parsing, comparison
- **Deal.ts** - Card distribution for 4 players (N/E/S/W), PBN conversion, HCP calculation
- **Board.ts** - Game state: current player, trick progress, play validation (suit following), undo
- **Trick.ts** - Single trick (4 plays), winner determination based on trump

### WASM Integration

- **Wasm.ts** - Wrapper around compiled C++ double dummy solver (`out.js`)
  - `calcDDTable(pbn)` - Calculate optimal tricks per strain for all positions
  - `nextPlays(pbn, strain, plays)` - Get optimal plays for current position
- **DDTableResult.ts** / **NextPlaysResult.ts** - Parse solver responses

### React Components (`comp/`)

- **AppComp.tsx** - Root with React Router v5, WASM initialization
- **PlayBoardComp.tsx** - Declarer play interface (class component with keyboard handlers)
- **DefensePlayBoardComp.tsx** - Defense play interface
- **ControlsComp.tsx** - Main panel: PBN input, save, print generation
- **PlayHandComp.tsx** - Renders 13-card hand with click handlers

### Routing (React Router v5)

- `/play` - Declarer play mode
- `/defense` - Defense mode
- `/generate-print/:count` - Generate practice boards
- `/show-print` - Display generated boards
- `/boards` - Saved boards list
- `/` - Control panel

### Data Persistence

- **Dao.ts** → **api-caller.ts** → `api.php` → **BoardRepository.php**
- Storage: `data.json` file (JSON-based persistence)
- Operations: save, get, update difficulty rating

## Key Technical Notes

1. **PBN Notation**: Portable Bridge Notation is used throughout for deal serialization. Format: `N:xxx.xxx.xxx.xxx xxx.xxx.xxx.xxx ...` (4 hands, suits separated by dots)

2. **Bridge Rules**: Code enforces suit following (must follow lead suit if able) and trump mechanics

3. **WASM file**: `out.js` is a pre-compiled C++ solver - not source code in this repo

4. **Class component**: `PlayBoardComp.tsx` uses React class component (handles keyboard events in lifecycle methods)

5. **No linter**: Project has no ESLint/Prettier configuration
