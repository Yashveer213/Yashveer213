#!/usr/bin/env python3
"""Render API-visible GitHub contribution days as a self-contained SVG.

Python standard library only. API/network failures leave the last good image
untouched. No repository names, source code, or credentials are written.
"""
import argparse
from datetime import date, datetime, timezone
from html import escape
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date weekday contributionCount } }
      }
    }
  }
}
"""


def fetch_calendar(username, token):
    request = Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": QUERY, "variables": {"login": username}}).encode(),
        headers={"Authorization": f"Bearer {token}",
                 "Content-Type": "application/json", "User-Agent": "profile-activity-svg"},
        method="POST",
    )
    with urlopen(request, timeout=30) as response:
        payload = json.load(response)
    if payload.get("errors"):
        raise ValueError("GitHub GraphQL returned errors; no artwork was changed.")
    user = payload.get("data", {}).get("user")
    if not user:
        raise ValueError("GitHub user was not found; check PROFILE_USERNAME.")
    return user["contributionsCollection"]["contributionCalendar"]


def validate_calendar(calendar):
    weeks = calendar.get("weeks")
    if not isinstance(weeks, list) or not 1 <= len(weeks) <= 54:
        raise ValueError("Missing or invalid calendar weeks.")
    total = calendar.get("totalContributions")
    if type(total) is not int or total < 0:
        raise ValueError("Invalid contribution total.")
    cells, seen = [], set()
    previous = None
    for week, value in enumerate(weeks):
        days = value.get("contributionDays")
        if not isinstance(days, list) or not 1 <= len(days) <= 7:
            raise ValueError("Invalid calendar week.")
        for day in days:
            stamp = date.fromisoformat(day["date"])
            count, weekday = day["contributionCount"], day["weekday"]
            if type(count) is not int or count < 0:
                raise ValueError("Invalid daily contribution count.")
            if type(weekday) is not int or not 0 <= weekday <= 6:
                raise ValueError("Invalid weekday.")
            if weekday != (stamp.weekday() + 1) % 7:
                raise ValueError("Calendar weekday and date do not match.")
            if stamp in seen or (previous and stamp <= previous):
                raise ValueError("Duplicate or unordered calendar date.")
            seen.add(stamp)
            previous = stamp
            cells.append((week, weekday, count, stamp.isoformat()))
    if not cells:
        raise ValueError("Empty calendar; retaining existing artwork.")
    return cells


def text(x, y, value, size=14, color="#ada5a5", weight="400", extra=""):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" '
            f'font-weight="{weight}" {extra}>{escape(str(value))}</text>')


def polygon(points, color):
    coords = " ".join(f"{x:.2f},{y:.2f}" for x, y in points)
    return f'<polygon points="{coords}" fill="{color}" stroke="#0c0d11" stroke-width=".65"/>'


def block(x, y, height, level, label):
    colors = [
        ("#24242b", "#18191f", "#202027"),
        ("#734347", "#3c282e", "#533139"),
        ("#b05a58", "#613137", "#864045"),
        ("#e68174", "#8a4249", "#b25456"),
        ("#f5b19a", "#ae5655", "#de7e6d"),
    ][level]
    a, b, c, d = (x, y-height), (x+12, y+3-height), (x+4, y+9-height), (x-8, y+6-height)
    return (f'<g><title>{escape(label)}</title>'
            + polygon([d, c, (x+4, y+9), (x-8, y+6)], colors[1])
            + polygon([c, b, (x+12, y+3), (x+4, y+9)], colors[2])
            + polygon([a, b, c, d], colors[0]) + '</g>')


def render(calendar, username, updated):
    pending = calendar is None
    cells = [] if pending else validate_calendar(calendar)
    peak = max((cell[2] for cell in cells), default=0)
    active = sum(cell[2] > 0 for cell in cells)
    title = "Activity awaiting first refresh" if pending else f"{username}: GitHub contribution activity"
    description = ("No activity data has been loaded. Run the included GitHub Actions workflow."
                   if pending else f"{calendar['totalContributions']} API-visible contributions; "
                   f"{active} active days; {peak} contributions on the busiest day. "
                   "Block height uses a logarithmic scale. Private and local work may be absent.")
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="490" viewBox="0 0 1200 490" role="img" aria-labelledby="title desc">',
        f'<title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc>',
        '<rect width="1200" height="490" rx="18" fill="#0e1015"/>',
        '<rect x=".5" y=".5" width="1199" height="489" rx="18" fill="none" stroke="#2c2b33"/>',
        '<g font-family="Arial, Helvetica, sans-serif">',
        text(36, 38, "THE BUILD LOG", 12, "#ee9184", "700", 'letter-spacing="2.5"'),
        text(1164, 38, "3D CONTRIBUTION CALENDAR", 11, "#a59a9e", extra='text-anchor="end" letter-spacing="1.5"'),
        text(36, 92, "—" if pending else f"{calendar['totalContributions']:,}", 34, "#eee5df", "700"),
        text(36, 116, "CONTRIBUTIONS", 10, extra='letter-spacing="1.5"'),
        text(287, 92, "—" if pending else f"{active:,}", 34, "#eee5df", "700"),
        text(287, 116, "ACTIVE DAYS", 10, extra='letter-spacing="1.5"'),
        text(489, 92, "—" if pending else f"{peak:,}", 34, "#eee5df", "700"),
        text(489, 116, "BUSIEST DAY", 10, extra='letter-spacing="1.5"'),
        text(1164, 87, "Awaiting first refresh" if pending else f"Updated {updated}", 13, "#dcb2aa", extra='text-anchor="end"'),
        text(1164, 111, "API-visible activity / daily schedule", 12, extra='text-anchor="end"'),
        '<path d="M36 141H1164" stroke="#292b33"/>',
    ]
    if pending:
        cells = [(w, d, 0, "No data loaded") for w in range(53) for d in range(7)]
    # Back-to-front ordering preserves overlapping faces of the isometric bars.
    for week, day, count, stamp in sorted(cells, key=lambda cell: (cell[0]*3.2 + cell[1]*7.5, cell[0])):
        height = 2 if count == 0 else 5 + 61 * math.log1p(count) / math.log1p(peak)
        level = 0 if count == 0 else min(4, max(1, math.ceil(4 * math.log1p(count) / math.log1p(peak))))
        parts.append(block(200 + week*17 - day*9.5, 221 + week*3.2 + day*7.5,
                           height, level, stamp if pending else f"{stamp}: {count} contributions"))
    if pending:
        parts += [
            '<rect x="303" y="269" width="594" height="82" rx="12" fill="#15171e" stroke="#625058"/>',
            text(600, 301, "The next build leaves a trace.", 22, "#eee5df", "600", 'text-anchor="middle"'),
            text(600, 328, "Run “Refresh profile activity” to load the real calendar.", 14, extra='text-anchor="middle"'),
        ]
    else:
        parts.append(text(36, 463, f"{cells[0][3]} → {cells[-1][3]} · Height: log scale · Private / local work may be absent", 12))
    parts.append(text(984, 459, "LESS", 10))
    for i, color in enumerate(["#24242b", "#734347", "#b05a58", "#e68174", "#f5b19a"]):
        parts.append(f'<rect x="{1021+i*19}" y="448" width="13" height="13" rx="2" fill="{color}"/>')
    parts += [text(1124, 459, "MORE", 10), '</g></svg>']
    return "\n".join(parts) + "\n"


def write_atomic(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                         prefix=".activity-", suffix=".svg", delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--init", action="store_true", help="Create a pending image only if none exists")
    args = parser.parse_args()
    output = ROOT / "assets" / "activity.svg"
    username = os.environ.get("PROFILE_USERNAME", "Yashveer213")
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?", username):
        raise ValueError("Invalid PROFILE_USERNAME.")
    if args.init:
        if output.exists():
            print("Existing artwork retained.")
            return
        write_atomic(output, render(None, username, ""))
        print("Created pending artwork; no activity was invented.")
        return
    token = os.environ.get("GH_TOKEN", "")
    if not token:
        raise ValueError("GH_TOKEN is missing. Run this script through the included GitHub Actions workflow.")
    calendar = fetch_calendar(username, token)
    updated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    content = render(calendar, username, updated)
    write_atomic(output, content)
    print("Updated assets/activity.svg from GitHub contribution data.")


if __name__ == "__main__":
    try:
        main()
    except HTTPError as exc:
        print(f"GitHub API HTTP {exc.code}; existing artwork retained.", file=sys.stderr)
        sys.exit(1)
    except (URLError, TimeoutError, ValueError, KeyError, TypeError, OSError) as exc:
        print(f"Activity refresh failed: {exc}", file=sys.stderr)
        sys.exit(1)
