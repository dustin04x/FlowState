# FlowState

<p align="center">
  <img src="./assets/flowstate-logo.svg" alt="FlowState — Get in. Lock in. Get out." width="480">
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
  <a href="https://github.com/dustin04x/FlowState/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/dustin04x/FlowState"></a>
  <a href="https://dustin04x.github.io/FlowState/"><img alt="Website" src="https://img.shields.io/badge/website-GitHub%20Pages-blue"></a>
</p>

A compact, local-first desktop focus timer. Start a session, take a break, and come back to work without a bigger productivity system.

**Website:** [FlowState on GitHub Pages](https://dustin04x.github.io/FlowState/)

The site publishes from `main` through GitHub Actions.

## Download

Latest release: **[v1.0.2](https://github.com/dustin04x/FlowState/releases/tag/v1.0.2)**

| Platform | Download |
|---|---|
| Windows | [Installer (x64)](https://github.com/dustin04x/FlowState/releases/download/v1.0.2/FlowState-1.0.2-x64.exe) |
| macOS — Apple Silicon | [DMG](https://github.com/dustin04x/FlowState/releases/download/v1.0.2/FlowState-1.0.2-arm64.dmg) |
| macOS — Intel | [DMG](https://github.com/dustin04x/FlowState/releases/download/v1.0.2/FlowState-1.0.2-x64.dmg) |
| Linux — Ubuntu/Debian | [`.deb`](https://github.com/dustin04x/FlowState/releases/download/v1.0.2/FlowState-1.0.2-amd64.deb) |
| Linux — AppImage | [AppImage](https://github.com/dustin04x/FlowState/releases/download/v1.0.2/FlowState-1.0.2-x86_64.AppImage) |

The Windows installer and macOS app are unsigned, so SmartScreen or Gatekeeper may warn. Linux and macOS packages have not been verified on physical systems.

## Features

- Focus presets of 25, 45, and 60 minutes, plus adjustable focus time.
- Configurable short and long breaks, daily goals, and optional automatic starts.
- Tray controls; hiding the window does not stop a session.
- Daily progress, recent activity, total focus time, completed sessions, and a streak.
- Settings and session history stay on your device. There is no account or sync service.

## Screenshots

Captures of the actual Windows app.

| Focus | Break | Activity |
|---|---|---|
| <img src="./docs/assets/focus-idle.png" alt="FlowState focus timer ready to start" width="260"> | <img src="./docs/assets/break-mode.png" alt="FlowState short-break timer" width="260"> | <img src="./docs/assets/statistics.png" alt="FlowState activity and focus statistics" width="260"> |

## Run from source

Requires Node.js and npm.

```powershell
git clone https://github.com/dustin04x/FlowState.git
cd FlowState
npm ci
npm run dev
```

Checks and build:

```powershell
npm test
npm run typecheck
npm run build
```

Website:

```powershell
npm run website:dev
npm run website:build
```

## Credits and license

Founded and created by **Skander Wali**.

FlowState is available under the [MIT License](./LICENSE).