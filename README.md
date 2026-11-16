# From Bapu Ji with Love

Personal homepage for **[bapuji.xyz](https://bapuji.xyz)**. This GitHub Pages site lists a few files and links, plus a live Bitcoin dashboard at **[/bitcoin](https://bapuji.xyz/bitcoin)**.

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

## Bitcoin dashboard

Live page: **[bapuji.xyz/bitcoin](https://bapuji.xyz/bitcoin)**

A static page that loads market and network data in the browser (no backend, no API keys).

### What it shows

| Section | Fields | Source |
| --- | --- | --- |
| Hero | Spot USD price, 24h % change, last update time | [CoinGecko](https://www.coingecko.com/) |
| Market | Market cap, 24h volume, ATH, circulating supply | CoinGecko |
| Price chart | Interactive hollow-candle chart (`BITSTAMP:BTCUSD`) | [TradingView](https://www.tradingview.com/) Advanced Chart widget (`style: "9"`) |
| Network | Next-block fee, mempool size, hashrate, difficulty | [mempool.space](https://mempool.space/) |

Market and network numbers refresh about every **60 seconds**. The chart is a TradingView embed (hollow candles); interval and range use TradingView’s own toolbar.

### Files

| Path | Role |
| --- | --- |
| `bitcoin/index.html` | Page markup (Jekyll serves it at `/bitcoin/`) |
| `css/bitcoin.css` | Dashboard layout on top of the shared site styles |
| `js/bitcoin.js` | Fetches CoinGecko / mempool APIs and formats market + network stats |
| `_data/links.yml` | Homepage entry linking to `/bitcoin/` |

### Local preview

With Jekyll running (`bundle exec jekyll serve`), open <http://127.0.0.1:4000/bitcoin/>.

The dashboard calls public HTTPS APIs and the TradingView widget script from the browser, so it needs network access. CoinGecko may throttle if you refresh too often.

### Changing behavior

- Refresh interval: `refreshMs` in `js/bitcoin.js` (default `60000`)
- Chart symbol / hollow candles / theme: the JSON config inside the TradingView `<script>` in `bitcoin/index.html` (`style: "9"` = hollow candles)
- Labels / sections: edit `bitcoin/index.html`
- Look and spacing: edit `css/bitcoin.css` (shared colors stay in `css/style.css`)

## Where things live

| Path | What it is |
| --- | --- |
| `_data/links.yml` | Single source of truth for the homepage list |
| `bitcoin/` | Live Bitcoin dashboard (`/bitcoin/`) |
| `css/bitcoin.css` | Bitcoin dashboard styles |
| `js/bitcoin.js` | Bitcoin dashboard client script |
| `files/` | PDFs and other files, linked as `/files/name.pdf` |
| `index.html` | Homepage template (Jekyll Liquid) |
| `css/style.css` | Shared layout styles |
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

Then open <http://127.0.0.1:4000/> (dashboard at <http://127.0.0.1:4000/bitcoin/>). GitHub Pages uses its own Jekyll version when you deploy from a branch; the Gemfile is only for previewing locally.
