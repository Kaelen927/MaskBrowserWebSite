(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-ready");

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var cfg = window.SITE_CONFIG || {};
    var dl = cfg.downloads || {};

    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 12) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var body = document.body;
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.querySelectorAll(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () {
          body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav-link").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (href === path) a.classList.add("active");
    });

    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq-item");
        if (!item) return;
        var wasOpen = item.classList.contains("open");
        var group = item.closest(".faq-list");
        if (group) {
          group.querySelectorAll(".faq-item.open").forEach(function (o) {
            o.classList.remove("open");
          });
        }
        if (!wasOpen) item.classList.add("open");
      });
    });

    var reveals = document.querySelectorAll(".reveal");
    if (reveals.length) {
      if (reduce || !("IntersectionObserver" in window)) {
        reveals.forEach(function (el) {
          el.classList.add("in");
        });
      } else {
        var groups = {};
        reveals.forEach(function (el) {
          var key = (el.parentElement && el.parentElement.className) || "root";
          groups[key] = (groups[key] || 0) + 1;
          el.style.transitionDelay = Math.min(groups[key] - 1, 5) * 90 + "ms";
        });
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
        );
        reveals.forEach(function (el) {
          io.observe(el);
        });
      }
    }

    var toTop = document.querySelector(".to-top");
    if (toTop) {
      var onTopScroll = function () {
        if (window.scrollY > 620) toTop.classList.add("show");
        else toTop.classList.remove("show");
      };
      onTopScroll();
      window.addEventListener("scroll", onTopScroll, { passive: true });
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    }


    document.querySelectorAll("[data-platform]").forEach(function (el) {
      el.textContent = cfg.platform || "";
    });
    document.querySelectorAll("[data-qq]").forEach(function (el) {
      el.textContent = cfg.qqGroup ? String(cfg.qqGroup) : "";
    });


    document.querySelectorAll("[data-dl]").forEach(function (el) {
      var key = el.getAttribute("data-dl");
      var item = dl[key] || {};
      var url = item.url || "";
      if (!url || url === "#") {
        var card = el.closest(".dl-card");
        if (card) card.style.display = "none";
        return;
      }
      if (/^https?:\/\//.test(url)) {
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.setAttribute("href", "#");
        el.addEventListener("click", function (ev) {
          ev.preventDefault();
          if (navigator.clipboard) navigator.clipboard.writeText(url);
          var tip = window.__dlTip;
          if (!tip) {
            tip = document.createElement("div");
            tip.style.cssText =
              "position:fixed;left:50%;bottom:40px;transform:translateX(-50%);z-index:200;padding:14px 22px;border-radius:12px;background:rgba(10,14,22,.96);border:1px solid rgba(74,144,226,.5);color:#e9effc;font-size:14px;box-shadow:0 20px 60px -20px rgba(0,0,0,.9);transition:opacity .3s;max-width:88vw;text-align:center;line-height:1.6";
            document.body.appendChild(tip);
            window.__dlTip = tip;
          }
          tip.innerHTML = "已复制口令 <code>" + url + "</code><br>请打开 " + item.name + " 免费获取安装包";
          tip.style.opacity = "1";
          clearTimeout(window.__dlTipTimer);
          window.__dlTipTimer = setTimeout(function () {
            tip.style.opacity = "0";
          }, 5000);
        });
      }
    });

    document.querySelectorAll(".download-grid").forEach(function (grid) {
      var shown = Array.prototype.filter.call(grid.querySelectorAll(".dl-card"), function (c) {
        return c.style.display !== "none";
      });
      if (shown.length === 1) shown[0].classList.add("solo");
    });
    var docsNav = document.querySelectorAll(".docs-nav-link, .docs-toc-link");
    if (docsNav.length) {
      var targets = [];
      docsNav.forEach(function (link) {
        var id = (link.getAttribute("href") || "").replace("#", "");
        var el = id && document.getElementById(id);
        if (el) targets.push({ link: link, el: el });
      });
      var setActive = function (link) {
        docsNav.forEach(function (l) { l.classList.remove("active"); });
        if (link) link.classList.add("active");
      };
      var syncNav = function () {
        if (!targets.length) return;
        var offset = 120;
        var current = targets[0];
        for (var i = 0; i < targets.length; i++) {
          if (targets[i].el.getBoundingClientRect().top <= offset) current = targets[i];
        }
        setActive(current.link);
      };
      syncNav();
      window.addEventListener("scroll", syncNav, { passive: true });
      window.addEventListener("resize", syncNav, { passive: true });
    }

    document.querySelectorAll("[data-copy]").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        var text = el.getAttribute("data-copy");
        var done = function () {
          el.setAttribute("data-copied", "1");
          var label = el.querySelector("span");
          if (label) {
            if (!label.dataset.original) label.dataset.original = label.textContent;
            label.textContent = "已复制";
            setTimeout(function () {
              label.textContent = label.dataset.original;
              el.removeAttribute("data-copied");
            }, 1800);
            return;
          }
          var old = el.textContent;
          el.textContent = "已复制 " + text;
          setTimeout(function () {
            el.textContent = old;
            el.removeAttribute("data-copied");
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {});
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            done();
          } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });
  });
})();