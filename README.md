Tint the **VS Code title bar** on startup so multiple windows are easy to tell apart.

## How it works
- Picks **1 of 12 distinct colors** from a built-in palette.
- Choice is **deterministic**: hash the project identity
  - root folder **name** (default), or
  - root **package.json → name** (if present).
- Applies to `workbench.colorCustomizations` (title bar active/inactive + border).

## Commands
- **Project Tint: Apply** – force-apply the current color.
- **Project Tint: Reset All Customizations** – clear `workbench.colorCustomizations` and restore defaults.

## Settings
- `projectTint.autoApply` (default `true`) – apply on startup.