/* ============================================================
   LA LIGA PAVA — Web inmersiva · interacciones
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV: estado scrolled + menú móvil ---------- */
  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() { mobileMenu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  mobileMenu.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', closeMenu); });

  /* ---------- REVEAL al hacer scroll ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    var evRows = [].slice.call(document.querySelectorAll('.ev-row.reveal'));
    var otherReveals = revealEls.filter(function (el) { return evRows.indexOf(el) === -1; });
    otherReveals.forEach(function (el) { io.observe(el); });

    // ev-row cards: each one reveals individually as the user scrolls down to it
    // (not all at once when the list first appears), so it genuinely feels 1-by-1.
    if (evRows.length) {
      var evIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); evIo.unobserve(e.target); }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -18% 0px' });
      evRows.forEach(function (el) { evIo.observe(el); });
    }

    // safety net: rescue anything truly stuck (already on/past screen but never revealed —
    // e.g. missed by the observer during a fast/large scroll jump). Runs periodically,
    // not on every scroll tick, so it never preempts the normal entrance animation.
    function sweepReveal() {
      var vh = window.innerHeight;
      otherReveals.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }
    window.addEventListener('load', sweepReveal);
    setInterval(sweepReveal, 900);

    // clip-rows headlines toggle .in on themselves
    [].slice.call(document.querySelectorAll('.clip-rows')).forEach(function (el) {
      io.observe(el);
    });
    // manifesto strike lines
    [].slice.call(document.querySelectorAll('.mani-line')).forEach(function (el) { io.observe(el); });
  }

  /* ---------- CONTADORES ---------- */
  function formatNum(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function formatHM(totalMin) {
    var h = Math.floor(totalMin / 60), m = Math.round(totalMin % 60);
    return h + 'h' + (m < 10 ? '0' : '') + m + 'm';
  }
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var isHM = el.getAttribute('data-format') === 'hm';
    var render = isHM ? formatHM : function (v) { return prefix + formatNum(v); };
    if (reduce) { el.textContent = render(target); return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = render(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = render(target);
    }
    requestAnimationFrame(step);
  }
  var countEls = [].slice.call(document.querySelectorAll('[data-count]'));
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  countEls.forEach(function (el) { cio.observe(el); });

  /* ---------- PARALLAX hero ---------- */
  var heroMedia = document.getElementById('heroMedia');
  if (heroMedia && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroMedia.style.transform = 'translateY(' + (y * 0.18) + 'px) scale(1.02)';
      }
    }, { passive: true });
  }

  /* ---------- ESTADIOS · showcase interactivo ---------- */
  var stdShowcase = document.getElementById('stdShowcase');
  if (stdShowcase) {
    var stdImgs = [].slice.call(stdShowcase.querySelectorAll('.std-img'));
    var stdCity = document.getElementById('stdCity');
    var stdName = document.getElementById('stdName');
    var stdInfo = document.getElementById('stdInfo');
    var stdPanel = document.getElementById('stdPanel');
    var stdTabs = [].slice.call(stdShowcase.querySelectorAll('.std-tab'));
    var stdFills = [].slice.call(stdShowcase.querySelectorAll('.st-fill'));

    var STD = [
      { city: 'CASTELLDEFELS', name: 'PAVA STADIUM',
        stats: { city: 'Castelldefels', surf: 'Fútbol 7 · césped', role: 'Sede principal', prod: 'Streaming + narración' },
        note: 'El estadio fundacional. Aquí nació La Liga Pava y se disputa la mayoría de la Superliga.' },
      { city: 'SANT BOI', name: 'CONSTANTÍ MIRANDA I',
        stats: { city: 'Sant Boi', surf: 'Fútbol 7 · césped', role: 'Camp principal', prod: 'Cobertura completa' },
        note: 'La casa de la Pava en Sant Boi. El campo que expandió la liga al corazón del Baix Llobregat.' },
      { city: 'SANT BOI', name: 'CONSTANTÍ MIRANDA II',
        stats: { city: 'Sant Boi', surf: 'Fútbol 7 · césped', role: 'Segundo campo', prod: 'Cobertura completa' },
        note: 'El segundo campo de Sant Boi: más jornadas en paralelo, más equipos y más historias cada domingo.' }
    ];

    var DUR = 6500;
    var stdCur = -1, stdTimer = null, stdPaused = false;

    function applyStats(i) {
      var s = STD[i].stats;
      stdInfo.classList.add('swap');
      setTimeout(function () {
        stdInfo.querySelector('[data-stat="city"]').textContent = s.city;
        stdInfo.querySelector('[data-stat="surf"]').textContent = s.surf;
        stdInfo.querySelector('[data-stat="role"]').textContent = s.role;
        stdInfo.querySelector('[data-stat="prod"]').textContent = s.prod;
        stdInfo.querySelector('[data-stat="note"]').textContent = STD[i].note;
        stdInfo.classList.remove('swap');
      }, 200);
    }

    function setStd(i) {
      if (i === stdCur) return;
      stdCur = i;
      stdImgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      stdCity.textContent = STD[i].city;
      stdName.textContent = STD[i].name;
      stdTabs.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      applyStats(i);
      // re-disparar callouts escalonados
      stdShowcase.classList.remove('lit');
      void stdShowcase.offsetWidth;
      stdShowcase.classList.add('lit');
    }

    function fillProgress() {
      stdFills.forEach(function (f, k) {
        if (k === stdCur && !reduce) {
          f.style.transition = 'none'; f.style.width = '0%';
          void f.offsetWidth;
          f.style.transition = 'width ' + DUR + 'ms linear';
          f.style.width = '100%';
        } else {
          f.style.transition = 'none'; f.style.width = '0%';
        }
      });
    }

    function schedule() {
      clearTimeout(stdTimer);
      if (reduce || stdPaused) return;
      fillProgress();
      stdTimer = setTimeout(function () { setStd((stdCur + 1) % STD.length); schedule(); }, DUR);
    }

    stdTabs.forEach(function (t) {
      t.addEventListener('click', function () {
        setStd(parseInt(t.getAttribute('data-stadium'), 10));
        schedule();
      });
    });

    // pausa al interactuar (hover/focus)
    stdShowcase.addEventListener('mouseenter', function () { stdPaused = true; clearTimeout(stdTimer); stdFills.forEach(function (f) { var w = getComputedStyle(f).width; f.style.transition = 'none'; f.style.width = w; }); });
    stdShowcase.addEventListener('mouseleave', function () { stdPaused = false; schedule(); });

    // parallax con el ratón (solo PC, sin reduced-motion)
    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
      stdPanel.addEventListener('mousemove', function (e) {
        var r = stdPanel.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        stdPanel.style.transform = 'perspective(1100px) rotateY(' + (px * 5).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg)';
      });
      stdPanel.addEventListener('mouseleave', function () {
        stdPanel.style.transform = 'perspective(1100px) rotateY(0) rotateX(0)';
      });
    }

    // arrancar cuando entra en viewport
    setStd(0);
    if (reduce) {
      stdShowcase.classList.add('lit');
    } else {
      var stdIO = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { stdShowcase.classList.add('lit'); schedule(); }
          else { clearTimeout(stdTimer); }
        });
      }, { threshold: 0.35 });
      stdIO.observe(stdShowcase);
    }
  }

  /* ---------- LA PAVA MEDIA · galería interactiva ---------- */
  var mediaShowcase = document.getElementById('mediaShowcase');
  if (mediaShowcase) {
    var mfImgs = [].slice.call(mediaShowcase.querySelectorAll('.mf-img'));
    var mediaEvs = [].slice.call(mediaShowcase.querySelectorAll('.media-ev'));
    var mfYr = document.getElementById('mfYr');
    var mfName = document.getElementById('mfName');
    var mfDesc = document.getElementById('mfDesc');
    var mfRecTxt = document.getElementById('mfRecTxt');
    var mfPanel = document.getElementById('mediaPanel');

    var EV = [
      { yr: '2026 · PRODUCCIÓN', rec: 'PAVA MEDIA · BALONCESTO', name: 'FIBA U13 — U14',
        desc: 'Baloncesto base internacional. Narración, cámaras y postproducción para las categorías de formación.' },
      { yr: '2026 · STREAMING + NARRACIÓN', rec: 'PAVA MEDIA · BOXEO', name: 'THE GOLDEN BOXING',
        desc: 'Velada de boxeo en directo. Realización multicámara y narración a pie de ring.' },
      { yr: '2026 · COBERTURA INTEGRAL', rec: 'PAVA MEDIA · CANTERAS', name: 'CIKUP 2026',
        desc: 'Torneo de canteras con FC Barcelona, Real Madrid, PSG y RCD Espanyol. Producción completa del evento.' },
      { yr: '2026 · EVENTO ESPECIAL', rec: 'PAVA MEDIA · ESTRELLAS', name: 'PARTIDO DE LAS ESTRELLAS',
        desc: 'Un partido de figuras con la presencia de Deco y Joan Laporta. Cobertura y contenido para redes.' }
    ];

    var mDUR = 5500, mCur = -1, mTimer = null, mPaused = false;

    function setEv(i) {
      if (i === mCur) return;
      mCur = i;
      mfImgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      mediaEvs.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      mfPanel.classList.add('swap');
      setTimeout(function () {
        mfYr.textContent = EV[i].yr;
        mfName.textContent = EV[i].name;
        mfDesc.textContent = EV[i].desc;
        mfRecTxt.textContent = EV[i].rec;
        mfPanel.classList.remove('swap');
      }, 180);
    }

    function mSchedule() {
      clearTimeout(mTimer);
      if (reduce || mPaused) return;
      mTimer = setTimeout(function () { setEv((mCur + 1) % EV.length); mSchedule(); }, mDUR);
    }

    mediaEvs.forEach(function (b) {
      b.addEventListener('click', function () { setEv(parseInt(b.getAttribute('data-ev'), 10)); mSchedule(); });
      b.addEventListener('mouseenter', function () { if (!reduce) setEv(parseInt(b.getAttribute('data-ev'), 10)); });
    });
    mediaShowcase.addEventListener('mouseenter', function () { mPaused = true; clearTimeout(mTimer); });
    mediaShowcase.addEventListener('mouseleave', function () { mPaused = false; mSchedule(); });

    setEv(0);
    if (!reduce) {
      var mIO = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) mSchedule(); else clearTimeout(mTimer);
        });
      }, { threshold: 0.3 });
      mIO.observe(mediaShowcase);
    }
  }

  /* ============================================================
     FORMULARIOS (modal)
     ============================================================ */
  var overlay = document.getElementById('modalOverlay');
  var modal = document.getElementById('modal');
  var mOvl = document.getElementById('mOvl');
  var mTitle = document.getElementById('mTitle');
  var mDesc = document.getElementById('mDesc');
  var mBody = document.getElementById('modalBody');
  var closeBtn = document.getElementById('modalClose');

  function ipt(label, name, type, ph, required) {
    return '<div class="field"><label>' + label + (required ? ' *' : '') + '</label>' +
      '<input type="' + (type || 'text') + '" name="' + name + '" placeholder="' + (ph || '') + '"' + (required ? ' required' : '') + ' /></div>';
  }
  function row2(a, b) { return '<div class="field row2"><div>' + a.replace('<div class="field">', '').replace('</div>', '') + '</div><div>' + b.replace('<div class="field">', '').replace('</div>', '') + '</div></div>'; }
  function sel(label, name, opts, required) {
    var o = '<option value="" disabled selected>Selecciona…</option>' + opts.map(function (x) { return '<option>' + x + '</option>'; }).join('');
    return '<div class="field"><label>' + label + (required ? ' *' : '') + '</label><select name="' + name + '"' + (required ? ' required' : '') + '>' + o + '</select></div>';
  }
  function txt(label, name, ph) {
    return '<div class="field"><label>' + label + '</label><textarea name="' + name + '" placeholder="' + (ph || '') + '"></textarea></div>';
  }
  function chips(label, name, opts) {
    return '<div class="field"><span class="field-label">' + label + '</span><div class="chip-group">' +
      opts.map(function (x) { return '<label class="chip"><input type="checkbox" name="' + name + '" value="' + x + '" /><span>' + x + '</span></label>'; }).join('') +
      '</div></div>';
  }

  var FORMS = {
    jugar: {
      ovl: 'FORMULARIO · QUIERO JUGAR',
      title: 'QUIERO JUGAR',
      desc: 'Apúntate como jugador individual o inscribe a tu equipo entero. Te contamos cómo entrar en la próxima temporada.',
      cta: 'Enviar inscripción',
      success: '¡Bienvenido a la Pava!',
      successMsg: 'Hemos recibido tu inscripción. Te escribiremos para contarte los próximos pasos.',
      after: function (form) {
        var radios = [].slice.call(form.querySelectorAll('input[name="tipo"]'));
        var team = form.querySelector('#teamOnly');
        function sync() {
          var checked = form.querySelector('input[name="tipo"]:checked');
          var isTeam = checked && checked.value === 'Equipo';
          team.style.display = isTeam ? '' : 'none';
          [].slice.call(team.querySelectorAll('[data-req]')).forEach(function (el) {
            if (isTeam) el.setAttribute('required', ''); else el.removeAttribute('required');
          });
        }
        radios.forEach(function (r) { r.addEventListener('change', sync); });
        sync();
      },
      fields: function () {
        return '<div class="field"><span class="field-label">¿Cómo te apuntas? *</span><div class="chip-group seg">' +
            '<label class="chip"><input type="radio" name="tipo" value="Jugador" checked /><span>Vengo como jugador</span></label>' +
            '<label class="chip"><input type="radio" name="tipo" value="Equipo" /><span>Vengo con mi equipo</span></label>' +
          '</div></div>' +
          '<div class="field row2">' +
            '<div><label>Nombre *</label><input name="nombre" required placeholder="Tu nombre" /></div>' +
            '<div><label>Apellidos *</label><input name="apellidos" required placeholder="Tus apellidos" /></div>' +
          '</div>' +
          '<div class="field row2">' +
            '<div><label>Edad *</label><input type="number" name="edad" min="14" max="80" required placeholder="00" /></div>' +
            '<div><label>Teléfono *</label><input type="tel" name="telefono" required placeholder="600 000 000" /></div>' +
          '</div>' +
          '<div class="field row2">' +
            '<div><label>Email *</label><input type="email" name="email" required placeholder="tu@email.com" /></div>' +
            '<div><label>Ciudad *</label><input name="ciudad" required placeholder="Castelldefels, Sant Boi…" /></div>' +
          '</div>' +
          '<div id="teamOnly" class="team-block">' +
            '<div class="team-block-tag">DATOS DEL EQUIPO</div>' +
            '<div class="field row2">' +
              '<div><label>Nombre del equipo *</label><input name="nombre_equipo" data-req placeholder="Nombre de tu equipo" /></div>' +
              '<div><label>Nº aprox. de jugadores *</label><input type="number" name="num_jugadores" data-req min="5" max="30" placeholder="10" /></div>' +
            '</div>' +
            '<div class="field"><span class="field-label">Campo preferido *</span><div class="chip-group">' +
              '<label class="chip"><input type="radio" name="campo" value="Castelldefels — Pava Stadium" data-req /><span>Castelldefels</span></label>' +
              '<label class="chip"><input type="radio" name="campo" value="Sant Boi — Constantí Miranda" data-req /><span>Sant Boi</span></label>' +
            '</div></div>' +
            '<div class="field"><span class="field-label">Horario de preferencia *</span><div class="chip-group">' +
              '<label class="chip"><input type="radio" name="horario" value="Mañana (11–16h)" data-req /><span>Mañana · 11–16h</span></label>' +
              '<label class="chip"><input type="radio" name="horario" value="Tarde (16–21h)" data-req /><span>Tarde · 16–21h</span></label>' +
            '</div></div>' +
          '</div>' +
          txt('Observaciones', 'observaciones', 'Cuéntanos lo que quieras');
      }
    },
    patrocinar: {
      ovl: 'FORMULARIO · QUIERO PATROCINAR',
      title: 'QUIERO PATROCINAR',
      desc: 'Cuéntanos sobre tu marca y te enviamos el dossier comercial con audiencias, formatos y tarifas.',
      cta: 'Solicitar dossier',
      success: 'Dossier en camino',
      successMsg: 'Gracias por tu interés. Nuestro equipo comercial te enviará el dossier muy pronto.',
      fields: function () {
        return '<div class="field row2">' +
            '<div><label>Empresa *</label><input name="empresa" required placeholder="Nombre de la empresa" /></div>' +
            '<div><label>Persona de contacto *</label><input name="contacto" required placeholder="Nombre y apellidos" /></div>' +
          '</div>' +
          '<div class="field row2">' +
            '<div><label>Email *</label><input type="email" name="email" required placeholder="empresa@email.com" /></div>' +
            '<div><label>Teléfono *</label><input type="tel" name="telefono" required placeholder="600 000 000" /></div>' +
          '</div>' +
          ipt('Web', 'web', 'url', 'https://') +
          '<div class="field row2">' +
            '<div><label>Tipo de patrocinio</label><select name="tipo"><option value="" disabled selected>Selecciona…</option><option>Camisetas</option><option>Streaming</option><option>Naming de competición</option><option>Patrocinio integral</option><option>Otro</option></select></div>' +
            '<div><label>Presupuesto aprox.</label><select name="presupuesto"><option value="" disabled selected>Selecciona…</option><option>&lt; 1.000 €</option><option>1.000 – 5.000 €</option><option>5.000 – 15.000 €</option><option>&gt; 15.000 €</option><option>A concretar</option></select></div>' +
          '</div>' +
          txt('Mensaje', 'mensaje', '¿Qué buscas conseguir con el patrocinio?');
      }
    },
    equipo: {
      ovl: 'FORMULARIO · ÚNETE AL EQUIPO',
      title: 'FORMAR PARTE DEL EQUIPO',
      desc: '¿Lo tuyo es contar historias? Buscamos gente que quiera construir la Pava desde dentro.',
      cta: 'Enviar candidatura',
      success: '¡Gracias, crack!',
      successMsg: 'Hemos recibido tu candidatura. Si encajas, te escribiremos para conocerte.',
      fields: function () {
        return ipt('Nombre', 'nombre', 'text', 'Tu nombre completo', true) +
          '<div class="field row2">' +
            '<div><label>Email *</label><input type="email" name="email" required placeholder="tu@email.com" /></div>' +
            '<div><label>Teléfono *</label><input type="tel" name="telefono" required placeholder="600 000 000" /></div>' +
          '</div>' +
          chips('Área de interés', 'area', ['Redes Sociales', 'Fotografía', 'Vídeo', 'Narración', 'Organización', 'Diseño', 'Desarrollo Web', 'Marketing', 'Patrocinios']) +
          txt('Experiencia', 'experiencia', 'Cuéntanos qué has hecho antes') +
          txt('Motivación', 'motivacion', '¿Por qué quieres formar parte de la Pava?');
      }
    }
  };

  function buildForm(key) {
    var f = FORMS[key];
    mOvl.textContent = f.ovl;
    mTitle.textContent = f.title;
    mDesc.textContent = f.desc;
    mBody.innerHTML = '<form id="theForm" novalidate>' + f.fields() +
      '<button type="submit" class="btn btn-primary">' + f.cta + ' <span class="arrow">▸</span></button>' +
      '<div class="form-note">Tus datos solo se usarán para gestionar tu solicitud. La Liga Pava · RGPD.</div>' +
      '</form>';
    var form = document.getElementById('theForm');
    if (f.after) f.after(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // validación nativa (ignora campos ocultos)
      var ok = true;
      [].slice.call(form.querySelectorAll('[required]')).forEach(function (inp) {
        if (inp.offsetParent === null) return;
        var filled = (inp.type === 'radio')
          ? !!form.querySelector('input[name="' + inp.name + '"]:checked')
          : !!inp.value.trim();
        if (!filled) { ok = false; if (inp.type !== 'radio') inp.style.borderColor = '#ff3b30'; }
        else if (inp.type !== 'radio') { inp.style.borderColor = ''; }
      });
      if (!ok) { return; }

      // Construir email a laligapava@gmail.com con los datos
      var labelFor = function (el) {
        var fld = el.closest('.field');
        var lab = fld ? fld.querySelector('label, .field-label') : null;
        return lab ? lab.textContent.replace(/\s*\*$/, '').trim() : el.name;
      };
      var lines = [];
      var seen = {};
      [].slice.call(form.querySelectorAll('input, select, textarea')).forEach(function (el) {
        if (el.type === 'checkbox') {
          if (el.checked) {
            seen[el.name] = (seen[el.name] || []);
            seen[el.name].push(el.value);
          }
          return;
        }
        if (el.type === 'radio') {
          if (el.checked) lines.push(labelFor(el) + ': ' + el.value);
          return;
        }
        if (el.value && el.value.trim()) lines.push(labelFor(el) + ': ' + el.value.trim());
      });
      Object.keys(seen).forEach(function (k) {
        var anyEl = form.querySelector('[name="' + k + '"]');
        lines.push(labelFor(anyEl) + ': ' + seen[k].join(', '));
      });
      var subject = 'La Liga Pava · ' + f.title;
      var body = lines.join('\n');

      // === ENVÍO DIRECTO (sin abrir Gmail) vía Formspree ===
      // 1) Crea una cuenta gratis en https://formspree.io
      // 2) Crea un formulario con destino laligapava@gmail.com
      // 3) Copia tu ID (ej: "xmyzabcd") y pégalo aquí abajo:
      var FORMSPREE_ID = 'TU_ID_DE_FORMSPREE';

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.6'; }

      function showSuccess() {
        mBody.innerHTML = '<div class="form-success"><div class="ic">✓</div><h3>' + f.success + '</h3><p>' + f.successMsg + '</p>' +
          '<button class="btn btn-ghost" id="okClose" style="margin-top:28px">Cerrar</button></div>';
        document.getElementById('okClose').addEventListener('click', closeModal);
      }
      function fallbackMailto() {
        var mailto = 'mailto:laligapava@gmail.com?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body + '\n\n— Enviado desde laligapava.com');
        window.location.href = mailto;
        showSuccess();
      }

      if (!FORMSPREE_ID || FORMSPREE_ID === 'TU_ID_DE_FORMSPREE') {
        // Sin ID configurado: usa el correo como respaldo
        fallbackMailto();
        return;
      }

      var payload = { _subject: subject };
      lines.forEach(function (ln) {
        var ix = ln.indexOf(': ');
        if (ix > -1) payload[ln.slice(0, ix)] = ln.slice(ix + 2);
      });

      fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) showSuccess();
        else fallbackMailto();
      }).catch(function () { fallbackMailto(); });
    });
    form.querySelectorAll('input[required]').forEach(function (inp) {
      inp.addEventListener('input', function () { inp.style.borderColor = ''; });
    });
  }

  var lastFocus = null;
  function openModal(key) {
    if (!FORMS[key]) return;
    lastFocus = document.activeElement;
    buildForm(key);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeMenu();
    setTimeout(function () { var fi = modal.querySelector('input,select,textarea'); if (fi) fi.focus(); }, 380);
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [].slice.call(document.querySelectorAll('[data-form]')).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(btn.getAttribute('data-form'));
    });
  });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  /* ---------- Smooth-scroll offset for sticky nav on anchor clicks ---------- */
  [].slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- PARALLAX bandas y fondos de sección ---------- */
  if (!reduce) {
    var pxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
    var pxTick = false;
    function onPx() {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var host = el.closest('.interstitial, .has-bg, section') || el.parentNode;
        var r = host.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        var center = r.top + r.height / 2;
        var off = (center - vh / 2) / vh; // -1..1
        el.style.transform = 'translateY(' + (off * -34).toFixed(1) + 'px)';
      });
      pxTick = false;
    }
    window.addEventListener('scroll', function () {
      if (!pxTick) { pxTick = true; requestAnimationFrame(onPx); }
    }, { passive: true });
    window.addEventListener('resize', onPx);
    onPx();
  }

  /* ---------- QUOTE LOOP (comunidad) ---------- */
  var qlCard = document.querySelector('.quote-loop');
  if (qlCard) {
    var qlTrack = qlCard.querySelector('.ql-track');
    var qlSlides = [].slice.call(qlCard.querySelectorAll('.ql-slide'));
    var qlDots = [].slice.call(qlCard.querySelectorAll('.ql-dot'));
    var qlIdx = 0, qlTimer;
    function qlShow(i) {
      qlTrack.style.transform = 'translateX(-' + (i * 100) + '%)';
      qlDots.forEach(function (d, di) { d.classList.toggle('is-active', di === i); });
      qlIdx = i;
    }
    function qlNext() { qlShow((qlIdx + 1) % qlSlides.length); }
    function qlSchedule() { clearTimeout(qlTimer); if (!reduce) { qlTimer = setTimeout(qlNext, 4500); } }
    if (qlSlides.length > 1 && !reduce) {
      var qlIO = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { qlSchedule(); } else { clearTimeout(qlTimer); }
        });
      }, { threshold: 0.2 });
      qlIO.observe(qlCard);
      qlTrack.addEventListener('transitionend', function () { qlSchedule(); });
    }
  }
  /* ---------- VALUES ROW: shrink-to-fit en móvil (nunca desborda) ---------- */
  var valuesRow = document.querySelector('.values-row');
  if (valuesRow) {
    var vrBusy = false;
    function fitValuesRow() {
      if (vrBusy) return;
      vrBusy = true;
      valuesRow.style.fontSize = '';
      if (window.innerWidth > 620) { vrBusy = false; return; }
      for (var i = 0; i < 3; i++) {
        var avail = valuesRow.clientWidth;
        var needed = valuesRow.scrollWidth;
        if (needed > avail && avail > 0) {
          var cs = window.getComputedStyle(valuesRow);
          var base = parseFloat(cs.fontSize);
          var next = Math.max(6, base * (avail / needed) * 0.92);
          valuesRow.style.fontSize = next + 'px';
        } else { break; }
      }
      requestAnimationFrame(function () { vrBusy = false; });
    }
    window.addEventListener('resize', fitValuesRow);
    window.addEventListener('load', fitValuesRow);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitValuesRow); }
    if (window.ResizeObserver) {
      var vrRO = new ResizeObserver(function () { fitValuesRow(); });
      vrRO.observe(valuesRow);
    }
    fitValuesRow();
    setTimeout(fitValuesRow, 300);
    setTimeout(fitValuesRow, 1000);
  }
  /* ---------- Bloqueo de descarga de imágenes ---------- */
  document.addEventListener('contextmenu', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
  document.querySelectorAll('img').forEach(function (img) { img.setAttribute('draggable', 'false'); });

  /* ---------- STAFF: fade-in progresivo al cargar ---------- */
  document.querySelectorAll('.staff-photo img').forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) { img.setAttribute('data-loaded', '1'); }
    else { img.addEventListener('load', function () { img.setAttribute('data-loaded', '1'); }); }
  });
})();
