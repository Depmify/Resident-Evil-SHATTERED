"""Adds a published GitHub release to CHANGELOG.md.

Run by .github/workflows/changelog.yml when a release is published. The entry uses
the CHANGELOG shape the website reads (docs/app.js applies the same rules):

  ## <tag> — <subtitle>        subtitle = text after a dash in the release name, if any
  <release text>               without the Installation and Experimental sections
                               and without embedded images

If CHANGELOG.md already has a heading for the tag, nothing changes.
Usage: add_release_to_changelog.py [event.json] [CHANGELOG.md]
"""
import json
import os
import re
import sys

event_path = sys.argv[1] if len(sys.argv) > 1 else os.environ["GITHUB_EVENT_PATH"]
changelog_path = sys.argv[2] if len(sys.argv) > 2 else "CHANGELOG.md"

with open(event_path, encoding="utf-8") as f:
    release = json.load(f)["release"]

if release.get("draft") or release.get("prerelease"):
    print("Draft or pre-release: CHANGELOG.md left as it is.")
    sys.exit(0)

tag = release["tag_name"]
name = release.get("name") or ""
body = (release.get("body") or "").replace("\r\n", "\n").replace("\r", "\n")

with open(changelog_path, encoding="utf-8-sig") as f:  # tolerates a byte order mark
    changelog = f.read().replace("\r\n", "\n")

if re.search(rf"^##\s+{re.escape(tag)}(\s|$)", changelog, re.M):
    print(f"CHANGELOG.md already has {tag}.")
    sys.exit(0)

after_version = re.sub(r"^.*?\bv\d[\w.]*", "", name, count=1)
subtitle_match = re.search(r"\s[—–-]\s(.+)$", after_version)
subtitle = subtitle_match.group(1).strip() if subtitle_match else ""

kept, skip = [], False
for line in body.split("\n"):
    if re.match(r"^#{2,3}\s", line):
        skip = bool(re.search(r"installation|experimental", line, re.I))
    if not skip and not re.match(r"^\s*<", line):
        kept.append(line.rstrip())
text = re.sub(r"\n{3,}", "\n\n", "\n".join(kept)).strip()

heading = f"## {tag}" + (f" — {subtitle}" if subtitle else "")
entry = f"{heading}\n\n{text}\n\n"

lines = changelog.split("\n", 1)
if lines[0].startswith("# "):
    rest = lines[1].lstrip("\n") if len(lines) > 1 else ""
    updated = f"{lines[0]}\n\n{entry}{rest}"
else:
    updated = entry + changelog

with open(changelog_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(updated)
print(f"Added {heading} to CHANGELOG.md.")
