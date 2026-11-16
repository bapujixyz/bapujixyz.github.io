(function () {
  "use strict";

  var COINGECKO =
    "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";
  var MEMPOOL_FEES = "https://mempool.space/api/v1/fees/recommended";
  var MEMPOOL_STATS = "https://mempool.space/api/mempool";
  var HASHRATE = "https://mempool.space/api/v1/mining/hashrate/3d";

  var refreshMs = 60000;
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
      var eh = current != null ? current / 1e18 : null;
      setText(el.hashrate, formatHashrate(eh));
      setText(el.difficulty, formatDifficulty(diff));
    }
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
    refresh();
    window.setInterval(refresh, refreshMs);

    if (!reduceMotion && el.price) {
      el.price.style.transition = "opacity 0.35s ease";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
