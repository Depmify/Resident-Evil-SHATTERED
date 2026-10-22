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

- Windows
- A public SHATTERED release package
- A legally obtained PC copy of Resident Evil 1 (GOG, Steam, Sourcenext, or another existing PC version)
- The required .NET Desktop Runtime if the release is framework-dependent

If the release notes say the build is self-contained, you do not need to install .NET separately. If it is framework-dependent, install the **x86 .NET Desktop Runtime 10.0**.

## Expected Folder Layout

Extract the release into its own SHATTERED folder. You do not need to copy your game data into it: the launcher points to your existing Resident Evil 1 installation.

```text
RESIDENT EVIL SHATTERED/
  Resident Evil Launcher.exe
  SHATTERED.exe
  launcher-config.json        (created after saving launcher settings)
```

## Setup Steps

1. Download the latest SHATTERED release from the [Releases](https://github.com/Depmify/Resident-Evil-SHATTERED/releases) page.
2. Extract the release into a dedicated folder, for example `RESIDENT EVIL SHATTERED`.
3. Start `Resident Evil Launcher.exe`.
4. In the launcher, select your Resident Evil 1 PC installation folder (GOG, Steam, Sourcenext, or another PC version).
5. Choose **Solo** for a standard launch, **SplitScreen** to configure a two-player local session, or play **Online**.

## Cooperative Play and Mods

SplitScreen supports two players on one PC.

Online sessions support up to **four players**:

- **Two players:** the complete campaign can be played online from beginning to end.
- **Three or four players (experimental):** the campaign can be played up to the laboratories, but it **cannot be completed yet**. Expect bugs and synchronization issues.

See the [v0.1.7 release notes](https://github.com/Depmify/Resident-Evil-SHATTERED/releases/tag/v0.1.7) for the current release details.

SHATTERED v0.1.7 includes improved mod features. Check each mod's instructions and compatibility information before installing it.

## Launcher Behavior

The launcher expects `SHATTERED.exe` to be next to the launcher or otherwise discoverable from the release folder.

- **Solo** starts `SHATTERED.exe` directly with no launcher configuration arguments.
- **SplitScreen** opens the setup flow first, saves launcher settings, then starts `SHATTERED.exe --config "<path-to-launcher-config.json>"`.
- **Settings** configures general game options, including display, language, and input mappings.
- The game installation selected in the launcher is used as the game data root. Direct room tools rely on the `Stage1` through `Stage7` folders being present in that installation.

Launching `SHATTERED.exe` by itself starts the normal full boot path with default standalone settings.

## Useful Runtime Keys

- `F3` toggles the FPS/debug overlay.
- `F11` toggles fullscreen.

## Troubleshooting

### `SHATTERED.exe was not found`

Make sure `SHATTERED.exe` is in the release folder next to `Resident Evil Launcher.exe`.

### `Could not locate Game\JPN`

Some internal messages may still use the older `Game\JPN` wording. This usually means SHATTERED could not find the game data root. Open the launcher and check that the selected game installation is the root folder of your Resident Evil 1 PC installation.

### Black screen, missing title screen, missing movies, or room load failures

Check that the selected game installation is complete and includes the expected `Data`, `Movie`, `Sound`, `Voice`, `Stage*`, `enemy`, `ITEM_M1`, `Item_m2`, and `Effspr` folders.

### Empty room catalog in the launcher

The launcher room catalog expects `Stage1` through `Stage7` folders inside the selected game installation. Check that the launcher points to the root of your installation and not to a subfolder.

### Crashes or startup errors

Look for logs next to the executables:

- `launcher-error.log`
- `depmify-runtime.log`

Include these logs when reporting crashes.

## Reporting Issues

When opening an issue, include:

- SHATTERED build or release version
- Windows version
- Which PC version of Resident Evil 1 you are using (GOG, Steam, Sourcenext, etc.)
- Whether you used Solo, SplitScreen, or Online, and how many players were in the session
- Relevant launcher settings or `launcher-config.json`
- Room, character, loadout, or direct-room setup used
- Steps to reproduce
- Screenshots, video, or logs when available

Issues in three- or four-player online sessions are welcome, but keep in mind that this mode is experimental and cannot reach the ending yet.

Issue reports using unsupported game versions will not be prioritized until those versions are officially supported.

## Legal Notice

RESIDENT EVIL is a trademark of Capcom.

RESIDENT EVIL: SHATTERED is an unofficial fan project and is not affiliated with, endorsed by, sponsored by, or approved by Capcom.
