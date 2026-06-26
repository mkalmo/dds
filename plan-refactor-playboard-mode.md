# Plan: Refactor PlayBoardComp Mode Props

## Overview
Merge three separate mode concepts — `mode` prop (`'declarer' | 'defense'`), `defensePlayer` prop (`Player`), and `manualMode` state (`boolean`) — into a single `mode` prop: `'declarer' | 'defence_e' | 'defence_w' | 'manual'`. Manual mode toggle is handled via `currentMode`/`previousMode` state fields initialized from the prop.

## Files to Change
1. **`comp/PlayBoardComp.tsx`** — Main refactoring target
2. **`comp/AppComp.tsx`** — Update call sites, remove unused `Player` import

No changes needed: `ControlsComp.tsx`, `BoardListComp.tsx` (use URL paths, not component props). No tests reference `PlayBoardComp`.

---

## Step 1: PlayBoardComp.tsx — Change `Props` type (lines 13–17)

**Before:** `mode: 'declarer' | 'defense'`, `defensePlayer?: Player`
**After:** Define `type Mode = 'declarer' | 'defence_e' | 'defence_w' | 'manual'`. Props become `{ board: Board, mode: Mode }`. Remove `defensePlayer`.

## Step 2: PlayBoardComp.tsx — Change `State` type (lines 19–29)

Remove `manualMode: boolean`. Add `currentMode: Mode` and `previousMode: Mode`. Keep all other fields.

## Step 3: PlayBoardComp.tsx — Change initial state (lines 33–43)

Replace `manualMode: false` with `currentMode: this.props.mode` and `previousMode: this.props.mode`.

## Step 4: PlayBoardComp.tsx — Add helper getters (after line 43)

```ts
get isManual(): boolean { return this.state.currentMode === 'manual'; }
get isDefense(): boolean {
    return this.state.currentMode === 'defence_e' || this.state.currentMode === 'defence_w';
}
get defensePlayer(): Player | undefined {
    if (this.state.currentMode === 'defence_w') return Player.West;
    if (this.state.currentMode === 'defence_e') return Player.East;
    return undefined;
}
get originalMode(): Mode {
    return this.state.currentMode === 'manual' ? this.state.previousMode : this.state.currentMode;
}
```

## Step 5: PlayBoardComp.tsx — Refactor undo handler (lines 52–63)

**Before:** Nested `if (mode === 'defense') { if (manualMode) ... } else if (manualMode) ...`
**After:** Flat `if (this.isManual) { board.undoPlay() } else if (this.isDefense) { board.undo([this.defensePlayer]) } else { board.undo([Player.North, Player.South]) }`

## Step 6: PlayBoardComp.tsx — Refactor `makeOpponentMoveIfNeeded` (lines 104–127)

Replace `this.state.manualMode` → `this.isManual`, `this.props.mode === 'defense'` → `this.isDefense`, `this.props.defensePlayer` → `this.defensePlayer`.

## Step 7: PlayBoardComp.tsx — Refactor `toggleManualMode` (lines 149–156)

**Before:** Toggles `manualMode` boolean.
**After:** If `currentMode === 'manual'`, set `currentMode = previousMode` (and run makeOpponentMoveIfNeeded + redrawBoard in callback). Otherwise, set `previousMode = currentMode`, `currentMode = 'manual'`.

## Step 8: PlayBoardComp.tsx — Refactor `render` method (lines 158–268)

**8a.** Replace local variables: `isDefense = this.isDefense`, `isManual = this.isManual`, `defensePlayer = this.defensePlayer`. Remove `const manualMode = this.state.manualMode`.

**8b.** Visibility/clickability logic (lines 209–223): Replace `manualMode` with `isManual`. Structure stays the same. In manual mode, `isDefense=false` so all 4 hands become visible+clickable (matches spec: "All 4 hands visible and clickable").

**8c.** Header (lines 225–251): Use `this.originalMode` to determine defense vs declarer display context. Replace `manualMode` → `isManual` for the toggle button text.

## Step 9: AppComp.tsx — Update call sites (lines 39–44)

**Before:** `mode="defense" defensePlayer={Player.West}` / `mode="defense" defensePlayer={Player.East}`
**After:** `mode="defence_w"` / `mode="defence_e"`. Remove `Player` from the import on line 7.

## Step 10: Verify completeness

- `ControlsComp.tsx` — routes only, no component props → no changes
- `BoardListComp.tsx` — `<Link>` URLs only → no changes
- `spec/` — no tests reference PlayBoardComp → no test updates needed

---

## Behavior Notes

- **Manual mode from defense**: Currently North is only visible when `showDummy=true` even in manual+defense. After refactoring, manual mode shows all 4 hands unconditionally. This matches the stated spec ("All 4 hands visible and clickable").
- **Header in manual mode**: Uses `originalMode` so "Defense - ♠ 3/10" still displays correctly when toggled to manual from a defense mode.
- **Toggle back from manual**: Restores `previousMode`, then auto-plays opponent moves if needed.

## Testing Strategy

- Run `npm test` to ensure existing tests pass (they don't reference PlayBoardComp but verify no regressions)
- Run `npx webpack` to verify the build compiles
- Manual testing: verify all 3 routes (`/play`, `/defence_w`, `/defence_e`) work, and manual toggle works from each

## Estimated Effort
- **Complexity**: Low-medium
- **Files changed**: 2
- **Risk**: Low (prop interface change is internal, no external consumers)

