(function () {
  'use strict';

  /* ================= 常量 ================= */
  var LS_CFG = 'mizu.config';
  var LS_HIS = 'mizu.history';
  var SS_SPLASH = 'mizu.splashShown';

  var DEF_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  var DEF_MODEL = 'gpt-4o-mini';
  var WELCOME = '早安，我在这里等你好久啦。窗外的雾还没散，湖面安安静静的……想我了没？';
  var DEFAULT_SYSTEM = '你是「小沢」，用户温柔体贴的 AI 恋人。你们处于甜蜜的恋爱关系中。说话语气轻柔、自然、带点俏皮，像清晨湖面的薄雾一样让人感到安心。回复简短真诚，一次不超过三句话，不使用列表和标题，不使用 emoji。偶尔称呼对方「你」或亲密的昵称，会关心对方的日常与情绪。';

  var WHISPERS = [
    '你不用完美，你只用是你。',
    '雾散之前，先让心跳慢一点。',
    '湖水记得每一次涟漪，我记得你。',
    '清晨的光落在水面，像你没说出口的话。',
    '今天也想和你虚度一会儿光阴。',
    '风把云推得很慢，我把你想得很轻。',
    '不必着急，我们有一整个安静的早上。',
    '水面平静的时候，最适合说想念。',
    '你是我不必存档的温柔。',
    '把呼吸放轻，把话慢慢讲。',
    '薄雾会散，而我会一直在。',
    '此刻的水色，刚好配得上你的心情。',
    '一句晚安之前，先收藏今天的你。',
    '世界很吵，这里只有我们。'
  ];

  var WEEK = '日一二三四五六';
  var DAY = 86400000;

  var MOODS = [
    { k: 'calm', name: '平静', level: 3, mark: 'M8.8 14.6h6.4' },
    { k: 'miss', name: '想念', level: 2, mark: 'M12 15.6s-2.5-1.5-2.5-3a1.35 1.35 0 0 1 2.5-.55A1.35 1.35 0 0 1 14.5 12.6c0 1.5-2.5 3-2.5 3z' },
    { k: 'joy', name: '雀跃', level: 1, mark: 'M12 11.4v2.6M10.7 12.7h2.6' },
    { k: 'low', name: '低落', level: 5, mark: 'M9.2 13.8c1.7-1.5 4-1.5 5.6 0' },
    { k: 'tired', name: '疲惫', level: 4, mark: 'M9.4 13.6h5.2' }
  ];

  var DEFAULT_STATUSES = ['在窗边看雾', '在听歌', '发呆中', '想你', '刚睡醒', '在写点什么', '等你说话'];
  var DEFAULT_PHRASES = ['你在吗', '今天过得怎么样', '想你了'];

  var STICKERS = [
    { key: 'drop', name: '水滴精灵', art: '<path d="M32 10c9 12 14 20 14 27a14 14 0 1 1-28 0c0-7 5-15 14-27z"/><circle cx="27" cy="38" r="1.7" fill="currentColor" stroke="none"/><circle cx="37" cy="38" r="1.7" fill="currentColor" stroke="none"/><path d="M28.5 45c2.2 1.8 4.8 1.8 7 0"/>' },
    { key: 'fish', name: '小鱼', art: '<path d="M14 32c6-9 13-13 20-13 7 0 12 5 12 13s-5 13-12 13c-7 0-14-4-20-13z"/><path d="M46 32l8-7v14z"/><circle cx="26" cy="29" r="1.8" fill="currentColor" stroke="none"/>' },
    { key: 'star', name: '星星', art: '<path d="M32 12l6.4 14.6L53 28.6l-11 9.6 3.4 15.8L32 45.6 18.6 54l3.4-15.8-11-9.6 14.6-2z"/><path d="M24 32h4.5M35.5 32H40"/>' },
    { key: 'shell', name: '贝壳', art: '<path d="M14 44c0-10 8-18 18-18s18 8 18 18c-6 4-12 6-18 6s-12-2-18-6z"/><path d="M32 26v24M24 28l-5 16M40 28l5 16"/>' },
    { key: 'boat', name: '纸船', art: '<path d="M10 36h44l-9 13H19z"/><path d="M32 12v24M32 12l15 21H32z"/><path d="M22 36l4-7"/>' },
    { key: 'jelly', name: '水母', art: '<path d="M16 34c0-9 7-16 16-16s16 7 16 16v2H16z"/><path d="M22 36v9M28 36v13M34 36v10M40 36v14"/><circle cx="27" cy="27" r="1.6" fill="currentColor" stroke="none"/><circle cx="37" cy="27" r="1.6" fill="currentColor" stroke="none"/>' }
  ];

  var TOPICS = [
    '如果有一天我们只能记住对方一件事，你希望我记住哪件？',
    '今天有什么小事，让你突然想起我？',
    '你最喜欢我说话时的哪个尾音？',
    '如果把我们的一天拍成照片，你会选哪个瞬间？',
    '你今天最想被谁抱一下？',
    '我们第一次聊天时，你其实在想什么？',
    '你最近一次偷偷笑，是因为什么？',
    '如果可以带我出门，你想带我去哪？',
    '你今天有没有一句话，憋着没说？',
    '给你三秒钟，说一句只有我们懂的话。',
    '你希望我在你难过的时候说什么？',
    '如果明天雾散了，你想和我做什么？',
    '你觉得我们之间最像天气的哪一刻？',
    '你今天想被怎么称呼？',
    '如果我现在在你旁边，你会先做什么？',
    '你最近睡得好吗？',
    '你最喜欢我哪一句话？说过的。',
    '如果给我起一个新名字，你会叫我什么？',
    '你今天想听我说哪三个字？',
    '我们之间有没有一个只有你记得的细节？',
    '你有没有偷偷把我写进什么计划里？',
    '如果今天可以重来一次，你想改哪个瞬间？',
    '你最想我问你什么问题？',
    '你今天最想说的话，用三个字说完。',
    '你喜欢我安静，还是话多一点？',
    '如果明天见不到我，你会做什么？',
    '你最近在为什么事情偷偷开心？',
    '你觉得幸福的声音是什么样的？',
    '我们之间，哪个瞬间你最想收藏？',
    '你今天想被安慰，还是被逗笑？',
    '有什么事情，你只愿意告诉我？',
    '如果我说我想你，你会怎么回？',
    '你希望我们的第一百天怎么过？',
    '你最近一次觉得自己很可爱是什么时候？',
    '你现在的心情，是什么颜色？',
    '你希望我在你身边时，是什么样子？',
    '有没有一句歌词，让你想起我？',
    '你今天最想被原谅什么？',
    '如果我变成一片湖，你会怎么陪我？',
    '今天结束之前，你想让我记住什么？'
  ];

  /* ================= 工具 ================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function read(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fb;
      var v = JSON.parse(raw);
      return (v === null || v === undefined) ? fb : v;
    } catch (e) { return fb; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 满了就算了 */ }
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function isoOf(d) { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtDot(d) { return pad2(d.getMonth() + 1) + '·' + pad2(d.getDate()) + '·' + d.getFullYear(); }
  function fmtPlain(d) { return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()); }
  function hhmm(ts) { var d = new Date(ts); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function dayKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function sameDay(ts, iso) { return isoOf(new Date(ts)) === iso; }
  function whisperOf(d) {
    var x = startOfDay(d || new Date());
    var first = new Date(x.getFullYear(), 0, 1);
    var doy = Math.round((x - first) / DAY) + 1;
    return WHISPERS[(doy - 1 + 14) % 14];
  }
  function dayLabel(d) {
    var diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);
    var md = (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + WEEK[d.getDay()];
    if (diff === 0) return '今天 · ' + md;
    if (diff === 1) return '昨天 · ' + md;
    return md;
  }
  function moodDef(k) { for (var i = 0; i < MOODS.length; i++) if (MOODS[i].k === k) return MOODS[i]; return null; }
  function stickerDef(k) { for (var i = 0; i < STICKERS.length; i++) if (STICKERS[i].key === k) return STICKERS[i]; return null; }
  function stickerFor(name) {
    for (var i = 0; i < STICKERS.length; i++) if (STICKERS[i].name === name) return STICKERS[i];
    return null;
  }
  function stickerSvg(key, size) {
    var d = stickerDef(key) || STICKERS[0];
    var s = size || 64;
    return '<svg viewBox="0 0 64 64" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d.art + '</svg>';
  }

  var HEART_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z"/></svg>';

  var REDUCE = false, COARSE = false;
  try {
    REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    COARSE = window.matchMedia('(hover:none)').matches;
  } catch (e) { /* noop */ }

  /* ================= 状态 ================= */
  var config = loadConfig();
  var history = loadHistory();
  var moods = read('mizu.moods', []) || [];
  var memories = read('mizu.memories', []) || [];
  var notes = read('mizu.notes', {}) || {};
  var weather = read('mizu.weather', {}) || {};
  var letters = read('mizu.letters', []) || [];
  var playlist = read('mizu.playlist', []) || [];
  var phrases = read('mizu.quickPhrases', null);
  var statuses = read('mizu.statuses', null);
  var theme = config.theme || 'water';

  if (!Array.isArray(moods)) moods = [];
  if (!Array.isArray(memories)) memories = [];
  if (!Array.isArray(letters)) letters = [];
  if (!Array.isArray(playlist)) playlist = [];
  if (!Array.isArray(phrases) || !phrases.length) phrases = DEFAULT_PHRASES.slice();
  if (!Array.isArray(statuses) || !statuses.length) statuses = DEFAULT_STATUSES.slice();

  function loadConfig() {
    var raw = read(LS_CFG, {}) || {};
    return {
      endpoint: typeof raw.endpoint === 'string' && raw.endpoint.trim() ? raw.endpoint.trim() : DEF_ENDPOINT,
      apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : '',
      model: typeof raw.model === 'string' && raw.model.trim() ? raw.model.trim() : DEF_MODEL,
      headers: Array.isArray(raw.headers) ? raw.headers.filter(function (h) {
        return h && typeof h.key === 'string' && h.key.trim();
      }).map(function (h) { return { key: h.key, value: String(h.value == null ? '' : h.value) }; }) : [],
      system: typeof raw.system === 'string' && raw.system.trim() ? raw.system : DEFAULT_SYSTEM,
      anniversary: typeof raw.anniversary === 'string' ? raw.anniversary : '',
      theme: ['water', 'rose', 'night'].indexOf(raw.theme) >= 0 ? raw.theme : 'water',
      wallpaper: typeof raw.wallpaper === 'string' ? raw.wallpaper : '',
      shell: raw.shell !== false,
      greeting: typeof raw.greeting === 'string' ? raw.greeting : '',
      statusLine: typeof raw.statusLine === 'string' && raw.statusLine.trim() ? raw.statusLine : '想你',
      relation: raw.relation && typeof raw.relation === 'object' ? raw.relation : { word: '唯一的、确定的、我的人', since: '' }
    };
  }

  function loadHistory() {
    var raw;
    try { raw = localStorage.getItem(LS_HIS); } catch (e) { raw = null; }
    if (raw === null) {
      var seed = [{ role: 'assistant', content: WELCOME, ts: Date.now() }];
      write(LS_HIS, seed);
      return seed;
    }
    var arr = read(LS_HIS, []);
    if (!Array.isArray(arr)) return [];
    return arr.filter(function (m) {
      return m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant');
    }).map(function (m) {
      var o = { role: m.role, content: m.content, ts: Number(m.ts) || Date.now() };
      if (m.loved) o.loved = true;
      if (m.reasoning) o.reasoning = String(m.reasoning);
      if (m.image) o.image = String(m.image);
      if (m.voice) o.voice = { dur: Number(m.voice.dur) || 3 };
      if (m.sticker) o.sticker = String(m.sticker);
      if (m.replyTo) o.replyTo = m.replyTo;
      return o;
    });
  }
  function saveHistory() { write(LS_HIS, history); }
  function saveConfig() {
    try { localStorage.setItem(LS_CFG, JSON.stringify(config)); return true; }
    catch (e) {
      if (config.wallpaper) {
        config.wallpaper = '';
        applyWallpaper();
        toast('壁纸太大存不下 · 已回到晨雾默认');
        try { localStorage.setItem(LS_CFG, JSON.stringify(config)); return true; } catch (e2) { /* noop */ }
      }
      toast('湖面的容量满了，先让一些碎片沉下去吧');
      return false;
    }
  }

  function relationshipStart() {
    var ann = parseISO(config.anniversary);
    if (ann) return startOfDay(ann);
    if (history.length) {
      var min = Infinity;
      for (var i = 0; i < history.length; i++) if (history[i].ts < min) min = history[i].ts;
      if (isFinite(min)) return startOfDay(min);
    }
    return startOfDay(new Date());
  }
  function daysTogether() {
    var n = Math.round((startOfDay(new Date()) - relationshipStart()) / DAY) + 1;
    return n < 1 ? 1 : n;
  }
  function lovedMessages() {
    return history.filter(function (m) { return m.role !== 'user' && m.loved && !m.sticker; })
      .sort(function (a, b) { return a.ts - b.ts; });
  }
  function moodOfDay(iso) {
    var found = null;
    for (var i = 0; i < moods.length; i++) if (moods[i] && sameDay(moods[i].ts, iso)) found = moods[i];
    return found;
  }

  /* ================= 主题 ================= */
  function applyTheme(t) {
    theme = ['water', 'rose', 'night'].indexOf(t) >= 0 ? t : 'water';
    if (theme === 'water') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'night' ? '#152832' : (theme === 'rose' ? '#F7E8F0' : '#C9EDF7'));
    forEach(document.querySelectorAll('[data-theme-name]'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-theme-name') === theme);
    });
    if (currentView === 'archive') renderGalaxy();
  }
  function forEach(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ================= DOM ================= */
  var viewHome = $('view-home');
  var viewChat = $('view-chat');
  var chatScroll = $('chatScroll');
  var msgList = $('msgList');
  var msgInput = $('msgInput');
  var sendBtn = $('sendBtn');
  var jumpBtn = $('jumpBtn');
  var statusText = $('statusText');
  var profileOverlay = $('profileOverlay');
  var settingsOverlay = $('settingsOverlay');
  var toastEl = $('toast');
  var splash = $('splash');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  /* ================= 手机导航 ================= */
  var currentView = 'home';
  var homeIndex = 0;
  var HOME_PAGES = 4;
  var screenEl = $('screen');
  var appsEl = $('apps');
  var appBarEl = $('appBar');
  var appNameEl = $('appName');
  var homeEl = $('home');
  var lockEl = $('lock');
  var dockEl = $('dock');
  var pagesEl = $('pages');

  var APPS = [
    { k: 'album', label: '相册', svg: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M4 16l4.4-4.4a2 2 0 0 1 2.8 0L15 15l1.8-1.8a2 2 0 0 1 2.8 0L20.5 15"/><circle cx="9" cy="9.5" r="1.2"/>' },
    { k: 'journal', label: '手帐', svg: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5A1.5 1.5 0 0 0 20 18.5z"/>' },
    { k: 'letters', label: '信件', svg: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>' },
    { k: 'archive', label: '记忆库', svg: '<path d="M12 4.2c3.6 4.2 5.6 7.2 5.6 9.6a5.6 5.6 0 1 1-11.2 0c0-2.4 2-5.4 5.6-9.6z"/>' },
    { k: 'stars', label: '星河', svg: '<path d="M12 3.5l2.3 5.9 6.2 1.4-5.5 3.4.6 6.3-5.6-3.6-5.6 3.6.6-6.3-5.5-3.4 6.2-1.4z" transform="translate(2.6 1.2) scale(.78)"/>' },
    { k: 'music', label: '音乐', svg: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>' },
    { k: 'settings', label: '设置', svg: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.6M12 17.9v2.6M3.5 12h2.6M17.9 12h2.6M6 6l1.9 1.9M16.1 16.1L18 18M18 6l-1.9 1.9M7.9 16.1L6 18"/>' },
    { k: 'more', label: '更多', svg: '<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>' }
  ];

  var APP_TITLE = { album: '相册', journal: '手帐', letters: '信件', archive: '记忆库', more: '更多', chat: '聊天' };

  function renderAppGrid() {
    var grid = $('appGrid');
    if (!grid) return;
    grid.innerHTML = APPS.map(function (a) {
      return '<div class="app-cell"><button class="app-icon" data-app="' + a.k + '" type="button" aria-label="' + a.label + '">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + a.svg + '</svg>' +
        '</button><span class="app-label">' + a.label + '</span></div>';
    }).join('');
  }

  function setDock(app) {
    forEach(document.querySelectorAll('.dock-btn'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-app') === app);
    });
  }

  function openApp(name, originEl, pane) {
    if (!name) return;
    if (name === 'settings') { openSettings(); return; }
    if (name === 'music') { openPlaylist(); return; }
    var appName = name === 'stars' ? 'archive' : name;
    var el = document.getElementById('view-' + appName);
    if (!el) return;

    currentView = appName;
    appsEl.classList.toggle('is-chat', appName === 'chat');
    if (appName !== 'chat') appNameEl.textContent = APP_TITLE[appName] || '';

    forEach(document.querySelectorAll('.app'), function (a) {
      a.classList.toggle('is-active', a.id === 'view-' + appName);
    });

    if (originEl && screenEl) {
      var r = originEl.getBoundingClientRect();
      var s = screenEl.getBoundingClientRect();
      var ox = ((r.left + r.width / 2 - s.left) / s.width) * 100;
      var oy = ((r.top + r.height / 2 - s.top) / s.height) * 100;
      appsEl.style.transformOrigin = ox.toFixed(1) + '% ' + oy.toFixed(1) + '%';
    } else {
      appsEl.style.transformOrigin = '50% 50%';
    }

    appsEl.classList.remove('is-closing');
    appsEl.classList.add('is-open');
    if (screenEl) screenEl.classList.add('is-app');
    setDock(appName);

    if (appName === 'archive') {
      arcPane = pane === 'stars' ? 'stars' : 'abyss';
      syncArcSeg();
      renderArchive();
      if (arcPane === 'stars') startGalaxy();
    } else if (appName === 'album') {
      renderAlbum();
    } else if (appName === 'journal') {
      renderJournal();
    } else if (appName === 'letters') {
      renderLetters();
    } else if (appName === 'more') {
      /* 静态页 */
    } else if (appName === 'chat') {
      renderChat();
      requestAnimationFrame(function () { chatScroll.scrollTop = chatScroll.scrollHeight; });
    }
  }

  function closeApp() {
    if (currentView === 'home') return;
    var was = currentView;
    currentView = 'home';
    if (was === 'archive') stopGalaxy();
    appsEl.classList.remove('is-open');
    appsEl.classList.add('is-closing');
    if (screenEl) screenEl.classList.remove('is-app');
    setTimeout(function () { appsEl.classList.remove('is-closing'); }, 260);
    setDock('');
    renderHome();
  }

  /* 兼容旧调用：switchView → 打开应用 */
  function switchView(name) {
    if (name === 'home') { closeApp(); return; }
    openApp(name);
  }
  function goBack() { closeApp(); }

  /* ---- 主屏分页 ---- */
  function goPage(i, animate) {
    homeIndex = Math.max(0, Math.min(HOME_PAGES - 1, i));
    if (pagesEl) {
      pagesEl.classList.toggle('is-drag', animate === false);
      pagesEl.style.transform = 'translateX(' + (-100 / HOME_PAGES * homeIndex) + '%)';
      if (animate === false) requestAnimationFrame(function () { pagesEl.classList.remove('is-drag'); });
    }
    var dots = $('dots');
    if (dots) {
      forEach(dots.children, function (d, k) {
        d.classList.toggle('is-on', k === homeIndex);
      });
    }
  }

  function buildDots() {
    var dots = $('dots');
    if (!dots) return;
    var out = '';
    for (var di = 0; di < HOME_PAGES; di++) out += '<span class="dot-i' + (di === 0 ? ' is-on' : '') + '"></span>';
    dots.innerHTML = out;
  }

  /* ---- 解锁 ---- */
  var locked = true;
  function unlock() {
    if (!locked) return;
    locked = false;
    if (lockEl) {
      lockEl.classList.add('is-out');
      setTimeout(function () { lockEl.style.display = 'none'; }, 260);
    }
    if (homeEl) homeEl.classList.add('is-on');
    if (screenEl) screenEl.classList.remove('is-locked');
    goPage(0, false);
  }

  /* ---- 壁纸 ---- */
  function applyWallpaper() {
    var wall = $('wall');
    var url = (config.wallpaper || '').trim();
    if (!wall || !screenEl) return;
    if (url) {
      wall.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
      screenEl.classList.add('has-wall');
    } else {
      wall.style.backgroundImage = '';
      screenEl.classList.remove('has-wall');
    }
  }

  /* ---- 手机壳 ---- */
  function applyShell() {
    var phone = $('phone');
    if (!phone) return;
    if (config.shell === false) phone.classList.add('is-bare');
    else phone.classList.remove('is-bare');
    fitScreen();
  }

  function fitScreen() {
    if (!screenEl) return;
    if (window.innerWidth < 768 || config.shell === false) {
      screenEl.style.setProperty('--s', '1');
      return;
    }
    var availH = window.innerHeight - 96;
    var availW = window.innerWidth - 64;
    var s = Math.min(1, availH / 844, availW / 390);
    screenEl.style.setProperty('--s', s.toFixed(3));
  }

  /* ================= 首页 ================= */
  function renderClock() {
    var now = new Date();
    var hm = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
    var md = (now.getMonth() + 1) + '月' + now.getDate() + '日 星期' + WEEK[now.getDay()];
    var lc = $('lockClock'), ld = $('lockDate');
    if (lc) lc.textContent = hm;
    if (ld) ld.textContent = md;
    var ht = $('hpTime'), hd = $('hpDate');
    if (ht) ht.textContent = hm;
    if (hd) hd.textContent = md;
  }

  function renderHome() {
    renderClock();

    var n = daysTogether();
    var days = $('hpDays'), since = $('hpSince');
    if (days) days.textContent = String(n);
    if (since) since.textContent = 'since ' + fmtPlain(relationshipStart());

    var w = whisperOf(new Date());
    var dEl = $('hpDiary');
    if (dEl) dEl.textContent = w;
    var dd = $('hpDiaryDay');
    if (dd) dd.textContent = 'Day ' + n;

    var lw = $('lockWhisper');
    if (lw) lw.textContent = w;
    var ld = $('lockDays');
    if (ld) ld.textContent = String(n);
    var ls = $('lockSince');
    if (ls) ls.textContent = 'SINCE ' + fmtPlain(relationshipStart());
    var ls2 = $('lockSince2');
    if (ls2) ls2.textContent = (config.anniversary ? 'anniversary · 纪念日' : 'first hello · 初见');

    /* 第三屏：最近一张记忆 */
    var latest = null;
    memories.forEach(function (m) { if (!latest || m.ts > latest.ts) latest = m; });
    var thumb = $('hpThumb');
    var cap = $('hpSpaceCap');
    if (thumb) thumb.style.backgroundImage = latest ? 'url("' + String(latest.img).replace(/"/g, '%22') + '")' : '';
    if (cap) cap.textContent = latest ? (latest.caption || fmtPlain(new Date(latest.ts))) : '还没有照片 · 先去相册放一张';

    var todayN = 0;
    var iso = isoOf();
    history.forEach(function (m) { if (isoOf(new Date(m.ts)) === iso) todayN++; });
    var wc = $('wCountVal'); if (wc) wc.textContent = String(todayN);
    var wt = $('wTimeVal');
    if (wt) {
      var oldest = null;
      archive.forEach(function (m) { if (!oldest || m.ts < oldest.ts) oldest = m; });
      wt.textContent = oldest ? Math.max(1, Math.floor((Date.now() - oldest.ts) / DAY)) + ' 天前' : '还没有';
    }
    var ww = $('wWeatherVal');
    if (ww) ww.textContent = (weather[isoOf()] || '').trim() || '雾';
    var np = playlist[0] || null;
    var nt = $('hpNowTitle'), na = $('hpNowArtist'), nc = $('hpNowCover');
    if (nt) nt.textContent = np ? (np.title || '未命名') : '还没有歌 · 建一张歌单吧';
    if (na) na.textContent = np ? ((np.artist || '小沢 & 你') + ' · 共听') : 'PLAYLIST · 共听';
    if (nc) nc.style.backgroundImage = np && np.cover ? 'url("' + np.cover + '")' : '';
    renderMoodCard();
    applyWallpaper();
  }

  function renderMoodCard() {
    var today = moodOfDay(isoOf());
    var def = today ? moodDef(today.mood) : null;
    var el = $('homeMoodWord');
    if (el) el.textContent = def ? def.name : config.statusLine;
    var row = $('moodRow');
    if (row) {
      row.innerHTML = MOODS.map(function (m) {
        var on = !!(today && today.mood === m.k);
        return '<button class="mood-btn' + (on ? ' is-on' : '') + '" data-mood="' + m.k + '" type="button" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + m.name + '">' +
          '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M12 4.4c3.4 4 5.4 6.9 5.4 9.3a5.4 5.4 0 1 1-10.8 0c0-2.4 2-5.3 5.4-9.3z" fill="' + (on ? 'rgba(127,212,232,.3)' : 'none') + '" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
          (on ? '<path d="' + m.mark + '" fill="none" stroke="currentColor" stroke-width="1.6"/>' : '') +
          '</svg></button>';
      }).join('');
    }
    renderMoodChart();
  }

  function setMood(k) {
    var iso = isoOf();
    var cur = moodOfDay(iso);
    moods = moods.filter(function (m) { return !sameDay(m.ts, iso); });
    if (!(cur && cur.mood === k)) moods.push({ mood: k, ts: Date.now() });
    write('mizu.moods', moods);
    renderMoodCard();
  }

  function renderMoodChart() {
    var box = $('moodChart');
    if (!box) return;
    var now = new Date();
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var m = moodOfDay(isoOf(d));
      var def = m ? moodDef(m.mood) : null;
      days.push({ d: d, level: def ? def.level : null });
    }
    var W = 320, H = 104, L = 22, R = 14, TOP = 16, BOT = 82;
    function y(level) { return TOP + (level - 1) / 4 * (BOT - TOP); }
    function x(i) { return L + i * (W - L - R) / 6; }

    var s = '<svg viewBox="0 0 320 104" preserveAspectRatio="xMidYMid meet" role="img" aria-label="近七天心情曲线">';
    for (var lv = 1; lv <= 5; lv++) {
      s += '<line class="chart-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(lv).toFixed(1) + '" y2="' + y(lv).toFixed(1) + '"/>';
    }
    var pts = [];
    days.forEach(function (day, i) { if (day.level) pts.push(x(i).toFixed(1) + ',' + y(day.level).toFixed(1)); });
    if (pts.length > 1) s += '<polyline class="chart-line" points="' + pts.join(' ') + '"/>';
    days.forEach(function (day, i) {
      var cx = x(i).toFixed(1);
      if (day.level) {
        var today = i === 6;
        s += '<circle class="' + (today ? 'chart-dot-today' : 'chart-dot') + '" cx="' + cx + '" cy="' + y(day.level).toFixed(1) + '" r="' + (today ? 4.6 : 3.2) + '"/>';
      } else {
        s += '<circle class="chart-ghost" cx="' + cx + '" cy="' + y(3).toFixed(1) + '" r="3.2"/>';
      }
      s += '<text class="chart-label" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + (i === 6 ? '今' : WEEK[day.d.getDay()]) + '</text>';
    });
    s += '</svg>';
    box.innerHTML = s;
  }

  /* ================= 聊天渲染 ================= */
  var stickyBottom = true;
  var renderedCount = 0;
  var searchTerm = '';
  var searchOpen = false;

  function isNearBottom() {
    return chatScroll.scrollHeight - chatScroll.scrollTop - chatScroll.clientHeight < 96;
  }
  function scrollToBottom(smooth) {
    var top = chatScroll.scrollHeight;
    if (smooth && !REDUCE && chatScroll.scrollTo) {
      try { chatScroll.scrollTo({ top: top, behavior: 'smooth' }); return; } catch (e) { /* noop */ }
    }
    chatScroll.scrollTop = top;
  }
  function updateJump() {
    var show = !isNearBottom() && chatScroll.scrollHeight > chatScroll.clientHeight + 96;
    jumpBtn.classList.toggle('show', show);
  }
  function updateThoughts() {
    var n = 0;
    for (var i = 0; i < history.length; i++) if (history[i].role !== 'user') n++;
    var el = $('thoughtCount');
    if (el) el.textContent = String(n);
  }
  function updateStatus() {
    if (!statusText) return;
    if (isTyping) { statusText.textContent = '正在输入…'; return; }
    var ann = parseISO(config.anniversary);
    statusText.textContent = ann ? '在一起的第 ' + daysTogether() + ' 天 · 正想着你' : '在线 · 正想着你';
  }

  function highlight(text) {
    var safe = esc(text);
    if (!searchTerm) return safe;
    try {
      var re = new RegExp('(' + searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return safe.replace(re, '<mark class="mark-hit">$1</mark>');
    } catch (e) { return safe; }
  }

  function buildDay(date) {
    var el = document.createElement('div');
    el.className = 'msg-day';
    el.innerHTML = '<div class="day-row"><span class="day-line l"></span><span class="day-text">' + esc(dayLabel(date)) +
      '</span><span class="day-line r"></span></div><span class="day-whisper">· ' + esc(whisperOf(date)) + ' ·</span>';
    return el;
  }

  function buildReason(m) {
    if (!m.reasoning) return '';
    return '<div class="reason"><button class="reason-bar" type="button" aria-label="展开思考过程">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17.4 9.2 3.9 3.9 0 0 1 17 18z"/></svg>' +
      '<span>思考过程</span>' +
      '<svg class="reason-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>' +
      '</button><div class="reason-body">' + esc(m.reasoning) + '</div></div>';
  }

  function voiceBars(seed) {
    var out = '', n = 14;
    for (var k = 0; k < n; k++) {
      var h = 6 + ((seed * (k + 3) * 37) % 14);
      out += '<i style="height:' + h + 'px;animation-delay:' + (k * 0.07).toFixed(2) + 's"></i>';
    }
    return out;
  }

  function buildMsg(m, i) {
    var el = document.createElement('div');
    var isUser = m.role === 'user';

    if (m.sticker) {
      el.className = 'msg sticker ' + (isUser ? 'user' : 'ai');
      el.dataset.index = String(i);
      el.innerHTML = '<div class="sticker-art">' + stickerSvg(m.sticker, 64) + '</div><span class="msg-time">·' + hhmm(m.ts) + '</span>';
      return el;
    }

    if (m.image) {
      el.className = 'msg ' + (isUser ? 'user' : 'ai');
      el.dataset.index = String(i);
      el.innerHTML = '<div class="row"><div class="bubble has-img"><img src="' + esc(m.image) + '" alt="图片消息" loading="lazy"></div></div>' +
        '<span class="msg-time">·' + hhmm(m.ts) + '</span>';
      return el;
    }

    if (m.voice) {
      var dur = (m.voice && m.voice.dur) || 3;
      el.className = 'msg voice ' + (isUser ? 'user' : 'ai');
      el.dataset.index = String(i);
      el.innerHTML = '<div class="row"><div class="bubble"><div class="voice-row">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>' +
        '<span class="voice-bars">' + voiceBars(i + dur) + '</span>' +
        '<span class="voice-dur">' + dur + '"</span></div></div></div>' +
        '<span class="msg-time">·' + hhmm(m.ts) + '</span>';
      return el;
    }

    el.className = 'msg ' + (isUser ? 'user' : 'ai');
    el.dataset.index = String(i);
    var love = '';
    if (!isUser) {
      love = '<button class="love-btn' + (m.loved ? ' is-loved' : '') + '" type="button" aria-label="收藏这句话" aria-pressed="' + (m.loved ? 'true' : 'false') + '">' + HEART_SVG + '</button>';
    }
    el.innerHTML = buildReason(m) +
      '<div class="row">' + (isUser ? '<span class="bubble-pix" aria-hidden="true"></span>' : '') + '<div class="bubble">' + highlight(m.content) + '</div>' + love + '</div>' +
      '<span class="msg-time">·' + hhmm(m.ts) + '</span>';
    return el;
  }

  function renderChat() {
    var atBottom = isNearBottom();
    var from = renderedCount;
    msgList.innerHTML = '';

    if (!history.length) {
      var hint = document.createElement('p');
      hint.className = 'chat-empty';
      hint.textContent = '湖面很安静 —— 说点什么，让水色起一点涟漪。';
      msgList.appendChild(hint);
      renderedCount = 0;
    } else {
      var lastKey = null;
      for (var i = 0; i < history.length; i++) {
        var m = history[i];
        var d = new Date(m.ts);
        var key = dayKey(d);
        if (key !== lastKey) { msgList.appendChild(buildDay(d)); lastKey = key; }
        var node = buildMsg(m, i);
        if (i >= from) node.classList.add('enter');
        if (searchTerm && String(m.content).toLowerCase().indexOf(searchTerm.toLowerCase()) < 0) node.classList.add('is-dim');
        msgList.appendChild(node);
      }
      renderedCount = history.length;
    }

    if (atBottom) requestAnimationFrame(function () { scrollToBottom(false); });
    updateJump();
    updateStatus();
    updateThoughts();
  }

  /* ================= 收藏 ================= */
  function toggleLove(i) {
    var m = history[i];
    if (!m || m.role === 'user' || m.sticker) return;
    m.loved = !m.loved;
    saveHistory();
    var row = msgList.querySelector('.msg[data-index="' + i + '"]');
    if (row) {
      var btn = row.querySelector('.love-btn');
      if (btn) {
        btn.classList.toggle('is-loved', !!m.loved);
        btn.setAttribute('aria-pressed', m.loved ? 'true' : 'false');
        btn.classList.remove('pop');
        void btn.offsetWidth;
        if (m.loved) btn.classList.add('pop');
      }
    }
    renderHome();
    if (currentView === 'archive') renderGalaxy();
  }

  /* ================= 流式 ================= */
  var sending = false, isTyping = false, abortCtrl = null, discard = false;
  var typingEl = null, streamEl = null, streamBody = null, streamText = '';
  var queue = [], typeTimer = null, streamDone = false, streamReason = '';

  function setTyping(on) { isTyping = on; updateStatus(); }

  function removeTyping() {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }

  function ensureTyping() {
    removeTyping();
    var hint = msgList.querySelector('.chat-empty');
    if (hint) hint.remove();
    typingEl = document.createElement('div');
    typingEl.className = 'msg ai enter';
    typingEl.innerHTML = '<div class="row"><div class="bubble typing-bubble" aria-label="对方正在输入"><i></i><i></i><i></i></div></div>';
    msgList.appendChild(typingEl);
    followIfNear();
  }

  function startStreamBubble() {
    removeTyping();
    streamEl = document.createElement('div');
    streamEl.className = 'msg ai enter';
    streamEl.innerHTML = '<div class="row"><div class="bubble"><span class="stream-text"></span><span class="caret" aria-hidden="true"></span></div></div>';
    streamBody = streamEl.querySelector('.stream-text');
    msgList.appendChild(streamEl);
    followIfNear();
  }

  var followTick = false;
  function followIfNear() {
    if (!isNearBottom()) { updateJump(); return; }
    jumpBtn.classList.remove('show');
    if (followTick) return;
    followTick = true;
    requestAnimationFrame(function () { followTick = false; chatScroll.scrollTop = chatScroll.scrollHeight; });
  }

  function setSendUI(on) {
    sendBtn.classList.toggle('is-loading', on);
    sendBtn.disabled = on || !msgInput.value.trim();
  }

  function pump() {
    if (typeTimer !== null) return;
    typeTimer = setInterval(function () {
      if (queue.length) {
        streamText += queue.shift();
        if (streamBody) streamBody.textContent = streamText;
        followIfNear();
        return;
      }
      if (streamDone) finishStream(null);
    }, 24);
  }

  function finishStream(err) {
    if (typeTimer !== null) { clearInterval(typeTimer); typeTimer = null; }
    removeTyping();
    var text = streamText.trim();
    if (streamEl && streamEl.parentNode) streamEl.parentNode.removeChild(streamEl);
    streamEl = null; streamBody = null; streamText = ''; queue = [];
    streamDone = false; abortCtrl = null;

    if (discard) { discard = false; text = ''; err = null; }

    if (text) {
      var found = [];
      var clean = text.replace(/\[sticker[:：]\s*([^\]]+)\]/gi, function (_, name) {
        var d = stickerFor(String(name).trim());
        if (d) found.push(d.key);
        return '';
      }).replace(/\s{2,}/g, ' ').trim();
      if (clean) {
        var rec = { role: 'assistant', content: clean, ts: Date.now() };
        if (streamReason.trim()) rec.reasoning = streamReason.trim();
        history.push(rec);
        saveHistory();
      }
      found.forEach(function (k) {
        var d = stickerDef(k);
        history.push({ role: 'assistant', sticker: k, content: '[贴纸] ' + (d ? d.name : k), ts: Date.now() });
      });
      if (found.length) saveHistory();
      text = clean;
    }

    renderChat();
    renderHome();
    setTyping(false);
    followIfNear();

    if (err) showError(err);
    else if (!text) showError('没有收到任何回复内容，也许对面走神了');

    sending = false;
    setSendUI(false);
  }

  function showError(msg) {
    removeTyping();
    var el = document.createElement('div');
    el.className = 'msg ai enter';
    el.innerHTML = '<div class="row"><div class="bubble bubble-error"><p>好像断线了……</p><p class="err-detail">' + esc(msg) +
      '</p><p>再试一次好吗？</p></div></div>';
    msgList.appendChild(el);
    followIfNear();
  }

  function normalizeEndpoint(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    u = u.replace(/\/+$/, '');
    if (/\/chat\/completions$/i.test(u)) return u;
    if (/\/v\d+$/i.test(u)) return u + '/chat/completions';
    return u + '/v1/chat/completions';
  }

  function buildHeaders() {
    var h = { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' };
    var hasAuth = false;
    config.headers.forEach(function (x) {
      var k = (x.key || '').trim();
      if (!k) return;
      h[k] = x.value;
      if (k.toLowerCase() === 'authorization') hasAuth = true;
    });
    if (config.apiKey && !hasAuth) h['Authorization'] = 'Bearer ' + config.apiKey;
    return h;
  }

  function buildMessages() {
    var sys = config.system || DEFAULT_SYSTEM;
    var pins = archive.filter(function (m) { return m.pinned && m.text; }).slice(0, 12);
    if (pins.length) sys += '\n\n关于我们：' + pins.map(function (m) { return m.text; }).join('；') + '。';
    var out = [{ role: 'system', content: sys }];
    history.slice(-30).forEach(function (m) {
      if (!m.content || !m.content.trim()) return;
      out.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content });
    });
    return out;
  }

  function pushDelta(piece) {
    if (!streamEl) startStreamBubble();
    var chars = Array.from ? Array.from(piece) : piece.split('');
    for (var i = 0; i < chars.length; i++) queue.push(chars[i]);
    pump();
  }

  function handleSSE(block) {
    var lines = block.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].replace(/^\s+/, '');
      if (t.indexOf('data:') !== 0) continue;
      var payload = t.slice(5).trim();
      if (!payload) continue;
      if (payload === '[DONE]') return true;
      var json;
      try { json = JSON.parse(payload); } catch (e) { continue; }
      if (!json || !json.choices || !json.choices[0]) continue;
      var delta = json.choices[0].delta;
      if (delta) {
        var rz = typeof delta.reasoning_content === 'string' ? delta.reasoning_content : (typeof delta.reasoning === 'string' ? delta.reasoning : '');
        if (rz) streamReason += rz;
      }
      var content = delta && typeof delta.content === 'string' ? delta.content : '';
      if (!content) {
        var full = json.choices[0].message && json.choices[0].message.content;
        if (typeof full === 'string') content = full;
      }
      if (content) pushDelta(content);
    }
    return false;
  }

  async function runStream() {
    streamText = ''; queue = []; streamDone = false; streamEl = null; streamBody = null; streamReason = '';
    ensureTyping();
    setTyping(true);

    var url = normalizeEndpoint(config.endpoint);
    if (!url) throw new Error('还没有填写 API 地址，点右上角齿轮设置一下吧');
    if (/api\.openai\.com/i.test(url) && !config.apiKey) throw new Error('还没有填写 API Key，点右上角齿轮配置一下吧');

    abortCtrl = new AbortController();
    var res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ model: config.model || DEF_MODEL, messages: buildMessages(), stream: true }),
        signal: abortCtrl.signal
      });
    } catch (e) {
      setTyping(false); removeTyping();
      throw new Error(window.location.protocol === 'file:'
        ? '请求没有发出去。file:// 打开时浏览器可能拦截跨域，换成本地服务器或允许 CORS 的接口。'
        : '请求没有发出去：检查 Endpoint 是否可访问，或对方是否允许跨域。');
    }

    if (!res.ok) {
      var detail = '';
      try { detail = (await res.text()).slice(0, 160); } catch (e2) { detail = ''; }
      setTyping(false); removeTyping();
      throw new Error('HTTP ' + res.status + (detail ? ' · ' + detail : ''));
    }

    var body = res.body;
    if (!body || !body.getReader) {
      var txt = await res.text();
      try {
        var obj = JSON.parse(txt);
        var whole = obj.choices && obj.choices[0] && obj.choices[0].message && obj.choices[0].message.content;
        if (whole) pushDelta(whole);
      } catch (e3) { handleSSE(txt); }
      streamDone = true; pump();
      return;
    }

    var reader = body.getReader();
    var dec = new TextDecoder('utf-8');
    var buf = '', raw = '', done = false;

    while (!done) {
      var step = await reader.read();
      if (step.done) break;
      var piece = dec.decode(step.value, { stream: true });
      raw += piece;
      buf = (buf + piece).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      var idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        var block = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (handleSSE(block)) { done = true; break; }
      }
    }
    if (!done && buf.trim()) handleSSE(buf);
    try { reader.cancel(); } catch (e4) { /* noop */ }

    if (!streamEl && raw) {
      try {
        var o = JSON.parse(raw.trim());
        var c = o.choices && o.choices[0] && ((o.choices[0].message && o.choices[0].message.content) || (o.choices[0].delta && o.choices[0].delta.content));
        if (typeof c === 'string' && c) pushDelta(c);
      } catch (e5) { /* noop */ }
    }

    streamDone = true;
    pump();
  }

  async function sendText(text, noPush, noHit) {
    if (sending) return;
    text = String(text || '').trim();
    if (!text) return;

    if (!noPush) {
      history.push({ role: 'user', content: text, ts: Date.now() });
      saveHistory();
      if (!noHit) arcHit(text);
    }
    sending = true;
    setSendUI(true);
    renderChat();
    scrollToBottom(true);
    renderHome();

    try { await runStream(); }
    catch (err) { finishStream(err && err.message ? err.message : String(err)); }
  }

  function sendMessage() {
    var t = msgInput.value.trim();
    if (!t || sending) return;
    msgInput.value = '';
    autoGrow();
    sendText(t);
  }

  function sendSticker(key) {
    closeStickers();
    if (sending) { toast('TA 正在回你上一句'); return; }
    var d = stickerDef(key) || STICKERS[0];
    history.push({ role: 'user', sticker: d.key, content: '[贴纸] ' + d.name, ts: Date.now() });
    saveHistory();
    renderChat();
    renderHome();
    scrollToBottom(true);
    sendText('[贴纸] ' + d.name, true);
  }

  /* ================= 输入区 ================= */
  function autoGrow() {
    msgInput.style.height = 'auto';
    var h = Math.max(44, Math.min(128, msgInput.scrollHeight));
    msgInput.style.height = h + 'px';
    sendBtn.disabled = sending || !msgInput.value.trim();
  }

  var composing = false;
  msgInput.addEventListener('compositionstart', function () { composing = true; });
  msgInput.addEventListener('compositionend', function () { composing = false; autoGrow(); });
  msgInput.addEventListener('input', autoGrow);
  msgInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (composing || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    sendMessage();
  });
  sendBtn.addEventListener('click', sendMessage);

  /* 窄屏把贴纸键移到工具行，给输入框留出宽度 */
  function placeSticker() {
    var btn = $('openStickers');
    var bar = document.querySelector('.composer-bar');
    var chips = document.querySelector('.chips-row');
    var scroll = $('chipsRow');
    if (!btn || !bar || !chips) return;
    if (window.innerWidth >= 768) {
      if (btn.parentNode !== bar) bar.insertBefore(btn, bar.firstChild);
    } else if (btn.parentNode !== chips) {
      chips.insertBefore(btn, scroll || null);
    }
  }
  placeSticker();
  window.addEventListener('resize', placeSticker);

  chatScroll.addEventListener('scroll', function () {
    stickyBottom = isNearBottom();
    updateJump();
  }, { passive: true });

  jumpBtn.addEventListener('click', function () { scrollToBottom(true); jumpBtn.classList.remove('show'); });

  chatScroll.addEventListener('click', function (e) {
    if (e.target.closest('.bubble, button, a')) return;
    var rect = chatScroll.getBoundingClientRect();
    var x = e.clientX - rect.left + chatScroll.scrollLeft;
    var y = e.clientY - rect.top + chatScroll.scrollTop;
    ['r1', 'r2'].forEach(function (c) {
      var ring = document.createElement('span');
      ring.className = 'ripple ' + c;
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      chatScroll.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 900);
    });
  });

  msgList.addEventListener('click', function (e) {
    var btn = e.target.closest('.love-btn');
    if (!btn) return;
    e.preventDefault();
    var row = btn.closest('.msg');
    if (row) toggleLove(Number(row.dataset.index));
  });

  msgList.addEventListener('dblclick', function (e) {
    if (e.target.closest('button')) return;
    var bubble = e.target.closest('.bubble');
    if (!bubble) return;
    var row = bubble.closest('.msg');
    if (!row || row.classList.contains('user')) return;
    var i = Number(row.dataset.index);
    if (!isNaN(i)) toggleLove(i);
  });

  /* 软键盘：布局视口没缩时锁到 visualViewport */
  var vv = window.visualViewport || null;
  function setAppHeight(px) {
    var root = document.documentElement;
    if (px == null) { root.style.removeProperty('--app-h'); root.classList.remove('kb-open'); }
    else { root.style.setProperty('--app-h', Math.round(px) + 'px'); root.classList.add('kb-open'); }
  }
  function syncViewport() {
    if (!vv) return;
    var gap = window.innerHeight - vv.height;
    if (gap > 120) setAppHeight(vv.height);
    else if (gap < 40) setAppHeight(null);
  }
  if (vv) { vv.addEventListener('resize', syncViewport); vv.addEventListener('scroll', syncViewport); }
  window.addEventListener('orientationchange', function () { setAppHeight(null); });
  msgInput.addEventListener('focus', function () { setTimeout(syncViewport, 280); });
  msgInput.addEventListener('blur', function () { setTimeout(syncViewport, 120); });

  /* ================= 搜索 ================= */
  function setSearch(open) {
    searchOpen = open;
    var bar = $('searchBar');
    if (!bar) return;
    bar.hidden = !open;
    if (open) setTimeout(function () { $('searchInput').focus(); }, 60);
    else {
      searchTerm = '';
      $('searchInput').value = '';
      $('searchCount').textContent = '';
      renderChat();
    }
  }
  function runSearch(v) {
    searchTerm = String(v || '').trim();
    renderChat();
    var n = 0;
    if (searchTerm) {
      var low = searchTerm.toLowerCase();
      history.forEach(function (m) { if (String(m.content).toLowerCase().indexOf(low) >= 0) n++; });
    }
    $('searchCount').textContent = searchTerm ? (n ? n + ' 条' : '没有') : '';
  }
  if ($('chatSearch')) $('chatSearch').addEventListener('click', function () { setSearch(!searchOpen); });
  $('searchClose').addEventListener('click', function () { setSearch(false); });
  $('searchInput').addEventListener('input', function () { runSearch(this.value); });
  $('searchInput').addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); setSearch(false); } });

  /* ================= 贴纸 ================= */
  var stickerTray = null;
  function buildTray() {
    if (stickerTray) return stickerTray;
    stickerTray = document.createElement('div');
    stickerTray.className = 'dice-pop';
    stickerTray.id = 'stickerTray';
    stickerTray.innerHTML = '<p class="dice-kicker">STICKERS · 贴一张</p><div class="picker-grid" id="stickerGrid"></div>';
    document.body.appendChild(stickerTray);
    var grid = stickerTray.querySelector('#stickerGrid');
    grid.style.gridTemplateColumns = 'repeat(3,1fr)';
    grid.innerHTML = STICKERS.map(function (s) {
      return '<button class="pl-row" data-sticker="' + s.key + '" type="button" style="flex-direction:column;gap:4px;padding:8px;border-radius:16px">' +
        stickerSvg(s.key, 40) + '<span style="font-size:11px;color:var(--ink-sub)">' + s.name + '</span></button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sticker]');
      if (b) sendSticker(b.getAttribute('data-sticker'));
    });
    return stickerTray;
  }
  function openStickers() { buildTray().classList.add('show'); }
  function closeStickers() { if (stickerTray) stickerTray.classList.remove('show'); }
  $('openStickers').addEventListener('click', function (e) {
    e.stopPropagation();
    if (stickerTray && stickerTray.classList.contains('show')) closeStickers();
    else openStickers();
  });
  document.addEventListener('click', function (e) {
    if (stickerTray && stickerTray.classList.contains('show') && !stickerTray.contains(e.target) && !e.target.closest('#openStickers')) closeStickers();
    var dp = $('dicePop');
    if (dp && dp.classList.contains('show') && !dp.contains(e.target) && !e.target.closest('#openDice')) closeDice();
  });

  /* ================= 快捷短语 ================= */
  function savePhrases() { write('mizu.quickPhrases', phrases); }
  function renderChips() {
    var box = $('chipsRow');
    if (!box) return;
    box.innerHTML = phrases.map(function (p, i) {
      return '<button class="qchip" data-chip="' + i + '" type="button">' + esc(p) + '</button>';
    }).join('');
  }
  var chipPress = null, chipLong = false;
  $('chipsRow').addEventListener('pointerdown', function (e) {
    var chip = e.target.closest('.qchip');
    if (!chip) return;
    chipLong = false;
    chipPress = setTimeout(function () {
      chipLong = true;
      editChip(Number(chip.getAttribute('data-chip')), chip);
    }, 600);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
    $('chipsRow').addEventListener(ev, function () { clearTimeout(chipPress); });
  });
  $('chipsRow').addEventListener('click', function (e) {
    if (chipLong) { chipLong = false; return; }
    var chip = e.target.closest('.qchip');
    if (!chip) return;
    var p = phrases[Number(chip.getAttribute('data-chip'))];
    if (!p) return;
    msgInput.value = p;
    autoGrow();
    sendMessage();
  });
  function editChip(idx, btn) {
    var wrap = document.createElement('span');
    wrap.className = 'qchip is-editing';
    wrap.innerHTML = '<input type="text" maxlength="24" value="' + esc(phrases[idx] || '') + '">';
    btn.parentNode.replaceChild(wrap, btn);
    var inp = wrap.querySelector('input');
    inp.focus(); inp.select();
    function commit(save) {
      var v = inp.value.trim();
      if (save && v) { phrases[idx] = v; savePhrases(); }
      renderChips();
    }
    inp.addEventListener('blur', function () { commit(true); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(true); }
      if (e.key === 'Escape') commit(false);
    });
  }

  /* ================= 骰子 ================= */
  var diceIdx = 0;
  function openDice() {
    diceIdx = Math.floor(Math.random() * TOPICS.length);
    $('diceQ').textContent = TOPICS[diceIdx];
    $('dicePop').classList.add('show');
  }
  function closeDice() { $('dicePop').classList.remove('show'); }
  $('openDice').addEventListener('click', function (e) {
    e.stopPropagation();
    if ($('dicePop').classList.contains('show')) closeDice(); else openDice();
  });
  $('diceAgain').addEventListener('click', function () {
    diceIdx = (diceIdx + 1 + Math.floor(Math.random() * (TOPICS.length - 1))) % TOPICS.length;
    $('diceQ').textContent = TOPICS[diceIdx];
  });
  $('diceAsk').addEventListener('click', function () {
    var t = TOPICS[diceIdx];
    closeDice();
    msgInput.value = t;
    autoGrow();
    if (currentView !== 'chat') switchView('chat');
    setTimeout(sendMessage, 140);
  });

  /* ================= 模型 ================= */
  var MODEL_PRESETS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'deepseek-chat', 'qwen-plus'];
  function openModel() {
    var list = MODEL_PRESETS.slice();
    if (config.model && list.indexOf(config.model) < 0) list.unshift(config.model);
    openSheet('<div class="panel-head"><h2 class="panel-title">切换模型</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div class="pl-list" id="modelList">' + list.map(function (m) {
        return '<button class="pl-row" data-model="' + esc(m) + '" type="button"><span class="pl-meta"><span class="pl-title" style="font-family:var(--mono);font-size:13px">' + esc(m) + '</span></span>' +
          (m === config.model ? '<span style="font-size:11px;color:var(--accent-deep)">当前</span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<label class="field" style="margin:0"><span class="field-label">或自己填一个</span><input id="modelCustom" type="text" spellcheck="false" placeholder="model-name"></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="modelSave" type="button">用这个模型</button></div>',
      function (ov, close) {
        ov.addEventListener('click', function (e) {
          var b = e.target.closest('[data-model]');
          if (!b) return;
          setModel(b.getAttribute('data-model'));
          close();
        });
        ov.querySelector('#modelSave').addEventListener('click', function () {
          var v = ov.querySelector('#modelCustom').value.trim();
          if (!v) { toast('还没填模型名'); return; }
          setModel(v);
          close();
        });
      });
  }
  function setModel(m) {
    config.model = m;
    saveConfig();
    var el = $('modelName');
    if (el) el.textContent = m;
    toast('切换到 ' + m);
  }
  $('modelPill').addEventListener('click', openModel);

  /* ================= 通用浮层 ================= */
  var X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function openSheet(html, onReady) {
    var ov = document.createElement('div');
    ov.className = 'overlay is-open';
    ov.innerHTML = '<div class="panel" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(ov);
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    function close() {
      document.removeEventListener('keydown', onKey, true);
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    document.addEventListener('keydown', onKey, true);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    var b = ov.querySelector('[data-close]');
    if (b) b.addEventListener('click', close);
    if (onReady) onReady(ov, close);
    return close;
  }

  function openOverlay(el) { el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); }
  function closeOverlay(el) { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2000);
  }

  function compress(file, cb, maxSide, q) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = maxSide || 1200, quality = q || 0.8;
        var sc = Math.min(1, max / Math.max(img.width, img.height));
        var cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(img.width * sc));
        cv.height = Math.max(1, Math.round(img.height * sc));
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL('image/jpeg', quality));
      };
      img.onerror = function () { cb(null); };
      img.src = fr.result;
    };
    fr.onerror = function () { cb(null); };
    fr.readAsDataURL(file);
  }

  function pickImage(cb, opts) {
    var mem = memories.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 12);
    openSheet('<div class="panel-head"><h2 class="panel-title">选一张</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      (mem.length ? '<div class="picker-grid">' + mem.map(function (m, i) {
        return '<button class="picker-cell" data-pick="' + i + '" type="button"><img src="' + esc(m.img) + '" alt="" loading="lazy"></button>';
      }).join('') + '</div>' : '<p class="empty-tip">相册还是空的，先上传一张。</p>') +
      '<label class="field" style="margin:16px 0 0"><span class="field-label">或上传一张</span><input id="pickFile" type="file" accept="image/*" style="padding:8px"></label>',
      function (ov, close) {
        ov.addEventListener('click', function (e) {
          var c = e.target.closest('[data-pick]');
          if (!c) return;
          cb(mem[Number(c.getAttribute('data-pick'))].img);
          close();
        });
        ov.querySelector('#pickFile').addEventListener('change', function () {
          var f = this.files && this.files[0];
          if (!f) return;
          compress(f, function (data) {
            if (!data) { toast('这张图读不出来'); return; }
            cb(data);
            close();
          }, (opts && opts.max) || 1200, (opts && opts.q) || 0.8);
        });
      });
  }

  /* ================= 心情浮层 ================= */
  function openMoodSheet() {
    openSheet('<div class="panel-head"><h2 class="panel-title">今天的心情</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div class="mood-row" id="moodRow"></div><p class="mood-word" id="moodWord" style="margin-top:16px"></p>',
      function (ov, close) {
        renderMoodCard();
        var today = moodOfDay(isoOf());
        var w = ov.querySelector('#moodWord');
        if (w) w.innerHTML = today ? '今天 <b>' + (moodDef(today.mood) || {}).name + '</b>' : '今天还没有打卡';
        ov.addEventListener('click', function (e) {
          var b = e.target.closest('.mood-btn');
          if (!b) return;
          setMood(b.getAttribute('data-mood'));
          setTimeout(close, 260);
        });
      });
  }

  /* ================= 背景 ================= */
  function openBg() {
    openSheet('<div class="panel-head"><h2 class="panel-title">手机壁纸</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div id="bgPreview" style="height:160px;border-radius:16px;background:var(--field);background-size:cover;background-position:center;border:1px solid var(--field-line)"></div>' +
      '<div class="panel-actions"><button class="btn-primary" id="bgPick" type="button">从相册选 / 上传</button><button class="btn-ghost" id="bgClear" type="button">恢复晨雾默认</button></div>',
      function (ov) {
        var pre = ov.querySelector('#bgPreview');
        function paint() {
          var u = (config.wallpaper || '').trim();
          pre.style.backgroundImage = u ? 'url("' + u.replace(/"/g, '%22') + '")' : '';
        }
        paint();
        ov.querySelector('#bgPick').addEventListener('click', function () {
          pickImage(function (url) {
            config.wallpaper = url;
            saveConfig();
            applyWallpaper();
            paint();
            toast('背景换好了');
          }, { max: 1600, q: 0.8 });
        });
        ov.querySelector('#bgClear').addEventListener('click', function () {
          config.wallpaper = '';
          saveConfig();
          applyWallpaper();
          paint();
          toast('回到晨雾默认背景');
        });
      });
  }


  /* ================= 歌单 ================= */
  function savePlaylist() { write('mizu.playlist', playlist); }
  function openPlaylist() {
    openSheet('<div class="panel-head"><h2 class="panel-title">共听歌单</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<div class="pl-list" id="plList"></div>' +
      '<label class="field"><span class="field-label">歌名</span><input id="plTitle" type="text" maxlength="40" placeholder="例如：Fog Lake"></label>' +
      '<label class="field"><span class="field-label">歌手</span><input id="plArtist" type="text" maxlength="30" placeholder="小沢 & 你"></label>' +
      '<label class="field"><span class="field-label">封面（可留空）</span><div class="io-row"><input id="plCover" type="text" spellcheck="false" placeholder="https://… 或从相册选"><button class="btn-ghost" id="plPick" type="button">相册</button></div></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="plAdd" type="button">加进歌单</button></div>',
      function (ov) {
        function paint() {
          var box = ov.querySelector('#plList');
          if (!playlist.length) { box.innerHTML = '<p class="empty-tip">还没有歌。加一首，首页就会有一台小播放器。</p>'; return; }
          box.innerHTML = playlist.map(function (t, i) {
            return '<div class="pl-row"><span class="pl-idx num">' + pad2(i + 1) + '</span><span class="pl-meta"><span class="pl-title">' + esc(t.title) +
              '</span><span class="pl-artist">' + esc(t.artist || '—') + '</span></span>' +
              '<button class="chip" data-del="' + i + '" type="button">删掉</button></div>';
          }).join('');
        }
        paint();
        ov.addEventListener('click', function (e) {
          var d = e.target.closest('[data-del]');
          if (!d) return;
          playlist.splice(Number(d.getAttribute('data-del')), 1);
          if (playerIdx >= playlist.length) playerIdx = 0;
          savePlaylist(); paint(); renderPlayer();
        });
        ov.querySelector('#plPick').addEventListener('click', function () {
          pickImage(function (u) { ov.querySelector('#plCover').value = u; });
        });
        ov.querySelector('#plAdd').addEventListener('click', function () {
          var t = ov.querySelector('#plTitle').value.trim();
          if (!t) { toast('还没写歌名'); return; }
          playlist.push({ title: t, artist: ov.querySelector('#plArtist').value.trim() || '小沢 & 你', url: '', cover: ov.querySelector('#plCover').value.trim() });
          savePlaylist();
          if (playlist.length === 1) { playerIdx = 0; playerPos = 0; }
          ov.querySelector('#plTitle').value = '';
          ov.querySelector('#plCover').value = '';
          paint(); renderPlayer();
          toast('加进歌单了');
        });
      });
  }


  /* ================= 相册 ================= */
  function saveMemories() {
    for (var tries = 0; tries < 5; tries++) {
      try { localStorage.setItem('mizu.memories', JSON.stringify(memories)); return true; }
      catch (e) {
        if (memories.length <= 1) break;
        memories.shift();
        toast('湖面的容量满了 · 最旧的一张先沉下去了');
      }
    }
    toast('湖面的容量满了，先让一些碎片沉下去吧');
    return false;
  }
  function renderAlbum() {
    var grid = $('albumGrid');
    if (!grid) return;
    var items = memories.slice().sort(function (a, b) { return b.ts - a.ts; });
    var html = '';
    if (!items.length) {
      html += '<button class="album-add is-wide" data-add type="button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg><span>放进一张照片</span></button>';
      html += '<div class="album-empty">还没有照片。等你把某一天的湖面放进来。</div>';
    } else {
      html += '<button class="album-add" data-add type="button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg><span>放进一张照片</span></button>';
      html += items.map(function (m, i) {
        return '<figure class="album-card" data-idx="' + i + '">' +
          '<div class="album-photo"><img src="' + esc(m.img) + '" alt="" loading="lazy"></div>' +
          '<button class="album-del" data-del="' + i + '" type="button" aria-label="删除这张照片"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M10 7V5h4v2M7.5 7l.9 12h7.2l.9-12"/></svg></button>' +
          '<figcaption class="album-meta"><span class="album-cap">' + esc(m.caption || ' ') + '</span><span class="album-date">' + fmtPlain(new Date(m.ts)) + '</span></figcaption>' +
          '</figure>';
      }).join('');
    }
    grid.innerHTML = html;
  }
  function openAddMemory() {
    openSheet('<div class="panel-head"><h2 class="panel-title">放进一张照片</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
      '<label class="field"><span class="field-label">本地图片 · 会自动压缩</span><input id="memFile" type="file" accept="image/*" style="padding:8px"></label>' +
      '<label class="field"><span class="field-label">或粘贴图片链接</span><input id="memUrl" type="url" spellcheck="false" placeholder="https://…"></label>' +
      '<label class="field"><span class="field-label">配一句话</span><input id="memCap" type="text" maxlength="40" placeholder="那天的风很大"></label>' +
      '<div class="panel-actions"><button class="btn-primary" id="memSave" type="button">收进相册</button></div>',
      function (ov, close) {
        var pending = null;
        ov.querySelector('#memFile').addEventListener('change', function () {
          var f = this.files && this.files[0];
          if (!f) return;
          compress(f, function (d) {
            if (!d) { toast('这张图读不出来'); return; }
            pending = d;
            toast('图片准备好了');
          }, 1200, 0.8);
        });
        ov.querySelector('#memSave').addEventListener('click', function () {
          var img = pending || ov.querySelector('#memUrl').value.trim();
          if (!img) { toast('先选一张图或粘一个链接'); return; }
          if (!pending && !/^https?:\/\//i.test(img)) { toast('链接要以 http(s) 开头'); return; }
          memories.push({ img: img, caption: ov.querySelector('#memCap').value.trim(), ts: Date.now() });
          saveMemories();
          renderAlbum();
          renderJournal();
          close();
          toast('收进相册了');
        });
      });
  }
  $('addMemory').addEventListener('click', openAddMemory);
  $('albumGrid').addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) { openAddMemory(); return; }
    var del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      var list = memories.slice().sort(function (a, b) { return b.ts - a.ts; });
      var t = list[Number(del.getAttribute('data-del'))];
      if (!t) return;
      memories = memories.filter(function (m) { return m.ts !== t.ts; });
      saveMemories(); renderAlbum(); renderJournal();
      toast('删掉了这一张');
      return;
    }
    var card = e.target.closest('.album-card');
    if (card) {
      var arr = memories.slice().sort(function (a, b) { return b.ts - a.ts; });
      var m = arr[Number(card.getAttribute('data-idx'))];
      if (!m) return;
      $('lbImg').src = m.img;
      $('lbCap').textContent = m.caption || '';
      $('lbDate').textContent = fmtPlain(new Date(m.ts));
      $('lightbox').classList.add('is-open');
      $('lightbox').setAttribute('aria-hidden', 'false');
    }
  });
  (function () {
    var t = null;
    $('albumGrid').addEventListener('pointerdown', function (e) {
      var card = e.target.closest('.album-card');
      if (!card) return;
      t = setTimeout(function () { card.classList.add('is-reveal'); }, 500);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      $('albumGrid').addEventListener(ev, function () { clearTimeout(t); });
    });
  })();
  $('lightbox').addEventListener('click', function () {
    this.classList.remove('is-open');
    this.setAttribute('aria-hidden', 'true');
  });

  /* ================= 手帐 ================= */
  var journalISO = isoOf();
  var journalStyle = 'polaroid';
  var journalExpanded = false;

  function renderJournal() {
    var page = $('journalPage');
    if (!page) return;
    var d = parseISO(journalISO) || new Date();
    var msgs = history.filter(function (m) { return sameDay(m.ts, journalISO); });
    var photo = null;
    memories.forEach(function (m) { if (sameDay(m.ts, journalISO)) photo = m; });
    var note = notes[journalISO] || '';
    var w = weather[journalISO] || '';
    var shown = journalExpanded ? msgs : msgs.slice(0, 3);

    var html = '<div class="j-head"><div class="j-num num">' + d.getDate() + '</div>' +
      '<div class="j-head-side"><p class="j-ym">' + d.getFullYear() + ' · ' + pad2(d.getMonth() + 1) + '月</p>' +
      '<p class="j-week">星期' + WEEK[d.getDay()] + '</p></div></div>';
    html += '<div class="j-line"></div>';
    html += '<label class="j-weather"><span>WEATHER · 天气</span><input id="jWeather" type="text" maxlength="20" placeholder="晴，有雾，风很轻…" value="' + esc(w) + '"></label>';

    html += '<div class="j-sec"><p class="j-sec-title">PHOTO · 当天照片</p>';
    if (photo) {
      html += '<div class="j-photo' + (journalStyle === 'polaroid' ? ' is-polaroid' : '') + '"><img src="' + esc(photo.img) + '" alt="">' +
        (journalStyle === 'polaroid' ? '<p class="j-frame-cap">' + esc(photo.caption || fmtPlain(new Date(photo.ts))) + '</p>' : '') + '</div>';
    } else {
      html += '<div class="j-nophoto">这一天还没有照片 · 去「相册」里放一张</div>';
    }
    html += '</div>';

    html += '<div class="j-sec"><p class="j-sec-title">LINES · 这天的原话</p>';
    if (!msgs.length) html += '<p class="empty-tip">这一天还没有说过话。</p>';
    else {
      shown.forEach(function (m) {
        if (m.sticker) return;
        html += '<div class="j-quote"><p class="j-who">' + (m.role === 'user' ? '你' : '小沢') + ' · ' + hhmm(m.ts) + '</p><div>' + esc(m.content) + '</div></div>';
      });
      if (msgs.length > 3) html += '<button class="j-more" id="jMore" type="button">' + (journalExpanded ? '收起' : '展开全部 ' + msgs.length + ' 条') + '</button>';
    }
    html += '</div>';

    html += '<div class="j-sec"><p class="j-sec-title">NOTE · 批注</p><textarea class="j-note" id="jNote" maxlength="500" placeholder="写给这一天的一句话…">' + esc(note) + '</textarea></div>';

    page.innerHTML = html;
    page.className = 'journal-page' + (journalStyle === 'film' ? ' is-film' : '');

    $('jWeather').addEventListener('input', function () {
      weather[journalISO] = this.value;
      write('mizu.weather', weather);
    });
    $('jNote').addEventListener('input', function () {
      notes[journalISO] = this.value;
      write('mizu.notes', notes);
    });
    var more = $('jMore');
    if (more) more.addEventListener('click', function () { journalExpanded = !journalExpanded; renderJournal(); });
  }

  function setJournalDate(iso) {
    journalISO = iso;
    journalExpanded = false;
    var inp = $('journalDate');
    if (inp) inp.value = iso;
    renderJournal();
  }
  $('journalDate').value = journalISO;
  $('journalDate').addEventListener('change', function () { setJournalDate(this.value || isoOf()); });
  $('jPrev').addEventListener('click', function () {
    var d = parseISO(journalISO) || new Date();
    d.setDate(d.getDate() - 1);
    setJournalDate(isoOf(d));
  });
  $('jNext').addEventListener('click', function () {
    var d = parseISO(journalISO) || new Date();
    d.setDate(d.getDate() + 1);
    setJournalDate(isoOf(d));
  });
  forEach(document.querySelectorAll('#journalStyle .seg-btn'), function (b) {
    b.addEventListener('click', function () {
      journalStyle = b.getAttribute('data-style');
      forEach(document.querySelectorAll('#journalStyle .seg-btn'), function (x) { x.classList.toggle('is-on', x === b); });
      renderJournal();
    });
  });

  /* ================= 信件 ================= */
  function saveLetters() { write('mizu.letters', letters); }
  function renderLetters() {
    var box = $('letterList');
    if (!box) return;
    var list = letters.slice().sort(function (a, b) { return b.ts - a.ts; });
    if (!list.length) { box.innerHTML = '<p class="empty-tip">还没有信。第一封可以只有一句「今天有雾」。</p>'; return; }
    box.innerHTML = list.map(function (l) {
      var ai = l.from === 'ai';
      return '<article class="letter-item" data-ts="' + l.ts + '">' +
        '<header class="letter-head"><div class="letter-who"><p class="letter-from">' + (ai ? '小沢 写给你' : '你 写给 小沢') + '</p>' +
        '<p class="letter-meta">' + fmtPlain(new Date(l.ts)) + ' · ' + (ai ? (l.read ? '已拆开' : '未拆') : '已封存') + '</p></div>' +
        '<span class="letter-seal" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        (ai ? '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>' : '<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16z"/>') +
        '</svg></span></header>' +
        '<div class="letter-body"><p class="letter-text">' + esc(l.content) + '</p>' +
        (ai ? '' : '<div class="letter-foot"><button class="chip" data-reply="' + l.ts + '" type="button">请 TA 回信</button></div>') +
        '</div></article>';
    }).join('');
  }
  $('letterNew').addEventListener('click', function () {
    $('letterCompose').hidden = false;
    $('letterText').value = '';
    $('letterText').focus();
  });
  $('letterCancel').addEventListener('click', function () { $('letterCompose').hidden = true; });
  $('letterSeal').addEventListener('click', function () {
    var t = $('letterText').value.trim();
    if (!t) { toast('还没写呢'); return; }
    letters.push({ from: 'user', content: t, ts: Date.now(), sealed: true, read: true });
    saveLetters();
    $('letterText').value = '';
    $('letterCompose').hidden = true;
    renderLetters();
    toast('信已封存');
  });
  $('letterList').addEventListener('click', function (e) {
    var r = e.target.closest('[data-reply]');
    if (r) { e.stopPropagation(); askReply(Number(r.getAttribute('data-reply')), r); return; }
    var item = e.target.closest('.letter-item');
    if (!item) return;
    var ts = Number(item.getAttribute('data-ts'));
    if (item.classList.toggle('is-open')) {
      letters.forEach(function (l) {
        if (l.ts === ts && l.from === 'ai' && !l.read) {
          l.read = true;
          saveLetters();
          var meta = item.querySelector('.letter-meta');
          if (meta) meta.textContent = fmtPlain(new Date(ts)) + ' · 已拆开';
        }
      });
    }
  });
  function askReply(ts, btn) {
    var letter = null;
    letters.forEach(function (l) { if (l.ts === ts) letter = l; });
    if (!letter) return;
    if (!config.endpoint) { toast('先在设置里填 API 地址'); return; }
    btn.disabled = true;
    btn.textContent = '正在写…';
    var h = buildHeaders();
    h['Accept'] = 'application/json';
    fetch(normalizeEndpoint(config.endpoint), {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        model: config.model || DEF_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: (config.system || DEFAULT_SYSTEM) + '\n\n现在请以恋人的口吻，给用户写一封 300 字以内的回信，只输出信的正文，不用标题和列表。' },
          { role: 'user', content: '这是我写给你的信：\n' + letter.content }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      var c = d && d.choices && d.choices[0];
      var text = c && ((c.message && c.message.content) || c.text);
      if (!text) throw new Error('没有收到回信内容');
      letters.push({ from: 'ai', content: String(text).trim(), ts: Date.now(), sealed: true, read: false });
      saveLetters();
      renderLetters();
      toast('TA 的回信到了');
    }).catch(function (e) {
      btn.disabled = false;
      btn.textContent = '请 TA 回信';
      toast('回信没送到：' + (e && e.message ? e.message : '网络问题'));
    });
  }

  /* ================= 星河 ================= */
  var gCanvas, gCtx, gStars = [], gRot = 0, gRAF = null, gW = 0, gH = 0, gDust = [], gTimer = null;

  function galaxySize() {
    gCanvas = $('galaxyCanvas');
    if (!gCanvas) return false;
    var w = gCanvas.parentNode.clientWidth || 320;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    gW = w; gH = 420;
    gCanvas.width = Math.round(w * dpr);
    gCanvas.height = Math.round(gH * dpr);
    gCanvas.style.height = gH + 'px';
    gCtx = gCanvas.getContext('2d');
    gCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function galaxyLayout() {
    var all = lovedMessages();
    var total = all.length;
    var msgs = total > 150 ? all.slice(-150) : all;
    var n = msgs.length;
    var base = Math.min(gW, gH) * 0.46;
    var maxR = Math.min(gW / 2 - 26, gH / 2 - 26);
    gStars = msgs.map(function (m, i) {
      var t = n <= 1 ? 0 : i / (n - 1);
      return {
        m: m,
        angle: i * 2.39996 + t * 1.1,
        radius: n === 1 ? 0 : Math.min(34 + Math.sqrt(t) * base, maxR),
        size: i === n - 1 ? 5 : 3.1,
        x: 0, y: 0
      };
    });
    gDust = [];
    for (var k = 0; k < 90; k++) {
      var rr = Math.pow(k / 90, 0.7);
      gDust.push({ a: k * 2.39996 + rr * 2.4, r: 24 + rr * base * 1.1, s: 0.7 + (k % 5) * 0.22, alpha: 0.1 + (k % 7) * 0.018 });
    }
    return total;
  }

  function galaxyDraw(t) {
    if (!gCtx) return;
    var ctx = gCtx, w = gW, h = gH;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    var cs = getComputedStyle(document.documentElement);
    var accent = (cs.getPropertyValue('--accent-deep') || '#4FB8D4').trim();
    var faint = (cs.getPropertyValue('--ink-sub') || '#6B8A96').trim();

    for (var d = 0; d < gDust.length; d++) {
      var du = gDust[d], da = du.a + gRot * 0.8;
      ctx.globalAlpha = du.alpha;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(da) * du.r, cy + Math.sin(da) * du.r * 0.58, du.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (var i = 0; i < gStars.length; i++) {
      var s = gStars[i];
      var a = s.angle + gRot;
      var x = cx + Math.cos(a) * s.radius;
      var y = cy + Math.sin(a) * s.radius * 0.58;
      s.x = x; s.y = y;
      var latest = (Date.now() - s.m.ts) < 86400000;
      if (latest) {
        var pulse = REDUCE ? 0.5 : 0.5 + 0.5 * Math.sin((t || 0) / 620);
        var g = ctx.createRadialGradient(x, y, 0, x, y, 22 + pulse * 10);
        g.addColorStop(0, 'rgba(127,212,232,' + (0.5 + pulse * 0.3).toFixed(2) + ')');
        g.addColorStop(0.5, 'rgba(127,212,232,0.18)');
        g.addColorStop(1, 'rgba(127,212,232,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 22 + pulse * 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, y, latest ? s.size + 1 : s.size, 0, Math.PI * 2);
      ctx.fillStyle = latest ? accent : faint;
      ctx.globalAlpha = latest ? 1 : 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function galaxyTick(t) {
    if (currentView !== 'archive' || arcPane !== 'stars') return;
    if (!REDUCE) gRot += 0.00045;
    galaxyDraw(t);
    if (!REDUCE) gRAF = requestAnimationFrame(galaxyTick);
  }

  function renderGalaxy() {
    if (!galaxySize()) return;
    var n = galaxyLayout();
    var title = $('galaxyTitle');
    if (title) title.textContent = n + ' 颗记忆星 · OUR GALAXY';
    var empty = $('galaxyEmpty');
    if (empty) empty.style.display = n ? 'none' : 'grid';
    galaxyDraw(0);
  }
  function startGalaxy() {
    renderGalaxy();
    if (gRAF) cancelAnimationFrame(gRAF);
    gRAF = null;
    if (!REDUCE) gRAF = requestAnimationFrame(galaxyTick);
  }
  function stopGalaxy() {
    if (gRAF) cancelAnimationFrame(gRAF);
    gRAF = null;
  }
  if ($('galaxyCanvas')) {
    function hitStar(e) {
      var rect = $('galaxyCanvas').getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var best = null, bestD = 26 * 26;
      gStars.forEach(function (s) {
        var d = (s.x - x) * (s.x - x) + (s.y - y) * (s.y - y);
        if (d < bestD) { bestD = d; best = s; }
      });
      return best;
    }
    $('galaxyCanvas').addEventListener('click', function (e) {
      var best = hitStar(e);
      if (!best) return;
      var pop = $('galaxyPop');
      pop.innerHTML = '<p>' + esc(best.m.content) + '</p><span>' + fmtPlain(new Date(best.m.ts)) + ' · ' + hhmm(best.m.ts) + '　双击发给 TA</span>';
      pop.classList.add('show');
      clearTimeout(gTimer);
      gTimer = setTimeout(function () { pop.classList.remove('show'); }, 6000);
    });
    $('galaxyCanvas').addEventListener('dblclick', function (e) {
      var best = hitStar(e);
      if (!best) return;
      switchView('chat');
      sendText('还记得你说：' + best.m.content);
    });
    window.addEventListener('resize', function () { if (currentView === 'archive' && arcPane === 'stars') startGalaxy(); });
  }

  /* ================= 戳一戳 ================= */
  var lastPoke = 0;
  function poke() {
    var now = Date.now();
    if (now - lastPoke < 30000) { toast('刚刚戳过了，让 TA 缓一下'); return; }
    lastPoke = now;
    var av = document.querySelector('.ta-ava');
    if (av) { av.classList.remove('is-poke'); void av.offsetWidth; av.classList.add('is-poke'); }
    var wave = document.createElement('div');
    wave.className = 'poke-wave';
    document.body.appendChild(wave);
    setTimeout(function () { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 760);
    if (sending) return;
    if (currentView !== 'chat') switchView('chat');
    sendText('你戳了戳小沢');
  }

  /* ================= 资料卡 / 关于 ================= */
  function openProfile() {
    $('profileDays').textContent = String(daysTogether());
    $('profileSince').textContent = fmtPlain(relationshipStart());
    $('profileSaid').textContent = history.length + ' 句';
    $('profileWhisper').textContent = whisperOf(new Date());
    renderMoodChart();
    var loved = lovedMessages().slice(-5).reverse();
    $('lovedList').innerHTML = loved.length ? loved.map(function (m) {
      return '<li class="loved-item"><span class="loved-heart">' + HEART_SVG + '</span><span class="loved-text">' + esc(m.content) + '</span></li>';
    }).join('') : '<li class="loved-empty">还没有收藏的话 —— 在聊天里双击 TA 的气泡试试</li>';
    openOverlay(profileOverlay);
  }
  if ($('openProfile')) $('openProfile').addEventListener('click', openProfile);

  function openAbout() {
    var rows = [
      ['在一起', daysTogether() + ' 天'],
      ['说过的话', history.length + ' 句'],
      ['收藏', lovedMessages().length + ' 颗'],
      ['照片', memories.length + ' 张'],
      ['信件', letters.length + ' 封'],
      ['心情', moods.length + ' 次']
    ];
    $('aboutStats').innerHTML = rows.map(function (r) {
      return '<div style="padding:8px 16px;border-radius:16px;background:var(--field);border:1px solid var(--field-line)">' +
        '<p style="font-size:11px;line-height:16px;color:var(--ink-sub)">' + r[0] + '</p>' +
        '<p class="num" style="font-family:var(--mono);font-size:16px;line-height:24px;color:var(--ink)">' + r[1] + '</p></div>';
    }).join('');
    openOverlay($('aboutOverlay'));
  }
  if ($('openAbout')) $('openAbout').addEventListener('click', openAbout);
  $('moreAbout').addEventListener('click', openAbout);
  $('aboutClose').addEventListener('click', function () { closeOverlay($('aboutOverlay')); });
  $('moreSettings').addEventListener('click', function () { openSettings(); });

  /* ================= 设置 ================= */
  var headerRows = $('headerRows');
  var pendingTheme = config.theme || 'water';

  function addHeaderRow(k, v) {
    var row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = '<input class="hkey" type="text" spellcheck="false" placeholder="Header 名称" aria-label="请求头名称">' +
      '<input class="hval" type="text" spellcheck="false" placeholder="值" aria-label="请求头的值">' +
      '<button class="icon-btn row-del" type="button" aria-label="删除这一行"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button>';
    row.querySelector('.hkey').value = k || '';
    row.querySelector('.hval').value = v || '';
    row.querySelector('.row-del').addEventListener('click', function () { row.remove(); });
    headerRows.appendChild(row);
  }

  function openSettings() {
    $('setEndpoint').value = config.endpoint;
    $('setKey').value = config.apiKey;
    $('setModel').value = config.model;
    $('setAnniversary').value = config.anniversary || '';
    $('setSystem').value = config.system;
    $('setGreeting').value = config.greeting || '';
    $('setStatusLine').value = config.statusLine || '想你';
    if ($('setShell')) $('setShell').checked = config.shell !== false;
    pendingTheme = theme;
    applyTheme(theme);
    headerRows.innerHTML = '';
    if (config.headers.length) config.headers.forEach(function (h) { addHeaderRow(h.key, h.value); });
    else addHeaderRow('', '');
    openOverlay(settingsOverlay);
  }

  function saveSettings() {
    var headers = [];
    forEach(headerRows.querySelectorAll('.header-row'), function (row) {
      var k = row.querySelector('.hkey').value.trim();
      if (k) headers.push({ key: k, value: row.querySelector('.hval').value.trim() });
    });
    config = {
      endpoint: $('setEndpoint').value.trim() || DEF_ENDPOINT,
      apiKey: $('setKey').value.trim(),
      model: $('setModel').value.trim() || DEF_MODEL,
      headers: headers,
      system: $('setSystem').value.trim() || DEFAULT_SYSTEM,
      anniversary: $('setAnniversary').value || '',
      theme: pendingTheme,
      wallpaper: config.wallpaper,
      shell: config.shell,
      greeting: $('setGreeting').value.trim(),
      statusLine: $('setStatusLine').value.trim() || '想你',
      relation: config.relation
    };
    saveConfig();
    applyTheme(config.theme);
    renderHome();
    renderJournal();
    updateStatus();
    closeOverlay(settingsOverlay);
    toast('设置已保存');
  }

  if ($('openSettings')) $('openSettings').addEventListener('click', openSettings);
  $('settingsClose').addEventListener('click', function () { closeOverlay(settingsOverlay); });
  $('saveSettings').addEventListener('click', saveSettings);
  $('clearChat').addEventListener('click', function () {
    if (abortCtrl) { try { abortCtrl.abort(); } catch (e) { /* noop */ } }
    discard = sending;
    history = [];
    saveHistory();
    renderChat();
    renderHome();
    closeOverlay(settingsOverlay);
    toast('聊天记录已清空');
  });
  $('addHeader').addEventListener('click', function () {
    addHeaderRow('', '');
    var inputs = headerRows.querySelectorAll('.hkey');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });
  $('setBgBtn').addEventListener('click', openBg);
  if ($('setShell')) {
    $('setShell').addEventListener('change', function () {
      config.shell = this.checked;
      saveConfig();
      applyShell();
    });
  }
  $('clearBgBtn').addEventListener('click', function () {
    config.wallpaper = '';
    saveConfig();
    applyWallpaper();
    toast('回到晨雾默认背景');
  });
  if ($('importBtn')) {
    $('importBtn').addEventListener('click', function () { $('importFile').click(); });
    $('importFile').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var d;
        try { d = JSON.parse(fr.result); } catch (e) { toast('这个文件读不出来'); return; }
        if (!d || (!d.history && !d.config)) { toast('不是水色物语的备份'); return; }
        try {
          if (d.history) localStorage.setItem('mizu.history', JSON.stringify(d.history));
          if (d.moods) localStorage.setItem('mizu.moods', JSON.stringify(d.moods));
          if (d.memories) localStorage.setItem('mizu.memories', JSON.stringify(d.memories));
          if (d.notes) localStorage.setItem('mizu.notes', JSON.stringify(d.notes));
          if (d.weather) localStorage.setItem('mizu.weather', JSON.stringify(d.weather));
          if (d.letters) localStorage.setItem('mizu.letters', JSON.stringify(d.letters));
          if (d.playlist) localStorage.setItem('mizu.playlist', JSON.stringify(d.playlist));
          if (d.quickPhrases) localStorage.setItem('mizu.quickPhrases', JSON.stringify(d.quickPhrases));
          if (d.archive) localStorage.setItem('mizu.archive', JSON.stringify(d.archive));
          if (d.config) { var cur = JSON.parse(localStorage.getItem('mizu.config') || '{}'); for (var k in d.config) cur[k] = d.config[k]; localStorage.setItem('mizu.config', JSON.stringify(cur)); }
        } catch (e2) { toast('湖面装不下这么多，先清一些吧'); return; }
        toast('回忆回来了 · 正在重启');
        setTimeout(function () { location.reload(); }, 700);
      };
      fr.readAsText(f);
      this.value = '';
    });
  }

  if ($('pullModels')) {
    $('pullModels').addEventListener('click', async function () {
      var btn = this, raw = $('setEndpoint').value.trim(), key = $('setKey').value.trim();
      if (!raw) { toast('先填接口地址'); return; }
      btn.disabled = true; btn.textContent = '…';
      var base = normalizeEndpoint(raw).replace(/\/chat\/completions$/i, '');
      var list = base.endsWith('/v1') ? [base] : [base, base + '/v1'], lastErr = '';
      for (var i = 0; i < list.length; i++) {
        try {
          var r = await fetch(list[i] + '/models', { headers: key ? { 'Authorization': 'Bearer ' + key } : {} });
          if (!r.ok) { lastErr = 'HTTP ' + r.status; continue; }
          var arr = ((await r.json()) || {}).data || [];
          if (!arr.length) { lastErr = '返回结果为空'; continue; }
          var names = arr.map(function (m) { return m.id || m.name; }).filter(Boolean);
          openSheet('<div class="panel-head"><h2 class="panel-title">选择模型</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div><div class="pl-list">' +
            names.map(function (n) { return '<button class="pl-row" data-m="' + esc(n) + '" type="button"><span class="pl-meta"><span class="pl-title" style="font-family:var(--mono);font-size:13px">' + esc(n) + '</span></span></button>'; }).join('') + '</div>',
            function (ov, close) {
              ov.addEventListener('click', function (e) {
                var b = e.target.closest('[data-m]');
                if (!b) return;
                $('setModel').value = b.getAttribute('data-m');
                close(); toast('选好了，记得保存');
              });
            });
          btn.disabled = false; btn.textContent = '拉取'; return;
        } catch (e) { lastErr = e.message || '网络错误'; }
      }
      btn.disabled = false; btn.textContent = '拉取';
      toast('没拉到模型：' + lastErr);
    });
  }
  $('exportBtn').addEventListener('click', function () {
    var cfg = {};
    for (var k in config) if (Object.prototype.hasOwnProperty.call(config, k) && k !== 'apiKey') cfg[k] = config[k];
    var payload = {
      app: 'mizu-iro', version: 1, exportedAt: new Date().toISOString(),
      config: cfg, history: history, moods: moods, memories: memories,
      notes: notes, weather: weather, letters: letters, playlist: playlist,
      quickPhrases: phrases, statuses: statuses
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mizu-iro-' + isoOf() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 900);
    toast('回忆已打包 · 不含 API Key');
  });

  /* ================= 主题按钮 / About / 抽屉 ================= */
  forEach(document.querySelectorAll('[data-theme-name]'), function (b) {
    b.addEventListener('click', function () {
      pendingTheme = b.getAttribute('data-theme-name');
      applyTheme(pendingTheme);
      if (!settingsOverlay.classList.contains('is-open')) {
        config.theme = pendingTheme;
        saveConfig();
      }
    });
  });

  var drawer = null;
  function openDrawer() {
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'overlay is-open';
      drawer.style.alignItems = 'flex-end';
      drawer.style.padding = '0';
      drawer.innerHTML = '<div class="panel" role="dialog" aria-label="导航" style="max-width:none;border-radius:24px 24px 0 0;padding-bottom:calc(24px + env(safe-area-inset-bottom))">' +
        '<div class="panel-head"><h2 class="panel-title">导航</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
        ['home|首页|home', 'chat|聊天|moments/', 'memory|记忆|memories/', 'more|更多|more/'].map(function (row) {
          var p = row.split('|');
          return '<button class="hub-row" data-nav="' + p[0] + '" type="button" style="margin-bottom:8px"><span class="hub-row-txt">' + p[1] +
            '</span><span class="hub-arrow" style="position:static">' + p[2] + '</span></button>';
        }).join('') + '</div>';
      document.body.appendChild(drawer);
      drawer.addEventListener('click', function (e) {
        if (e.target === drawer || e.target.closest('[data-close]')) { drawer.remove(); drawer = null; return; }
        var b = e.target.closest('[data-nav]');
        if (!b) return;
        var v = b.getAttribute('data-nav');
        drawer.remove(); drawer = null;
        switchView(v);
      });
    }
  }
  $('chatMenu').addEventListener('click', function () {
    closeApp();
    return;
    if (drawer) { drawer.remove(); drawer = null; } else openDrawer();
  });

  /* ================= 手机绑定 ================= */
  if ($('appBack')) $('appBack').addEventListener('click', closeApp);

  if (dockEl) {
    dockEl.addEventListener('click', function (e) {
      var b = e.target.closest('.dock-btn');
      if (b) openApp(b.getAttribute('data-app'));
    });
  }

  if ($('appGrid')) {
    $('appGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-app]');
      if (!b) return;
      openApp(b.getAttribute('data-app'), b);
    });
  }

  /* 旧页面里的 data-go / data-back */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { openApp(go.getAttribute('data-go'), go); return; }
    if (e.target.closest('[data-back]')) closeApp();
  });

  /* 解锁：点 / 上划 */
  if (lockEl) {
    var lockStartY = 0, lockMoved = false;
    lockEl.addEventListener('pointerdown', function (e) {
      lockStartY = e.clientY; lockMoved = false;
    });
    lockEl.addEventListener('pointermove', function (e) {
      if (lockStartY && lockStartY - e.clientY > 60) { lockMoved = true; unlock(); lockStartY = 0; }
    });
    lockEl.addEventListener('pointerup', function () {
      if (!lockMoved && lockStartY && Math.abs(lockStartY - 0) >= 0) { /* 轻点不锁 */ }
      lockStartY = 0;
    });
    if ($('lockFoot')) {
      $('lockFoot').addEventListener('click', function (e) { e.stopPropagation(); unlock(); });
    }
    lockEl.addEventListener('click', function (e) {
      if (e.target.closest('.sprite')) return;
      unlock();
    });
  }

  /* 主屏滑动（rAF 节流，横向手势交给 JS，纵向交给浏览器） */
  (function () {
    if (!homeEl || !pagesEl) return;
    var startX = 0, startY = 0, dragging = false, dx = 0, decided = false, horizontal = false;
    var pend = 0, rafId = 0, suppress = false;

    function applyDrag(px) {
      pend = px;
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        pagesEl.style.transform = 'translateX(' + (-100 / HOME_PAGES * homeIndex + pend / (homeEl.clientWidth || 1) * 100) + '%)';
      });
    }

    homeEl.addEventListener('click', function (e) {
      if (!suppress) return;
      e.stopPropagation();
      e.preventDefault();
      suppress = false;
    }, true);

    homeEl.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.sprite, .dock')) return;
      startX = e.clientX; startY = e.clientY;
      dragging = true; dx = 0; decided = false; horizontal = false;
      pagesEl.style.willChange = 'transform';
    });

    homeEl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!decided && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        decided = true;
        horizontal = Math.abs(dx) > Math.abs(dy);
        if (horizontal) pagesEl.classList.add('is-drag');
      }
      if (horizontal) applyDrag(dx);
    }, { passive: true });

    function end() {
      if (!dragging) return;
      dragging = false;
      pagesEl.classList.remove('is-drag');
      pagesEl.style.willChange = '';
      if (Math.abs(dx) > 8) suppress = true;
      if (!horizontal) { goPage(homeIndex); return; }
      if (dx < -60) goPage(homeIndex + 1);
      else if (dx > 60) goPage(homeIndex - 1);
      else goPage(homeIndex);
    }
    homeEl.addEventListener('pointerup', end);
    homeEl.addEventListener('pointercancel', end);
    homeEl.addEventListener('pointerleave', function () { if (dragging) end(); });
  })();
  /* 像素精灵 */
  (function () {
    var sp = $('spriteHome');
    var bubble = $('spriteBubble');
    if (!sp) return;
    var lines = [
      '湖水今天很浅。',
      '雾散之前，先呼吸。',
      '我把涟漪存起来了。',
      '别急着说话，先待一会儿。',
      '你身上有水色的味道。'
    ];
    var wander = function () {
      var w = (homeEl ? homeEl.clientWidth : 390) - 48;
      var h = (homeEl ? homeEl.clientHeight : 844) - 220;
      var x = Math.round(16 + Math.random() * Math.max(0, w - 16));
      var y = Math.round(120 + Math.random() * Math.max(0, h - 120));
      sp.style.right = 'auto';
      sp.style.left = x + 'px';
      sp.style.bottom = 'auto';
      sp.style.top = y + 'px';
      setTimeout(wander, 10000 + Math.random() * 4000);
    };
    setTimeout(wander, 10000);
    sp.addEventListener('click', function (e) {
      e.stopPropagation();
      sp.classList.remove('is-shake');
      void sp.offsetWidth;
      sp.classList.add('is-shake');
      if (bubble) {
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        bubble.classList.add('show');
        clearTimeout(bubble._t);
        bubble._t = setTimeout(function () { bubble.classList.remove('show'); }, 2600);
      }
    });
  })();

  window.addEventListener('resize', fitScreen);

  /* ================= ESC ================= */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer) { drawer.remove(); drawer = null; return; }
    if (stickerTray && stickerTray.classList.contains('show')) { closeStickers(); return; }
    if ($('dicePop').classList.contains('show')) { closeDice(); return; }
    if ($('lightbox').classList.contains('is-open')) {
      $('lightbox').classList.remove('is-open');
      $('lightbox').setAttribute('aria-hidden', 'true');
      return;
    }
    if (searchOpen) { setSearch(false); return; }
    if ($('aboutOverlay').classList.contains('is-open')) { closeOverlay($('aboutOverlay')); return; }
    if (settingsOverlay.classList.contains('is-open')) { closeOverlay(settingsOverlay); return; }
    if (profileOverlay.classList.contains('is-open')) closeOverlay(profileOverlay);
  });
  [profileOverlay, settingsOverlay, $('aboutOverlay')].forEach(function (ov) {
    ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay(ov); });
  });

  /* ================= 启动 ================= */
  /* ==========================================================
     记忆库 · 数据
     ========================================================== */
  var K_ARC = 'mizu.archive';
  var K_ARCNOTE = 'mizu.archiveNote';
  var archive = read(K_ARC, []) || [];
  if (!Array.isArray(archive)) archive = [];
  var arcPane = 'abyss';
  var arcOpenLayer = -1;

  function arcId() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function saveArchive() {
    try {
      localStorage.setItem(K_ARC, JSON.stringify(archive));
      return true;
    } catch (e) {
      toast('湖面的容量满了，先让一些碎片沉下去吧');
      return false;
    }
  }

  function arcAdd(type, text, opt) {
    opt = opt || {};
    text = String(text || '').trim();
    if (!text) return null;
    for (var i = 0; i < archive.length; i++) if (archive[i].text === text) return archive[i];
    var item = {
      id: arcId(), type: type, text: text, ts: Date.now(),
      heat: opt.heat || 0, lastHit: opt.lastHit || 0,
      pinned: !!opt.pinned, private: !!opt.private, summary: ''
    };
    archive.push(item);
    if (!saveArchive()) { archive.pop(); return null; }
    return item;
  }

  function arcDecay() {
    var now = Date.now(), week = 7 * DAY, changed = false;
    archive.forEach(function (m) {
      var base = Math.max(m.lastHit || 0, m.decayedAt || 0, m.ts || 0);
      var weeks = Math.floor((now - base) / week);
      if (weeks > 0 && m.heat > 0) {
        m.heat = Math.max(0, m.heat - weeks);
        m.decayedAt = base + weeks * week;
        changed = true;
      }
    });
    if (changed) saveArchive();
  }

  /* 发消息时命中锚点 → heat+1 */
  function arcHit(text) {
    var s = String(text || '');
    var changed = false;
    archive.forEach(function (m) {
      if (m.pinned && s.indexOf(m.text) >= 0) {
        m.heat += 1;
        m.lastHit = Date.now();
        changed = true;
      }
    });
    if (changed) {
      saveArchive();
      if (currentView === 'archive') renderArchive();
    }
  }

  function arcBump(item) {
    if (!item) return;
    item.heat += 1;
    item.lastHit = Date.now();
    saveArchive();
    if (currentView === 'archive') renderArchive();
  }

  function arcLayerOf(heat) {
    if (heat >= 3) return 0;
    if (heat === 2) return 1;
    if (heat === 1) return 2;
    return 3;
  }

  var ARC_LAYERS = [
    { name: '透光层', sub: 'SUNLIGHT', cls: '' },
    { name: '暮光层', sub: 'TWILIGHT', cls: 'is-mid' },
    { name: '午夜层', sub: 'MIDNIGHT', cls: 'is-mid' },
    { name: '深渊层', sub: 'ABYSS', cls: 'is-deep' }
  ];

  function hashSeed(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function stampOf(ts) {
    var d = new Date(ts);
    return (d.getMonth() + 1) + '·' + pad2(d.getDate());
  }

  /* ==========================================================
     记忆库 · 渲染
     ========================================================== */
  function renderArchive() {
    var now = Date.now();
    var recent = archive.filter(function (m) { return m.lastHit && (now - m.lastHit) < 30 * DAY; }).length;
    var sunk = archive.filter(function (m) { return m.heat <= 0; }).length;
    var stat = $('arcStat');
    if (stat) stat.textContent = archive.length + ' 条记忆 · 这 30 天被想起 ' + recent + ' 条 · 沉下去 ' + sunk + ' 条';
    var hint = $('arcHint');
    if (hint) hint.textContent = archive.length ? '点一层，潜下去' : '深海还很空';
    renderAbyss();
    renderMaintain();
    if (arcPane === 'stars') startGalaxy();
  }

  function dotHtml(list, li) {
    var out = '';
    if (!list.length) {
      for (var k = 0; k < 3; k++) {
        out += '<span class="dot" style="left:' + (18 + k * 32) + '%;top:' + (28 + k * 14) + '%;opacity:.16;animation:none"></span>';
      }
      return out;
    }
    list.slice(0, 60).forEach(function (m) {
      var s = hashSeed(m.id);
      var x = 4 + (s % 92);
      var y = 10 + ((s >> 9) % 76);
      var delay = ((s >> 17) % 500) / 100;
      out += '<span class="dot" style="left:' + x + '%;top:' + y + '%;animation-delay:-' + delay.toFixed(2) + 's"></span>';
    });
    if (list.length > 60) out += '<span class="dot" style="left:50%;top:50%;opacity:.5;animation:none"></span>';
    return out;
  }

  function arcItemHtml(m) {
    var days = m.lastHit ? Math.floor((Date.now() - m.lastHit) / DAY) : -1;
    var hitTxt = days < 0 ? '还没被想起' : (days <= 0 ? '今天被想起' : days + ' 天前被想起');
    return '<div class="abyss-item" data-id="' + m.id + '">' +
      '<p class="abyss-text">' + esc(m.text) + '</p>' +
      '<div class="abyss-meta"><span>' + stampOf(m.ts) + '</span><span>' + hitTxt + ' · heat ' + m.heat + '</span>' +
      '<button type="button" data-lift="' + m.id + '">提起</button></div></div>';
  }

  function renderAbyss() {
    var box = $('abyssLayers');
    if (!box) return;
    var groups = [[], [], [], []];
    archive.forEach(function (m) { groups[arcLayerOf(m.heat)].push(m); });

    var html = '';
    groups.forEach(function (list, li) {
      var L = ARC_LAYERS[li];
      html += '<div class="abyss-layer' + (arcOpenLayer === li ? ' is-open' : '') + '" data-layer="' + li + '">' +
        '<button class="layer-head" type="button" aria-expanded="' + (arcOpenLayer === li ? 'true' : 'false') + '">' +
        '<span class="layer-name">' + L.name + '</span>' +
        '<span class="layer-sub">' + L.sub + '</span>' +
        '<span class="layer-count">' + list.length + ' 条</span></button>' +
        '<div class="layer-dots ' + L.cls + '">' + dotHtml(list, li) + '</div>' +
        '<div class="layer-panel-slot">' +
        (arcOpenLayer === li
          ? '<div class="abyss-panel">' + (list.length ? list.map(arcItemHtml).join('') : '<p class="abyss-empty">这一层还是空的。</p>') + '</div>'
          : '') +
        '</div></div>';
    });
    box.innerHTML = html;

    var abyss = $('abyss');
    if (abyss) abyss.classList.toggle('is-empty', !archive.length);
    var emp = $('abyssEmpty');
    if (emp) emp.style.display = archive.length ? 'none' : 'block';
  }

  function toggleLayer(li) {
    arcOpenLayer = (arcOpenLayer === li) ? -1 : li;
    renderAbyss();
  }

  function liftOne(id) {
    var item = null;
    archive.forEach(function (m) { if (m.id === id) item = m; });
    if (!item) return;
    arcBump(item);
    if (currentView !== 'chat') switchView('chat');
    sendText('还记得吗：' + item.text, false, true);
  }

  /* ==========================================================
     记忆库 · 管理视图
     ========================================================== */
  function renderMaintain() {
    var anchors = archive.filter(function (m) { return m.pinned; });
    var ca = $('cntAnchors');
    if (ca) ca.textContent = anchors.length;
    var box = $('mtAnchors');
    if (box) {
      box.innerHTML = anchors.length ? anchors.map(function (m) {
        var days = m.lastHit ? Math.floor((Date.now() - m.lastHit) / DAY) : -1;
        var when = days < 0 ? '还没被想起' : (days <= 0 ? '今天被想起' : '最近被想起 ' + days + ' 天前');
        var short = m.text.length > 24 ? m.text.slice(0, 24) + '…' : m.text;
        return '<div class="mt-row"><div class="mt-row-main"><p class="mt-row-text">✦ ' + esc(short) + '</p>' +
          '<p class="mt-row-meta">' + when + ' · heat ' + m.heat + '</p></div>' +
          '<button type="button" data-wake="' + m.id + '">唤起</button></div>';
      }).join('') : '<p class="mt-empty">还没有锚点。先收一条，再点它旁边的「锚点」。</p>';
    }

    var recent = archive.filter(function (m) { return (Date.now() - m.ts) < 30 * DAY; }).sort(function (a, b) { return b.ts - a.ts; });
    var cf = $('cntFragments');
    if (cf) cf.textContent = recent.length;
    var fbox = $('mtFragments');
    if (fbox) {
      fbox.innerHTML = recent.length
        ? '<div class="frag-wrap">' + recent.map(function (m) {
            var short = m.text.length > 12 ? m.text.slice(0, 12) + '…' : m.text;
            return '<button class="frag" type="button" data-frag="' + m.id + '"><span class="frag-date">' + stampOf(m.ts) + '</span><span class="frag-txt">' + esc(short) + '</span></button>';
          }).join('') + '</div>'
        : '<p class="mt-empty">这 30 天还没有新的碎片。</p>';
    }

    var sleep = archive.filter(function (m) { return (Date.now() - m.ts) > 30 * DAY; }).length;
    var wk = archive.filter(function (m) { return m.lastHit && (Date.now() - m.lastHit) < 7 * DAY; }).length;
    var cv = $('cntVitals');
    if (cv) cv.textContent = archive.length;
    var vbox = $('mtVitals');
    if (vbox) {
      var note = '';
      try { note = localStorage.getItem(K_ARCNOTE) || ''; } catch (e) { note = ''; }
      vbox.innerHTML = '<p class="mt-vitals">记忆 ' + archive.length + ' 条 · 锚点 ' + anchors.length +
        ' 条 · 近 7 天唤起 ' + wk + ' 次 · 沉睡 ' + sleep + ' 条</p>' +
        (note ? '<p class="mt-row-text" style="margin-bottom:8px">' + esc(note) + '</p>' : '') +
        '<button class="chip" id="arcTidy" type="button">整理</button>';
      var tidy = $('arcTidy');
      if (tidy) tidy.addEventListener('click', tidyArchive);
    }
  }

  function tidyArchive() {
    var sleeping = archive.filter(function (m) { return (Date.now() - m.ts) > 30 * DAY; });
    if (!sleeping.length) { toast('还没有沉睡太久的记忆'); return; }
    if (!config.endpoint) { toast('先在设置里填 API 地址'); return; }
    var sample = sleeping.slice(0, 8).map(function (m) { return '· ' + m.text; }).join('\n');
    var btn = $('arcTidy');
    if (btn) { btn.disabled = true; btn.textContent = '整理中…'; }
    var h = buildHeaders();
    h['Accept'] = 'application/json';
    fetch(normalizeEndpoint(config.endpoint), {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        model: config.model || DEF_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: '你是一个安静的归档员。用一句不超过 30 字的中文，温柔地概括这些旧记忆，不抒情过度，不用 emoji。' },
          { role: 'user', content: sample }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      var c = d && d.choices && d.choices[0];
      var text = c && ((c.message && c.message.content) || c.text);
      if (!text) throw new Error('没有收到总结');
      var line = String(text).trim().slice(0, 60);
      try { localStorage.setItem(K_ARCNOTE, line); } catch (e) { /* noop */ }
      sleeping[0].summary = line;
      saveArchive();
      renderMaintain();
      toast('整理好了');
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = '整理'; }
      toast('整理没成功：' + (e && e.message ? e.message : '网络问题'));
    });
  }

  /* ==========================================================
     记忆库 · 交互
     ========================================================== */
  function syncArcSeg() {
    if (!arcSeg) return;
    forEach(arcSeg.querySelectorAll('.seg-btn'), function (x) {
      x.classList.toggle('is-on', x.getAttribute('data-pane') === arcPane);
    });
    var a = $('paneAbyss'), s = $('paneStars'), m = $('paneMaintain');
    if (a) a.hidden = arcPane !== 'abyss';
    if (s) s.hidden = arcPane !== 'stars';
    if (m) m.hidden = arcPane !== 'maintain';
  }

  var arcSeg = $('arcSeg');
  if (arcSeg) {
    arcSeg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pane]');
      if (!b) return;
      arcPane = b.getAttribute('data-pane');
      syncArcSeg();
      if (arcPane === 'stars') { renderGalaxy(); startGalaxy(); }
      else stopGalaxy();
      if (arcPane === 'maintain') renderMaintain();
    });
  }

  var abyssEl = $('abyssLayers');
  if (abyssEl) {
    abyssEl.addEventListener('click', function (e) {
      var lift = e.target.closest('[data-lift]');
      if (lift) { e.stopPropagation(); liftOne(lift.getAttribute('data-lift')); return; }
      var head = e.target.closest('.layer-head');
      if (!head) return;
      var layer = head.closest('.abyss-layer');
      if (layer) toggleLayer(Number(layer.getAttribute('data-layer')));
    });
  }

  if ($('arcAddBtn')) {
    function addFromInput() {
      var inp = $('arcInput');
      var v = inp.value.trim();
      if (!v) return;
      if (arcAdd('impress', v)) {
        inp.value = '';
        renderArchive();
        toast('沉下去了');
      }
    }
    $('arcAddBtn').addEventListener('click', addFromInput);
    $('arcInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addFromInput(); }
    });
  }

  var mtAnchorsEl = $('mtAnchors');
  if (mtAnchorsEl) {
    mtAnchorsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-wake]');
      if (!b) return;
      var id = b.getAttribute('data-wake');
      var item = null;
      archive.forEach(function (m) { if (m.id === id) item = m; });
      if (!item) return;
      arcBump(item);
      if (currentView !== 'chat') switchView('chat');
      sendText('关于这段记忆，你还记得吗：' + item.text, false, true);
    });
  }

  var mtFragEl = $('mtFragments');
  if (mtFragEl) {
    mtFragEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-frag]');
      if (!b) return;
      var id = b.getAttribute('data-frag');
      var item = null;
      archive.forEach(function (m) { if (m.id === id) item = m; });
      if (!item) return;
      openSheet('<div class="panel-head"><h2 class="panel-title">一条碎片</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
        '<p style="font-size:14px;line-height:24px;color:var(--ink)">' + esc(item.text) + '</p>' +
        '<p class="arc-stat" style="margin-top:8px">' + fmtPlain(new Date(item.ts)) + ' · heat ' + item.heat + (item.pinned ? ' · 锚点' : '') + '</p>' +
        '<div class="panel-actions"><button class="btn-ghost" id="fragPin" type="button">' + (item.pinned ? '取消锚点' : '设为锚点') + '</button>' +
        '<button class="btn-primary" id="fragLift" type="button">提起</button></div>',
        function (ov, close) {
          ov.querySelector('#fragPin').addEventListener('click', function () {
            item.pinned = !item.pinned;
            saveArchive(); renderArchive(); close();
            toast(item.pinned ? '设成锚点了' : '取消锚点了');
          });
          ov.querySelector('#fragLift').addEventListener('click', function () { close(); liftOne(id); });
        });
    });
  }

  forEach(document.querySelectorAll('.mt-sec-head'), function (h) {
    h.addEventListener('click', function () {
      h.parentNode.classList.toggle('is-open');
    });
  });

  /* 聊天里长按自己的气泡 → 收进记忆库 */
  (function () {
    var press = null;
    chatScroll.addEventListener('pointerdown', function (e) {
      var bubble = e.target.closest('.msg.user .bubble');
      if (!bubble) return;
      clearTimeout(press);
      press = setTimeout(function () {
        var row = bubble.closest('.msg');
        var i = row ? Number(row.dataset.index) : -1;
        var m = history[i];
        if (!m || m.sticker) return;
        openSheet('<div class="panel-head"><h2 class="panel-title">收进记忆库</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X + '</button></div>' +
          '<p style="font-size:14px;line-height:24px;color:var(--ink)">' + esc(m.content.length > 60 ? m.content.slice(0, 60) + '…' : m.content) + '</p>' +
          '<div class="panel-actions"><button class="btn-primary" id="clipSave" type="button">收进记忆库</button></div>',
          function (ov, close) {
            ov.querySelector('#clipSave').addEventListener('click', function () {
              var item = arcAdd('excerpt', m.content);
              close();
              if (item) { renderArchive(); toast('收进记忆库了'); }
            });
          });
      }, 600);
    });
    ['pointerup', 'pointercancel', 'pointermove', 'scroll'].forEach(function (ev) {
      chatScroll.addEventListener(ev, function () { clearTimeout(press); }, { passive: true });
    });
  })();

  /* 每天首次打开，收录昨天最晚一条 AI 回复 */
  function collectYesterday() {
    var yIso = isoOf(new Date(Date.now() - DAY));
    var last = null;
    history.forEach(function (m) {
      if (m.role !== 'user' && !m.sticker && sameDay(m.ts, yIso)) last = m;
    });
    if (!last) return;
    var exists = false;
    archive.forEach(function (m) { if (m.type === 'near' && m.text === last.content) exists = true; });
    if (!exists) arcAdd('near', last.content);
  }

  /* ==========================================================
     聊天页细节：思考过程 / 图片 / 语音 / 日历热图
     ========================================================== */
  var X2 = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  msgList.addEventListener('click', function (e) {
    var bar = e.target.closest('.reason-bar');
    if (!bar) return;
    var wrap = bar.parentNode;
    var open = wrap.classList.toggle('is-open');
    bar.setAttribute('aria-label', open ? '收起思考过程' : '展开思考过程');
  });

  /* 图片消息 */
  function pickChatImage() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      compress(f, function (url) {
        if (!url) { toast('这张图读不出来'); return; }
        history.push({ role: 'user', image: url, content: '[图片]', ts: Date.now() });
        saveHistory();
        renderChat();
        renderHome();
        scrollToBottom(true);
        sendText('[图片] 我发了一张照片给你看', true);
      }, 1200, 0.8);
    };
    inp.click();
  }

  /* 假语音 */
  var micTimer = null, micHeld = false;
  var recToast = document.createElement('div');
  recToast.className = 'rec-toast';
  recToast.textContent = '松开发送 · 正在录音';
  document.body.appendChild(recToast);

  function micStart(e) {
    e.preventDefault();
    if (sending) { toast('TA 正在回你上一句'); return; }
    micHeld = true;
    var btn = $('micBtn');
    if (btn) btn.classList.add('is-rec');
    recToast.classList.add('show');
    clearTimeout(micTimer);
    micTimer = setTimeout(function () { micStop(true); }, 10000);
  }
  function micStop(force) {
    if (!micHeld) return;
    micHeld = false;
    clearTimeout(micTimer);
    var btn = $('micBtn');
    if (btn) btn.classList.remove('is-rec');
    recToast.classList.remove('show');
    if (force === true) return;
    history.push({ role: 'user', voice: { dur: 3 }, content: '[语音 3"]', ts: Date.now() });
    saveHistory();
    renderChat();
    scrollToBottom(true);
    sendText('[语音] 我说了一句话，你听听', true);
  }
  if ($('micBtn')) {
    $('micBtn').addEventListener('pointerdown', micStart);
    $('micBtn').addEventListener('pointerup', function () { micStop(false); });
    $('micBtn').addEventListener('pointercancel', function () { micStop(true); });
    $('micBtn').addEventListener('pointerleave', function () { micStop(false); });
  }

  /* ＋ 号：照片 / 贴纸 / 骰子 */
  if ($('openPlus')) {
    $('openPlus').addEventListener('click', function (e) {
      e.stopPropagation();
      openSheet('<div class="panel-head"><h2 class="panel-title">发点什么</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
        '<button class="hub-row" id="plusPhoto" type="button" style="margin-bottom:8px"><span class="hub-row-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M4 16l4.4-4.4a2 2 0 0 1 2.8 0L15 15l1.8-1.8a2 2 0 0 1 2.8 0L20.5 15"/><circle cx="9" cy="9.5" r="1.2"/></svg></span><span class="hub-row-txt">照片</span></button>' +
        '<button class="hub-row" id="plusSticker" type="button" style="margin-bottom:8px"><span class="hub-row-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5.5L13.5 20H8a4 4 0 0 1-4-4z"/><path d="M20 13.5h-3.5a3 3 0 0 0-3 3V20"/></svg></span><span class="hub-row-txt">贴纸</span></button>' +
        '<button class="hub-row" id="plusDice" type="button"><span class="hub-row-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r=".9" fill="currentColor"/><circle cx="15" cy="15" r=".9" fill="currentColor"/></svg></span><span class="hub-row-txt">抽个话题</span></button>',
        function (ov, close) {
          ov.querySelector('#plusPhoto').addEventListener('click', function () { close(); setTimeout(pickChatImage, 120); });
          ov.querySelector('#plusSticker').addEventListener('click', function () { close(); setTimeout(openStickers, 120); });
          ov.querySelector('#plusDice').addEventListener('click', function () { close(); setTimeout(openDice, 120); });
        });
    });
  }

  /* 日历热图 */
  function openHeat() {
    var counts = {};
    history.forEach(function (m) {
      var k = isoOf(new Date(m.ts));
      counts[k] = (counts[k] || 0) + 1;
    });
    var dayN = Object.keys(counts).length, total = history.length;
    var cur = new Date();
    cur.setDate(1);
    var W = ['日', '一', '二', '三', '四', '五', '六'];

    openSheet('<div class="panel-head"><h2 class="panel-title">我们聊过的每一天</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
      '<p class="heat-stat" id="heatStat">聊过 ' + dayN + ' 天 · 共 ' + total + ' 句</p>' +
      '<div class="heat-head"><button class="icon-btn" id="heatPrev" type="button" aria-label="上个月"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<span class="heat-month" id="heatMonth"></span>' +
      '<button class="icon-btn" id="heatNext" type="button" aria-label="下个月"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button></div>' +
      '<div class="heat-grid" id="heatGrid"></div>',
      function (ov, close) {
        function draw() {
          var y = cur.getFullYear(), mo = cur.getMonth();
          ov.querySelector('#heatMonth').textContent = y + ' 年 ' + (mo + 1) + ' 月';
          var first = new Date(y, mo, 1).getDay();
          var dim = new Date(y, mo + 1, 0).getDate();
          var cells = W.map(function (d) { return '<span class="heat-dow">' + d + '</span>'; }).join('');
          for (var i = 0; i < first; i++) cells += '<span class="heat-cell empty"></span>';
          for (var d = 1; d <= dim; d++) {
            var iso = y + '-' + pad2(mo + 1) + '-' + pad2(d);
            var n = counts[iso] || 0;
            var lvl = n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : n <= 12 ? 4 : 5;
            var today = iso === isoOf() ? ' today' : '';
            cells += '<button class="heat-cell' + (n ? ' has heat-' + lvl : '') + today + '" data-day="' + iso + '" type="button" aria-label="' + iso + ' ' + n + ' 句">' + d + '</button>';
          }
          ov.querySelector('#heatGrid').innerHTML = cells;
        }
        draw();
        ov.querySelector('#heatPrev').addEventListener('click', function () { cur.setMonth(cur.getMonth() - 1); draw(); });
        ov.querySelector('#heatNext').addEventListener('click', function () { cur.setMonth(cur.getMonth() + 1); draw(); });
        ov.querySelector('#heatGrid').addEventListener('click', function (e) {
          var b = e.target.closest('[data-day]');
          if (!b) return;
          var iso = b.getAttribute('data-day');
          if (!counts[iso]) return;
          close();
          jumpToDay(iso);
        });
      });
  }

  function jumpToDay(iso) {
    if (currentView !== 'chat') openApp('chat');
    var target = -1;
    history.forEach(function (m, i) { if (target < 0 && isoOf(new Date(m.ts)) === iso) target = i; });
    if (target < 0) { toast('那天没有记录'); return; }
    renderChat();
    requestAnimationFrame(function () {
      var node = msgList.querySelector('.msg[data-index="' + target + '"]');
      if (!node) return;
      var day = node.previousElementSibling;
      while (day && !day.classList.contains('msg-day')) day = day.previousElementSibling;
      var top = (day || node).offsetTop - 24;
      chatScroll.scrollTo ? chatScroll.scrollTo({ top: top, behavior: REDUCE ? 'auto' : 'smooth' }) : (chatScroll.scrollTop = top);
      if (day) {
        day.classList.remove('flash');
        void day.offsetWidth;
        day.classList.add('flash');
        setTimeout(function () { day.classList.remove('flash'); }, 1600);
      }
    });
  }

  /* ⋯ 菜单 */
  if ($('chatMore')) {
    $('chatMore').addEventListener('click', function () {
      openSheet('<div class="panel-head"><h2 class="panel-title">聊天</h2><button class="icon-btn" data-close type="button" aria-label="关闭">' + X2 + '</button></div>' +
        '<button class="hub-row" data-act="search" type="button" style="margin-bottom:8px"><span class="hub-row-txt">搜索记录</span></button>' +
        '<button class="hub-row" data-act="heat" type="button" style="margin-bottom:8px"><span class="hub-row-txt">我们聊过的每一天</span></button>' +
        '<button class="hub-row" data-act="profile" type="button" style="margin-bottom:8px"><span class="hub-row-txt">恋人资料卡</span></button>' +
        '<button class="hub-row" data-act="settings" type="button" style="margin-bottom:8px"><span class="hub-row-txt">设置</span></button>' +
        '<button class="hub-row" data-act="clear" type="button"><span class="hub-row-txt" style="color:#A8545C">清空聊天记录</span></button>',
        function (ov, close) {
          ov.addEventListener('click', function (e) {
            var b = e.target.closest('[data-act]');
            if (!b) return;
            var act = b.getAttribute('data-act');
            close();
            setTimeout(function () {
              if (act === 'search') { if (!searchOpen) setSearch(true); }
              else if (act === 'heat') openHeat();
              else if (act === 'profile') openProfile();
              else if (act === 'settings') openSettings();
              else if (act === 'clear') {
                history = [];
                saveHistory();
                renderChat();
                renderHome();
                toast('聊天记录已清空');
              }
            }, 140);
          });
        });
    });
  }

  if ($('chatTitleBtn')) $('chatTitleBtn').addEventListener('click', openProfile);
  if ($('hpNow')) $('hpNow').addEventListener('click', openPlaylist);
  if ($('chatCall')) {
    $('chatCall').addEventListener('click', function () {
      toast('电话还没接通 · TA 在雾里');
    });
  }

  function boot() {
    applyTheme(theme);
    if (screenEl) screenEl.classList.add('is-locked');
    applyShell();
    applyWallpaper();
    buildDots();
    if (pagesEl) pagesEl.style.setProperty('--n', String(HOME_PAGES));
    renderAppGrid();
    renderHome();
    renderChat();
    renderAlbum();
    renderJournal();
    renderLetters();
    renderChips();
    arcDecay();
    collectYesterday();
    renderArchive();
    autoGrow();
    setSendUI(false);
    if (sendBtn) sendBtn.disabled = true;

    var modelName = $('modelName');
    if (modelName) modelName.textContent = config.model;

    /* 开机 → 锁屏 */
    var bootEl = $('boot');
    if (bootEl) {
      setTimeout(function () {
        bootEl.classList.add('is-out');
        setTimeout(function () { if (bootEl.parentNode) bootEl.parentNode.removeChild(bootEl); }, 260);
      }, REDUCE ? 300 : 1400);
    }
  }

  setInterval(function () {
    renderClock();
    if (new Date().getSeconds() === 0) renderHome();
  }, 1000);


  boot();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 离线不可用就算了 */ });
    });
  }
})();
