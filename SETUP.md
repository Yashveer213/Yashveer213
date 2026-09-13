# Install your GitHub profile

Prepared for **Yashveer Singh / Yashveer213**.

## 1. Add the files

Extract the ZIP. Put the **contents** of `github-profile` at the root of your username repository, `Yashveer213/Yashveer213`:

- `README.md`
- `assets/header.svg`
- `assets/header-static.svg`
- `assets/activity.svg`
- `scripts/update_activity.py`
- `.github/workflows/profile-activity.yml`

`SETUP.md` is an owner guide; keeping it in the repository is optional.

The profile repository must be public, match your GitHub username, and contain a nonempty `README.md` at its root. Commit to its default branch. Keep the asset paths and folder structure as supplied. Uploading only `README.md` will produce missing images. See [GitHub's profile README requirements](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

You can use GitHub's **Add file → Upload files** for the README, assets and scripts. To ensure the workflow folder is included, use **Add file → Create new file**, enter `.github/workflows/profile-activity.yml` as the filename, and paste the supplied YAML. A local Git client is another way to add the complete folder structure.

## 2. Start the activity chart

Open the repository's **Actions** tab, enable workflows if prompted, choose **Refresh profile activity**, and click **Run workflow** on the default branch.

After its first successful run, the pending chart is replaced with real GitHub contribution data. The supplied schedule requests an update daily at **01:23 UTC / 06:53 IST**. It is a scheduled snapshot, not a real-time feed. The image includes its last successful update time.

The workflow uses GitHub's built-in repository token and requests `contents: write` to commit only `assets/activity.svg`. **No personal access token, paid metrics service, or private-repository credential is needed for the intended public-activity setup.** If your repository or organization blocks Actions writes, the final commit can fail; inspect the workflow log and your applicable repository settings. Protected branches may require a pull-request-based update process instead of this direct commit workflow.

GitHub can delay scheduled runs and disables public-repository schedules after 60 days without repository activity. If updates stop, inspect the Actions tab and re-enable the workflow if needed. [GitHub schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## 3. Understand the 3D and interactive parts

| Feature | Behavior |
| --- | --- |
| Robot banner | Self-contained SVG animation: gentle floating, a pulsing antenna, and blinking eyes. No JavaScript. |
| Reduced motion | A static SVG is selected using a `picture` source where the renderer/browser honors `prefers-reduced-motion`. Both variants have readable fallback content. |
| Navigation | Section links jump through the README; external links open the connected profile. |
| Project panels | Native GitHub `details` sections expand on click. |
| Contribution chart | Isometric SVG blocks derived from contribution counts. Height uses a logarithmic scale, disclosed in the chart. Each block is a day. |
| Mouse-controlled 3D | Requires a separate website. A README cannot run a Three.js/WebGL scene. Link a verified portfolio from the navigation when available. |

GitHub sanitizes rendered README HTML, removing scripts and inline styles. This package uses supported Markdown/HTML for interactions and image assets for the visual design. [GitHub rendering pipeline](https://github.com/github/markup), [GitHub README formatting guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github).

## 4. Content you can personalize next

- Add your **current portfolio URL** to the navigation.
- Add **public video or demo links** under Sentinel and Oops! A clickable video thumbnail can link to a hosted walkthrough; do not assume an inline video player will work in the README.
- Update project stages as you make progress. Sentinel is described as in development; the recovery tool is labeled design stage.
- Add public screenshots to `assets/` and embed them inside the relevant expandable section.
- Keep only technologies you have actually used. There are no skill percentages, invented usage metrics, fake stars, or fabricated project outcomes.

The Oops! URL shared in an earlier conversation was not verified as currently live, so it has not been inserted as a working demo link.

## 5. Activity data and maintenance

The script requests only dates, weekday numbers, contribution counts and the calendar total. It does not request repository names, code, commit messages, or language statistics. GitHub contribution counts are not a measure of skill, and private or local work may be missing. GitHub documents the visibility requirements for private/internal contributions in [ContributionsCollection](https://docs.github.com/en/graphql/reference/users#contributionscollection).

The included workflow uses `actions/checkout@v7`, as documented in the [official action](https://github.com/actions/checkout), and Python from the hosted Ubuntu runner. The generator itself uses only Python's standard library. If a refresh fails, the last valid chart stays in place; check the Actions log for the cause. The initial chart is deliberately labeled as awaiting data.

To change colors, edit `assets/header.svg`, `assets/header-static.svg` and the palette in `scripts/update_activity.py`. Run the workflow again to apply chart color changes. To disable motion for every visitor, change the banner's `img` source in the README to `assets/header-static.svg`.

## Validation performed

Local verification covers SVG parsing and rendering, README asset paths and section links, workflow YAML and shell syntax, and contribution rendering with empty, malformed, zero-activity, and high-activity inputs. Failure handling is checked to preserve the last valid artwork. These inputs are test fixtures, never claimed as your activity or shipped as your chart.

The workflow has **not** been run inside your repository. Your live contribution data and GitHub's final rendering/cache behavior require the first installation run. No repository was edited or published from this session.


## Interactive profile upgrades

Public lab: https://yashveer213.github.io/Yashveer213/

Edit `data/profile.json` to curate stages and next goals. The daily workflow refreshes the README dashboard and `data/journal.json` from human-authored commits in this public profile repository only. It does not access private project source. The lab fetches those public JSON files with a bundled fallback.

The roadmap is a filterable view in the lab, not a native GitHub Projects board. Concept demos are standalone experiments, not full-product recordings. The STL viewer is linked from `docs/robot.md`.
