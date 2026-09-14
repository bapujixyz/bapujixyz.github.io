# From Bapu Ji with Love

Personal homepage for **[bapuji.xyz](https://bapuji.xyz)**. This GitHub Pages site lists a few files and links.

## Custom domain

The domain `bapuji.xyz` is already verified for this repo. GitHub Pages reads it from the `CNAME` file at the repo root. Leave that file in place.

## How to add a PDF

1. Copy the PDF into `files/`.
2. Open `_data/links.yml` and add an entry. Encode spaces in the public URL (`%20`):

```yaml
- title: Dark Traits Activated by Divorce
  description: PDF on the site
  url: /files/Dark%20Traits%20Activated%20by%20Divorce.pdf
```

3. Commit and push. After Pages rebuilds, the homepage lists it.

## How to add a web link

Edit `_data/links.yml` only — no HTML changes:

```yaml
- title: The Anti-Alienation Project
  description: YouTube channel
  url: https://www.youtube.com/@TheAnti-AlienationProject/videos
```

`date` is optional. Newest-looking order is just the order of entries in the YAML file; put the items you want first at the top.

## Where things live

| Path | What it is |
| --- | --- |
| `_data/links.yml` | Single source of truth for the homepage list |
| `files/` | PDFs and other files, linked as `/files/name.pdf` |
| `index.html` | Homepage template (Jekyll Liquid) |
| `css/style.css` | Minimal layout styles |
| `CNAME` | Custom domain `bapuji.xyz` |

## GitHub Pages / Jekyll

This site uses **Jekyll** so the YAML list becomes HTML on build.

In the repo: **Settings → Pages**

- Source: **Deploy from a branch**
- Branch: `main` (or your publishing branch), folder `/ (root)`
- Keep Jekyll enabled — do **not** add a `.nojekyll` file

GitHub Pages will build from `_config.yml` and `_data/links.yml` automatically.

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://127.0.0.1:4000/>. GitHub Pages uses its own Jekyll version when you deploy from a branch; the Gemfile is only for previewing locally.
