"""Refresh public profile commit journal; never reads private project repositories."""
import json
import os
from pathlib import Path
import re
from urllib.request import Request, urlopen
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
REPO = 'Yashveer213/Yashveer213'


def journal_from_commits(commits):
    if not isinstance(commits, list):
        raise ValueError('Expected public commit list')
    entries = []
    for c in commits:
        if not isinstance(c, dict) or not re.fullmatch(r'[a-f0-9]{40}', c.get('sha', '')):
            raise ValueError('Invalid commit record')
        author = c.get('author') or {}
        title = c['commit']['message'].splitlines()[0]
        if author.get('type') == 'Bot' or '[bot]' in author.get('login', '') or '[skip ci]' in title:
            continue
        date = c['commit']['author']['date']
        datetime.fromisoformat(date.replace('Z', '+00:00'))
        entries.append({'sha': c['sha'], 'title': title[:180], 'date': date,
                        'url': f'https://github.com/{REPO}/commit/{c["sha"]}'})
    return {'scope': 'Public profile repository commits only',
            'updated': datetime.now(timezone.utc).isoformat(), 'entries': entries[:5]}


def md(text):
    return str(text).replace('\\', '\\\\').replace('|', '\\|').replace('[', '\\[').replace(']', '\\]').replace('\n', ' ')


def replace_block(readme, name, body):
    start, end = f'<!-- {name}:START -->', f'<!-- {name}:END -->'
    if readme.count(start) != 1 or readme.count(end) != 1 or readme.index(start) > readme.index(end):
        raise ValueError(f'Missing or ambiguous {name} markers')
    return readme[:readme.index(start) + len(start)] + '\n' + body + '\n' + readme[readme.index(end):]


def render_readme(readme, profile, journal):
    rows = ['| Project | Stage | Next goal |', '| :--- | :--- | :--- |']
    for p in profile['projects']:
        rows.append(f'| **{md(p["name"])}** | {md(p["stage"])} | {md(p["next"])} |')
    readme = replace_block(readme, 'DASHBOARD', '\n'.join(rows))
    items = [f'- **{e["date"][:10]}** · [{md(e["title"])}]({e["url"]})' for e in journal['entries']]
    return replace_block(readme, 'JOURNAL', '\n'.join(items) or 'No public journal entries yet.')


def main():
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'Yashveer-profile-journal'}
    if os.environ.get('GH_TOKEN'):
        headers['Authorization'] = 'Bearer ' + os.environ['GH_TOKEN']
    request = Request(f'https://api.github.com/repos/{REPO}/commits?per_page=50', headers=headers)
    with urlopen(request, timeout=25) as response:
        commits = json.load(response)
    journal = journal_from_commits(commits)
    profile = json.loads((ROOT / 'data/profile.json').read_text())
    readme = render_readme((ROOT / 'README.md').read_text(), profile, journal)
    # Validate all inputs before replacing either output. Each file replacement is atomic.
    for target, content in [(ROOT / 'data/journal.json', json.dumps(journal, ensure_ascii=False, indent=2) + '\n'), (ROOT / 'README.md', readme)]:
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_text(content)
        temporary.replace(target)
    print(f'Refreshed {len(journal["entries"])} public journal entries.')


if __name__ == '__main__':
    main()
