(function () {
  "use strict";

  var COINGECKO =
    "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";
  var CHART =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=";
  var MEMPOOL_FEES = "https://mempool.space/api/v1/fees/recommended";
  var MEMPOOL_STATS = "https://mempool.space/api/mempool";
  var HASHRATE = "https://mempool.space/api/v1/mining/hashrate/3d";

  var refreshMs = 60000;
  var chartDays = 7;
  var chartPoints = [];
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var el = {
    price: document.getElementById("btc-price"),
    change: document.getElementById("btc-change"),
    updated: document.getElementById("btc-updated"),
    mcap: document.getElementById("btc-mcap"),
    vol: document.getElementById("btc-vol"),
    ath: document.getElementById("btc-ath"),
    supply: document.getElementById("btc-supply"),
    fee: document.getElementById("btc-fee"),
    mempool: document.getElementById("btc-mempool"),
    hashrate: document.getElementById("btc-hashrate"),
    difficulty: document.getElementById("btc-difficulty"),
    chart: document.getElementById("btc-chart"),
    chartEmpty: document.getElementById("btc-chart-empty"),
  };

  function money(n) {
    if (n == null || !isFinite(n)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: n >= 1000 ? 0 : 2,
    }).format(n);
  }

  function moneyCompact(n) {
    if (n == null || !isFinite(n)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }

  function compact(n) {
    if (n == null || !isFinite(n)) return "—";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }

  function btcAmount(n) {
    if (n == null || !isFinite(n)) return "—";
    return (
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) +
      " BTC"
    );
  }

  function formatHashrate(eh) {
    if (eh == null || !isFinite(eh)) return "—";
    if (eh >= 1000) return (eh / 1000).toFixed(2) + " ZH/s";
    return eh.toFixed(1) + " EH/s";
  }

  function formatDifficulty(d) {
    if (d == null || !isFinite(d)) return "—";
    return compact(d);
  }

  function setText(node, value) {
    if (node) node.textContent = value;
  }

  async function getJson(url) {
    var res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(url + " → " + res.status);
    return res.json();
  }

  async function loadMarket() {
    var data = await getJson(COINGECKO);
    var m = data.market_data || {};
    var price = m.current_price && m.current_price.usd;
    var change = m.price_change_percentage_24h;
    var mcap = m.market_cap && m.market_cap.usd;
    var vol = m.total_volume && m.total_volume.usd;
    var ath = m.ath && m.ath.usd;
    var supply = m.circulating_supply;

    setText(el.price, money(price));

    if (change == null || !isFinite(change)) {
      setText(el.change, "24h change unavailable");
      el.change.className = "btc-change";
    } else {
      var sign = change > 0 ? "+" : "";
      setText(el.change, sign + change.toFixed(2) + "% · 24h");
      el.change.className =
        "btc-change " + (change >= 0 ? "is-up" : "is-down");
    }

    setText(el.mcap, moneyCompact(mcap));
    setText(el.vol, moneyCompact(vol));
    setText(el.ath, money(ath));
    setText(el.supply, btcAmount(supply));
    setText(
      el.updated,
      "Updated " +
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
    );
  }

  async function loadNetwork() {
    var results = await Promise.allSettled([
      getJson(MEMPOOL_FEES),
      getJson(MEMPOOL_STATS),
      getJson(HASHRATE),
    ]);

    if (results[0].status === "fulfilled") {
      var fees = results[0].value;
      setText(
        el.fee,
        (fees.fastestFee != null ? fees.fastestFee : "—") + " sat/vB"
      );
    }

    if (results[1].status === "fulfilled") {
      var mem = results[1].value;
      var count = mem.count;
      var vsize = mem.vsize;
      if (count != null) {
        setText(
          el.mempool,
          compact(count) +
            " tx" +
            (vsize != null ? " · " + compact(vsize) + " vB" : "")
        );
      }
    }

    if (results[2].status === "fulfilled") {
      var mining = results[2].value;
      var current = mining.currentHashrate;
      var diff = mining.currentDifficulty;
      // API returns H/s; convert to EH/s
      var eh = current != null ? current / 1e18 : null;
      setText(el.hashrate, formatHashrate(eh));
      setText(el.difficulty, formatDifficulty(diff));
    }
  }

  async function loadChart(days) {
    chartDays = days;
    el.chartEmpty.hidden = true;
    var data = await getJson(CHART + encodeURIComponent(String(days)));
    var next = (data.prices || []).map(function (pair) {
      return { t: pair[0], p: pair[1] };
    });
    if (!next.length) {
      if (!chartPoints.length) el.chartEmpty.hidden = false;
      return;
    }
    chartPoints = next;
    drawChart();
  }

  function drawChart() {
    var canvas = el.chart;
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 800;
    var cssH = Math.max(180, Math.round(cssW * 0.4));
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);

    if (!chartPoints.length) {
      el.chartEmpty.hidden = false;
      return;
    }
    el.chartEmpty.hidden = true;

    var pad = { t: 12, r: 8, b: 22, l: 8 };
    var w = cssW - pad.l - pad.r;
    var h = cssH - pad.t - pad.b;
    var prices = chartPoints.map(function (p) {
      return p.p;
    });
    var min = Math.min.apply(null, prices);
    var max = Math.max.apply(null, prices);
    var span = max - min || 1;

    function xAt(i) {
      return pad.l + (i / (chartPoints.length - 1 || 1)) * w;
    }
    function yAt(p) {
      return pad.t + (1 - (p - min) / span) * h;
    }

    var up = chartPoints[chartPoints.length - 1].p >= chartPoints[0].p;
    var stroke = up ? "#2f6b3a" : "#8a2f24";
    var styles = getComputedStyle(document.documentElement);
    var rule = styles.getPropertyValue("--rule").trim() || "#ddd6cc";
    var muted = styles.getPropertyValue("--muted").trim() || "#5e5a54";

    ctx.strokeStyle = rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t + h);
    ctx.lineTo(pad.l + w, pad.t + h);
    ctx.stroke();

    // Soft fill under the line
    var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + h);
    grad.addColorStop(0, up ? "rgba(47, 107, 58, 0.16)" : "rgba(138, 47, 36, 0.14)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    chartPoints.forEach(function (pt, i) {
      var x = xAt(i);
      var y = yAt(pt.p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(xAt(chartPoints.length - 1), pad.t + h);
    ctx.lineTo(xAt(0), pad.t + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    chartPoints.forEach(function (pt, i) {
      var x = xAt(i);
      var y = yAt(pt.p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.font = '12px Georgia, "Times New Roman", serif';
    ctx.textAlign = "left";
    ctx.fillText(money(max), pad.l, 11);
    ctx.textAlign = "right";
    ctx.fillText(money(min), pad.l + w, pad.t + h + 16);
  }

  function bindRange() {
    var buttons = document.querySelectorAll(".btc-range-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        loadChart(Number(btn.getAttribute("data-days"))).catch(function () {
          // Keep the previous chart if a range fetch fails (e.g. rate limit).
          if (!chartPoints.length) el.chartEmpty.hidden = false;
        });
      });
    });
  }

  async function refresh() {
    try {
      await loadMarket();
    } catch (err) {
      setText(el.change, "Could not load market data");
      el.change.className = "btc-change";
    }
    try {
      await loadNetwork();
    } catch (err) {
      // leave placeholders
    }
  }

  function init() {
    bindRange();
    // Default chart to 7D; mark button
    document.querySelectorAll(".btc-range-btn").forEach(function (btn) {
      btn.classList.toggle(
        "is-active",
        Number(btn.getAttribute("data-days")) === chartDays
      );
    });

    refresh();
    loadChart(chartDays).catch(function () {
      el.chartEmpty.hidden = false;
    });

    window.setInterval(refresh, refreshMs);
    window.addEventListener(
      "resize",
      debounce(function () {
        drawChart();
      }, 120)
    );

    if (!reduceMotion) {
      // gentle pulse on price after first paint updates
      el.price.style.transition = "opacity 0.35s ease";
    }
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
