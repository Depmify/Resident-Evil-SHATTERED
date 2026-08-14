# Installation Guide

This guide explains how to set up **RESIDENT EVIL: SHATTERED** from a public release package.

SHATTERED is a closed-source fan project. Public releases do **not** include original Resident Evil game assets, copyrighted data files, or commercial game content. You must provide your own legally obtained copy of the required game data.

## Supported Version

This build is expected to be used with **GOG's Resident Evil 1 PC Port**.

> Please also note that this build has only been tested on GOG's RE1 PC Port. Therefore, any issue reports that are using another version won't be taken in account until other versions of the game (Like PSX, Director's Cut, Dualshock, original 1997 PC Port) are officially supported.

Unsupported versions currently include:

- PlayStation / PSX releases
- Director's Cut
- DualShock Edition
- Original 1997 PC Port
- Any other non-GOG data layout

Reports using unsupported versions may be closed or deferred until those versions are officially supported.

## Requirements

- Windows
- A public SHATTERED release package
- A legally obtained copy of GOG's Resident Evil 1 PC Port
- The required .NET Desktop Runtime if the release is framework-dependent

If the release notes say the build is self-contained, you do not need to install .NET separately. If it is framework-dependent, install the **x86 .NET Desktop Runtime 10.0**.

## Expected Folder Layout

Place the launcher, the game executable, and the game data in one SHATTERED folder.

Recommended layout:

```text
RESIDENT EVIL SHATTERED/
  Resident Evil Launcher.exe
  SHATTERED.exe
  launcher-config.json        (created after saving launcher settings)
  Game/
    GOG PC Port/
      USA/
        Data/
          bio_card.dat
        Stage1/
        Stage2/
        Stage3/
        Stage4/
        Stage5/
        Stage6/
        Stage7/
        Movie/
        Sound/
        Voice/
        enemy/
        ITEM_M1/
        Item_m2/
        Effspr/
```

The most important file check is:

```text
Game/GOG PC Port/USA/Data/bio_card.dat
```

If that file is not present, SHATTERED will not be able to find the game data root.

Windows is usually case-insensitive, but keeping the folder names close to the layout above makes troubleshooting easier.

## Setup Steps

1. Download the latest SHATTERED release from the [Releases](https://github.com/Depmify/Resident-Evil-SHATTERED/releases) page.
2. Extract the release into a dedicated folder, for example `RESIDENT EVIL SHATTERED`.
3. Copy your GOG Resident Evil 1 PC Port game data into `Game/GOG PC Port/USA`.
4. Confirm that `Game/GOG PC Port/USA/Data/bio_card.dat` exists.
5. Start `Resident Evil Launcher.exe`.
6. Choose **Solo** for a standard launch, or **SplitScreen** to configure a two-player session before launch.

## Launcher Behavior

The launcher expects `SHATTERED.exe` to be next to the launcher or otherwise discoverable from the release folder.

- **Solo** starts `SHATTERED.exe` directly with no launcher configuration arguments.
- **SplitScreen** opens the setup flow first, saves launcher settings, then starts `SHATTERED.exe --config "<path-to-launcher-config.json>"`.
- **Settings** can configure resolution, FPS limit, language, and input mappings.
- **Inventory** can configure player loadouts before starting a configured session.
- Direct room tools rely on the `Stage1` through `Stage7` folders being present under the GOG data root.

Launching `SHATTERED.exe` by itself starts the normal full boot path with default standalone settings.

## Useful Runtime Keys

- `F3` toggles the FPS/debug overlay.
- `F11` toggles fullscreen.

## Troubleshooting

### `SHATTERED.exe was not found`

Make sure `SHATTERED.exe` is in the release folder next to `Resident Evil Launcher.exe`.

### `Could not locate Game\JPN`

Some internal messages may still use the older `Game\JPN` wording. For the GOG setup, this usually means SHATTERED could not find the game data root. Check that this file exists:

```text
Game/GOG PC Port/USA/Data/bio_card.dat
```

### Black screen, missing title screen, missing movies, or room load failures

Check that the copied GOG data includes the expected `Data`, `Movie`, `Sound`, `Voice`, `Stage*`, `enemy`, `ITEM_M1`, `Item_m2`, and `Effspr` folders.

### Empty room catalog in the launcher

The launcher room catalog checks the GOG path below and expects `Stage1` through `Stage7` folders:

```text
Game/GOG PC Port/USA
```

If the data is placed somewhere else, normal runtime discovery may still find some files, but launcher room selection can be incomplete.

### Crashes or startup errors

Look for logs next to the executables:

- `launcher-error.log`
- `depmify-runtime.log`

Include these logs when reporting crashes.

## Reporting Issues

When opening an issue, include:

- SHATTERED build or release version
- Windows version
- Confirmation that you are using GOG's Resident Evil 1 PC Port
- Whether you used Solo or SplitScreen
- Relevant launcher settings or `launcher-config.json`
- Room, character, loadout, or direct-room setup used
- Steps to reproduce
- Screenshots, video, or logs when available

Issue reports using unsupported game versions will not be prioritized until those versions are officially supported.

## Legal Notice

RESIDENT EVIL is a trademark of Capcom.

RESIDENT EVIL: SHATTERED is an unofficial fan project and is not affiliated with, endorsed by, sponsored by, or approved by Capcom.
