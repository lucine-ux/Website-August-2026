/* ===================================
   BACK TO BREATH — SHARED SCRIPTS
   =================================== */

/* ---------- THINGS YOU MAY NEED TO EDIT ---------- */
window.BTB = {
  // 1. ADHDecompress (the 2 week intro). Paste the Heartbeat join / checkout link here when
  //    you are ready to open it. While this is empty, every "Join ADHDecompress" button turns
  //    into "Join the waitlist" and scrolls to the waitlist form. Safe to publish early.
  DECOMPRESS_JOIN_URL: "https://app.heartbeat.chat/backtobreath/invitation?code=295E34",
  //    The public price, shown on adhdecompress.html once the join link is set.
  //    CHECK: the Heartbeat link above should charge $67 USD.
  DECOMPRESS_PRICE: "$67 USD",

  // 1b. The personal invite page (adhdecompress-invite.html). Only linked from the waitlist emails.
  //     PASTE YOUR $47 USD HEARTBEAT LINK between the quotes below. While it is empty, the buttons on
  //     the invite page say "Checkout opens soon" and do nothing.
  DECOMPRESS_INVITE_URL: "",
  DECOMPRESS_INVITE_PRICE: "$47 USD",

  // 2. Where waitlist sign ups are sent (a Cloudflare Worker or form URL that accepts JSON:
  //    { list, name, email, format, struggle }). While this is empty, the form opens a pre filled
  //    email to you instead, so nothing is lost.
  WAITLIST_ENDPOINT: "https://btb-waitlist.lucinesetian.workers.dev",

  WAITLIST_EMAIL: "lucine@backtobreath.net.au"
};

(function () {
  var cfg = window.BTB;

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('navMobile');
  var close = document.getElementById('navClose');
  var openMenu = function () { mobile.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); };
  var closeMenu = function () { mobile.classList.remove('open'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); };
  if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'navMobile'); }
  if (toggle && mobile) {
    toggle.addEventListener('click', openMenu);
    toggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mobile.classList.contains('open')) { closeMenu(); toggle.focus(); } });
  }
  if (close && mobile) {
    close.addEventListener('click', closeMenu);
    close.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeMenu(); } });
  }
  if (mobile) mobile.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mobile.classList.remove('open'); });
  });

  /* ---------- Scroll reveal ---------- */
  var els = document.querySelectorAll('.reveal, .reveal--left, .reveal--right');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- ADHDecompress join buttons ---------- */
  document.querySelectorAll('[data-decompress-join]').forEach(function (a) {
    if (cfg.DECOMPRESS_JOIN_URL) {
      a.setAttribute('href', cfg.DECOMPRESS_JOIN_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    } else {
      a.setAttribute('href', '#waitlist');
      var alt = a.getAttribute('data-wait-text');
      if (alt) a.textContent = alt;
    }
  });
  document.querySelectorAll('[data-decompress-price]').forEach(function (el) {
    el.textContent = cfg.DECOMPRESS_PRICE || '';
  });
  document.querySelectorAll('[data-invite-join]').forEach(function (a) {
    if (cfg.DECOMPRESS_INVITE_URL) {
      a.setAttribute('href', cfg.DECOMPRESS_INVITE_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    } else {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.style.opacity = '.6';
      a.textContent = 'Checkout opens soon';
    }
  });
  document.querySelectorAll('[data-invite-price]').forEach(function (el) {
    el.textContent = cfg.DECOMPRESS_INVITE_PRICE || '';
  });
  document.querySelectorAll('[data-show-when-open]').forEach(function (el) {
    el.hidden = !(cfg.DECOMPRESS_JOIN_URL && cfg.DECOMPRESS_PRICE);
  });
  document.querySelectorAll('[data-show-when-closed]').forEach(function (el) {
    el.hidden = !!cfg.DECOMPRESS_JOIN_URL;
  });

  /* ---------- Waitlist forms ---------- */
  document.querySelectorAll('form[data-waitlist]').forEach(function (form) {
    var box = form.closest('.wl');
    var err = form.querySelector('.wl__err');
    var showErr = function (msg) { if (err) { err.textContent = msg; err.style.display = 'block'; } };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (err) err.style.display = 'none';

      var list = form.getAttribute('data-waitlist');
      var name = (form.elements['name'] && form.elements['name'].value || '').trim();
      var email = (form.elements['email'] && form.elements['email'].value || '').trim();
      var choiceEl = form.querySelector('input[name="format"]:checked');
      var hasChoice = !!form.querySelector('input[name="format"]');

      if (!name) { showErr('Please add your first name.'); form.elements['name'].focus(); return; }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showErr('Please check your email address.'); form.elements['email'].focus(); return; }
      if (hasChoice && !choiceEl) { showErr('Please pick one option so I know what to plan.'); return; }

      var struggleEl = form.elements['struggle'];
      var struggle = (struggleEl && struggleEl.value || '').trim();
      var payload = { list: list, name: name, email: email, format: choiceEl ? choiceEl.value : '', struggle: struggle };

      var done = function (viaMail) {
        if (box) { box.classList.add('is-done'); box.setAttribute('data-mode', viaMail ? 'mail' : 'sent'); }
        if (window.gtag) { try { window.gtag('event', 'generate_lead', { waitlist: list, format: payload.format }); } catch (e) {} }
        var ok = box && box.querySelector('.wl__ok');
        if (ok) { ok.setAttribute('tabindex', '-1'); ok.focus(); }
      };

      var sendMail = function () {
      var labels = { retreat: 'Retreat waitlist', baseline: 'ADHDecompress waitlist', program: 'ADHD Capacity Program waitlist' };
      var subject = labels[list] || 'Waitlist';
      var lines = ['Hi Lucine,', '', 'Please add me to the ' + subject.toLowerCase() + '.', '', 'Name: ' + name, 'Email: ' + email];
      if (choiceEl) lines.push('I am interested in: ' + choiceEl.getAttribute('data-label'));
      if (struggle) lines.push('What I most want help with: ' + struggle);
      lines.push('', 'Thank you!');
      window.location.href = 'mailto:' + cfg.WAITLIST_EMAIL + '?subject=' + encodeURIComponent(subject + ': ' + name) + '&body=' + encodeURIComponent(lines.join('\n'));
      done(true);
      };
      if (cfg.WAITLIST_ENDPOINT) {
        var btn = form.querySelector('button[type=submit]');
        if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
        fetch(cfg.WAITLIST_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) {
          if (!r.ok) throw new Error('bad status');
          done(false);
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; }
          if (list === 'program') { sendMail(); return; }
          showErr('That did not go through. Please try again.');
        });
        return;
      }

      sendMail();
    });
  });

  /* ---------- Smooth scroll for in page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ---------- Pause motion button ---------- */
  if (document.querySelector('.marquee, .ed-hero, .hero')) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      var mb = document.createElement('button');
      mb.type = 'button'; mb.className = 'motion-btn'; mb.textContent = 'Pause motion';
      mb.setAttribute('aria-pressed', 'false');
      mb.addEventListener('click', function () {
        var off = document.documentElement.classList.toggle('motion-off');
        mb.setAttribute('aria-pressed', off ? 'true' : 'false');
        mb.textContent = off ? 'Play motion' : 'Pause motion';
      });
      document.body.appendChild(mb);
    }
  }
})();
