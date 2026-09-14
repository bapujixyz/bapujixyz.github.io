# Bapu Ji — bapuji.xyz

WJKK WJKF

Personal homepage for **[bapuji.xyz](https://bapuji.xyz)**. This is a small GitHub Pages site: add a PDF or a web link with a short description, commit, and it shows up on the homepage.

## Custom domain

The domain `bapuji.xyz` is already verified for this repo. GitHub Pages reads it from the `CNAME` file at the repo root. Leave that file in place.

## How to add a PDF

1. Copy the PDF into `files/`, for example `files/notes.pdf`.
2. Open `_data/links.yml` and add an entry. The public URL is `/files/notes.pdf`:

```yaml
- title: Notes
  description: Short description of the file.
  url: /files/notes.pdf
  date: 2026-09-14
```

3. Commit and push. After Pages rebuilds, the file is at `https://bapuji.xyz/files/notes.pdf` and the homepage lists it.

See `files/README.md` for the same convention.

## How to add a web link

Edit `_data/links.yml` only — no HTML changes:

```yaml
- title: A page worth reading
  description: One short sentence about why it is here.
  url: https://example.org/article
  date: 2026-09-14
```

`date` is optional. Newest-looking order is just the order of entries in the YAML file; put the items you want first at the top.

Delete the two `example: true` placeholders once you have real entries.

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
