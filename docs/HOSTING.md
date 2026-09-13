# GitHub Pages profile hosting

This directory contains only the public GitHub profile companion: 3D workspace, audience routes, project descriptions, technology filters, concept playgrounds, roadmap, journal, and field notes. It does not contain or deploy the actual Sentinel, Oops!, or other project applications.

## Activate once

Open https://github.com/Yashveer213/Yashveer213/settings/pages and select:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
- **Save**

Expected URL after successful publication: https://yashveer213.github.io/Yashveer213/

The profile README remains at https://github.com/Yashveer213. Its currently working external links will be switched after the Pages deployment is verified.

## Routes

- Main lab: `./`
- Recruiter: `./?audience=recruiter`
- Developer: `./?audience=developer#toolbox`
- Collaborator: `./?audience=collaborator#roadmap`
- Playground gallery: `./#playgrounds`
- Unicode: `./#demo-unicode`
- Recovery: `./#demo-recovery`
- Pattern inspector: `./#demo-inspector`
- Public roadmap: `./#roadmap`
- Journal: `./#journal`
- Field notes: `./field-notes.html`

The rotatable STL remains available in GitHub's native viewer at `docs/robot.md` and `assets/robot.stl`. Every other interactive view runs in the browser from this folder. No server or paid service is required for the playgrounds.

All asset paths are relative so the `/Yashveer213/` project prefix works. An empty `.nojekyll` prevents Jekyll from transforming static assets. Live project notes and the journal are fetched from this public repository; bundled snapshots are retained if that fetch fails. Project stages remain curated notes, not inferred completion percentages.

Keep existing Markdown files here: the profile README links to them on GitHub. They do not require a separate website deployment.
