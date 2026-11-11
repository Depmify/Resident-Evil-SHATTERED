# Installation Guide

This guide explains how to set up **RESIDENT EVIL: SHATTERED** from a public release package.

SHATTERED is a closed-source fan project. Public releases do **not** include original Resident Evil game assets, copyrighted data files, or commercial game content. You must provide your own legally obtained copy of the required game data.

## Supported Versions

Starting with v0.1.7, SHATTERED supports essentially **any existing PC version of Resident Evil 1**, including:

- GOG
- Steam
- Sourcenext

Unsupported versions currently include:

- PlayStation / PSX releases
- Director's Cut
- DualShock Edition
- Any other non-PC release

Reports using unsupported versions may be closed or deferred until those versions are officially supported.

## Requirements

- 64-bit Windows
- The **.NET 10 Desktop Runtime (x64)**, which public releases do not bundle
- A public SHATTERED release package
- A legally obtained PC copy of Resident Evil 1 (GOG, Steam, Sourcenext, or another existing PC version)

## Expected Folder Layout

Extract the release into its own SHATTERED folder. You do not need to copy your game data into it: the launcher points to your existing Resident Evil 1 installation.

```text
RESIDENT EVIL SHATTERED/
  Launcher.exe
  SHATTERED.exe
  Settings.ini        (created when the launcher or the game saves settings)
```

## Setup Steps

1. Download the latest SHATTERED release from the [Releases](https://github.com/Depmify/Resident-Evil-SHATTERED/releases) page.
2. Extract the release into a dedicated folder, for example `RESIDENT EVIL SHATTERED`.
3. Start `Launcher.exe`.
4. In the **LAUNCH** tab, select your Resident Evil 1 PC installation folder (GOG, Steam, Sourcenext, or another PC version).
5. Press **START GAME**.
6. In the game, choose how to play from the main menu:
   - **NEW GAME > SINGLEPLAYER** to play alone.
   - **NEW GAME > COOPERATIVE** for two-player SplitScreen on one PC (Story Mode or Tyrant Battle).
   - **MULTIPLAYER** to create or join an online or LAN room.

## Cooperative Play and Mods

SplitScreen supports two players on one PC.

Online sessions support up to **four players**:

- **Two players:** the complete campaign can be played online from beginning to end.
- **Three or four players (experimental):** the campaign can be played up to the laboratories, but it **cannot be completed yet**. Expect bugs and synchronization issues.

See the [v0.1.10 release notes](https://github.com/Depmify/Resident-Evil-SHATTERED/releases/tag/v0.1.10) for the current release details.

Online and LAN rounds include radio voice chat: hold the push-to-talk button to speak.

Players with different mods installed can start a round together. Check each mod's instructions and compatibility information before installing it.

## The Launcher

The launcher expects `SHATTERED.exe` to be next to it in the release folder. Its settings save automatically to `Settings.ini`.

- **LAUNCH**: your Resident Evil 1 PC data folder, display options, the inventory style for each player, and **START GAME**.
- **CONTROLS**: keyboard, mouse and gamepad bindings for each player.
- **SUPPORT**: a link to support the project.

Starting `SHATTERED.exe` directly uses the same saved settings.

## Controls and Keys

Every control can be changed in the launcher's **CONTROLS** tab or in the game under **OPTIONS > CONTROLS**. The mouse works in every menu. Default keys include:

- `F3` shows or hides the FPS and game info panel.
- `F11` toggles fullscreen.

## Troubleshooting

### `SHATTERED.exe was not found`

Make sure `SHATTERED.exe` is in the release folder next to `Launcher.exe`.

### The game cannot find your Resident Evil 1 data

Open the launcher and check that the folder in the **LAUNCH** tab is the root of your Resident Evil 1 PC installation, not a subfolder.

### Black screen, missing title screen, missing movies, or room load failures

Check that the selected game installation is complete and includes the expected `Data`, `Movie`, `Sound`, `Voice`, `Stage*`, `enemy`, `ITEM_M1`, `Item_m2`, and `Effspr` folders.

### Crashes or startup errors

When SHATTERED closes because of an error, it writes `Crash.log` next to `SHATTERED.exe`, or to `%LOCALAPPDATA%\Resident Evil SHATTERED\Crash.log` if that folder cannot be written. Problems while saving or loading a game also write `SaveError.log` or `LoadError.log`.

Include these logs when reporting crashes.

## Reporting Issues

When opening an issue, include:

- SHATTERED build or release version
- Windows version
- Which PC version of Resident Evil 1 you are using (GOG, Steam, Sourcenext, etc.)
- Whether you used Solo, SplitScreen, or Online, and how many players were in the session
- Your `Settings.ini`
- Room, character, and difficulty where it happened
- Steps to reproduce
- Screenshots, video, or logs when available

Issues in three- or four-player online sessions are welcome, but keep in mind that this mode is experimental and cannot reach the ending yet.

Issue reports using unsupported game versions will not be prioritized until those versions are officially supported.

## Legal Notice

RESIDENT EVIL is a trademark of Capcom.

RESIDENT EVIL: SHATTERED is an unofficial fan project and is not affiliated with, endorsed by, sponsored by, or approved by Capcom.
