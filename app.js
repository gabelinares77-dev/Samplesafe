/* KING — app shell: navigation, status bar, player, interactions */

(function () {
  "use strict";

  var phone = document.querySelector(".phone");
  var screens = document.querySelectorAll(".screen");
  var navItems = document.querySelectorAll(".nav-item");
  var history = [];
  var current = "morning";

  /* ---------- Status bar (9:41 + signal / wifi / battery) ---------- */
  var SB_ICONS =
    '<span class="sb-icons">' +
    '<svg width="18" height="12" viewBox="0 0 18 12" fill="#111">' +
    '<rect x="0" y="7" width="3" height="5" rx="1"/>' +
    '<rect x="5" y="5" width="3" height="7" rx="1"/>' +
    '<rect x="10" y="2.5" width="3" height="9.5" rx="1"/>' +
    '<rect x="15" y="0" width="3" height="12" rx="1"/>' +
    "</svg>" +
    '<svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round">' +
    '<path d="M1.5 4 a10.5 10.5 0 0 1 14 0"/>' +
    '<path d="M4.2 7 a6.5 6.5 0 0 1 8.6 0"/>' +
    '<circle cx="8.5" cy="10" r="1.3" fill="#111" stroke="none"/>' +
    "</svg>" +
    '<svg width="25" height="12" viewBox="0 0 25 12" fill="none">' +
    '<rect x="0.75" y="0.75" width="20.5" height="10.5" rx="3" stroke="#111" stroke-width="1.5"/>' +
    '<rect x="2.75" y="2.75" width="13" height="6.5" rx="1.5" fill="#111"/>' +
    '<path d="M23 4 a2.2 2.2 0 0 1 0 4" stroke="#111" stroke-width="1.5" stroke-linecap="round"/>' +
    "</svg>" +
    "</span>";

  document.querySelectorAll(".statusbar").forEach(function (bar) {
    bar.innerHTML = "<span>9:41</span>" + SB_ICONS;
  });

  /* ---------- Navigation ---------- */
  function show(name, push) {
    var target = document.getElementById("screen-" + name);
    if (!target) return;
    if (push !== false && name !== current) history.push(current);
    current = name;

    screens.forEach(function (s) { s.classList.remove("active"); });
    target.classList.add("active");
    target.scrollTop = 0;

    var tab = target.getAttribute("data-tab");
    phone.classList.toggle("no-nav", tab === "none");
    navItems.forEach(function (item) {
      item.classList.toggle("active", item.getAttribute("data-tab") === tab);
    });
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-go]");
    if (!el) return;
    var dest = el.getAttribute("data-go");
    if (dest === "back") {
      show(history.pop() || "morning", false);
    } else {
      show(dest);
    }
    if (dest === "player") startPlayback();
  });

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }

  /* ---------- Audio player (simulated) ---------- */
  var TOTAL = 165; // 2:45
  var elapsed = 12; // 0:12 as pictured
  var playing = false;
  var tick = null;

  var seekFill = document.getElementById("seek-fill");
  var seekKnob = document.getElementById("seek-knob");
  var timeNow = document.getElementById("time-now");
  var playIcon = document.getElementById("play-icon");

  function fmt(s) {
    var m = Math.floor(s / 60);
    var r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function render() {
    var pct = Math.min(100, (elapsed / TOTAL) * 100);
    seekFill.style.width = pct + "%";
    seekKnob.style.left = pct + "%";
    timeNow.textContent = fmt(elapsed);
    playIcon.innerHTML = '<use href="#i-' + (playing ? "pause" : "play") + '"/>';
  }

  function startPlayback() {
    playing = true;
    clearInterval(tick);
    tick = setInterval(function () {
      if (!playing) return;
      elapsed += 1;
      if (elapsed >= TOTAL) { elapsed = TOTAL; playing = false; clearInterval(tick); }
      render();
    }, 1000);
    render();
  }

  document.getElementById("play-toggle").addEventListener("click", function () {
    playing = !playing;
    if (playing) startPlayback(); else render();
  });
  document.getElementById("skip-back").addEventListener("click", function () {
    elapsed = Math.max(0, elapsed - 15);
    render();
  });
  document.getElementById("skip-fwd").addEventListener("click", function () {
    elapsed = Math.min(TOTAL, elapsed + 15);
    render();
  });

  render();

  /* ---------- Journal ---------- */
  var journalInput = document.getElementById("journal-input");
  var saved = {};
  var activeDate = "Tue 14";

  document.querySelectorAll(".date-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      saved[activeDate] = journalInput.value;
      document.querySelectorAll(".date-chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeDate = chip.textContent.trim().replace(/\s+/g, " ");
      journalInput.value = saved[activeDate] || "";
    });
  });

  document.getElementById("save-entry").addEventListener("click", function () {
    saved[activeDate] = journalInput.value;
    showToast(journalInput.value.trim() ? "Entry saved. Well done, King." : "Write something first.");
  });
  document.getElementById("add-photo").addEventListener("click", function () {
    showToast("Photos coming soon.");
  });

  /* ---------- Profile toggle ---------- */
  var notif = document.getElementById("notif-toggle");
  notif.addEventListener("click", function () {
    var on = notif.classList.toggle("on");
    notif.setAttribute("aria-checked", on ? "true" : "false");
  });

  show("morning", false);
})();
