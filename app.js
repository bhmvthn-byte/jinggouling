/* ============================================================
   app.js — 交互逻辑（视图层）
   数据源：window.MOCK；接口：window.API
   ============================================================ */
(function () {
  'use strict';

  var MOCK = window.MOCK;
  var API = window.API;

  function icon(name) {
    return MOCK.ICONS[name] || '';
  }

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ============ 页面渲染（从 mock 读取，不硬编码） ============ */
  function renderScenarios() {
    var el = document.getElementById('scenarioGrid');
    el.innerHTML = MOCK.scenarios.map(function (s, i) {
      return '<div class="card reveal" style="animation-delay:' + (i * 80) + 'ms">' +
        '<div class="card__icon">' + icon(s.icon) + '</div>' +
        '<h3>' + escapeHTML(s.title) + '</h3>' +
        '<p>' + escapeHTML(s.desc) + '</p>' +
        '</div>';
    }).join('');
  }

  function renderFeatures() {
    var el = document.getElementById('featureGrid');
    el.innerHTML = MOCK.features.map(function (f, i) {
      return '<div class="card reveal" style="animation-delay:' + (i * 80) + 'ms">' +
        '<div class="card__icon">' + icon(f.icon) + '</div>' +
        '<h3>' + escapeHTML(f.title) + '</h3>' +
        '<p>' + escapeHTML(f.desc) + '</p>' +
        '</div>';
    }).join('');
  }

  function renderSteps() {
    var el = document.getElementById('stepList');
    el.innerHTML = MOCK.steps.map(function (s, i) {
      return '<div class="step reveal" style="animation-delay:' + (i * 100) + 'ms">' +
        '<div class="step__num">' + (i + 1) + '</div>' +
        '<h3>' + escapeHTML(s.title) + '</h3>' +
        '<p>' + escapeHTML(s.desc) + '</p>' +
        '</div>';
    }).join('');
  }

  function renderCertifications() {
    var el = document.getElementById('certList');
    el.innerHTML = MOCK.certifications.map(function (c) {
      return '<li>' + icon('check') + '<span>' + escapeHTML(c) + '</span></li>';
    }).join('');
  }

  function renderIngredients() {
    var el = document.getElementById('ingredientList');
    el.innerHTML = MOCK.ingredients.map(function (ing) {
      return '<div class="ingredient">' +
        '<span class="ingredient__dot"></span>' +
        '<div><strong>' + escapeHTML(ing.name) + '</strong>' +
        '<span>' + escapeHTML(ing.note) + '</span></div>' +
        '</div>';
    }).join('');
  }

  function renderFaqs() {
    var el = document.getElementById('faqList');
    el.innerHTML = MOCK.faqs.map(function (f, i) {
      return '<div class="faq__item" data-faq="' + i + '">' +
        '<button class="faq__q" type="button">' +
        '<span>' + escapeHTML(f.q) + '</span>' + icon('chevron') +
        '</button>' +
        '<div class="faq__a"><p>' + escapeHTML(f.a) + '</p></div>' +
        '</div>';
    }).join('');
    el.addEventListener('click', onFaqClick);
  }

  function onFaqClick(e) {
    var q = e.target.closest('.faq__q');
    if (!q) return;
    var item = q.parentElement;
    var answer = item.querySelector('.faq__a');
    var isOpen = item.classList.contains('open');
    // 先全部收起（手风琴式只留一个展开）
    document.querySelectorAll('.faq__item.open').forEach(function (it) {
      if (it !== item) {
        it.classList.remove('open');
        it.querySelector('.faq__a').style.maxHeight = '0px';
      }
    });
    if (isOpen) {
      item.classList.remove('open');
      answer.style.maxHeight = '0px';
    } else {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }

  /* ============ 顶部导航：滚动高亮 + 移动端菜单 ============ */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var sections = ['scenarios', 'features', 'how', 'safety', 'faq']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // 点击导航项后收起移动端菜单
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    function onScroll() {
      var y = window.scrollY + 90;
      var current = 'home';
      sections.forEach(function (sec) {
        if (sec && sec.offsetTop <= y) current = sec.id;
      });
      nav.querySelectorAll('a[data-nav]').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-nav') === current);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============ Toast ============ */
  var toastTimer = null;
  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    t.setAttribute('aria-hidden', 'false');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove('show');
      t.setAttribute('aria-hidden', 'true');
    }, 2400);
  }

  /* ============ 产品线选择 ============ */
  var selectedLine = null;

  function renderProductLines() {
    var box = document.getElementById('plineOptions');
    box.innerHTML = MOCK.devices.map(function (s) {
      return '<button type="button" class="pline__opt" data-id="' + escapeHTML(s.id) + '" data-name="' + escapeHTML(s.name) + '">' + escapeHTML(s.name) + '</button>';
    }).join('');
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.pline__opt');
      if (btn) selectLine(btn);
    });
    var first = box.querySelector('.pline__opt');
    if (first) selectLine(first);
  }

  function selectLine(btn) {
    var box = document.getElementById('plineOptions');
    box.querySelectorAll('.pline__opt').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    selectedLine = { id: btn.getAttribute('data-id'), name: btn.getAttribute('data-name') };
  }

  function currentLineName() {
    return selectedLine ? selectedLine.name : '净垢灵除垢剂';
  }

  /* ============ 购买按钮 ============ */
  function initBuy() {
    var buyBtn = document.getElementById('buyBtn');
    if (buyBtn) buyBtn.style.display = 'none';
  }

  /* ============ 在线客服（AI 自动 + 转人工实时） ============ */
  var support = { mode: 'ai', greeted: false, maintenance: false };

  // 判断当前是否在客服服务时间 9:00-21:00
  function isWithinServiceHours() {
    var h = new Date().getHours();
    var sh = MOCK.chat.serviceHours;
    return h >= sh.start && h < sh.end;
  }

  // 维护模式检测：每 10 秒轮询服务器状态
  var mtgDismissed = false; // 本次会话是否已关闭过维护弹窗
  // 将 24 小时制时间转为口语化表达（含上午/下午）
  function hourLabel(h) {
    h = parseInt(h, 10);
    if (h === 0) return '凌晨0点';
    if (h < 6) return '凌晨' + h + '点';
    if (h < 12) return '上午' + h + '点';
    if (h === 12) return '中午12点';
    if (h < 18) return '下午' + (h - 12) + '点';
    return '晚上' + (h - 12) + '点';
  }
  function windowLabel(w) {
    // w 格式: '00:00–08:00'
    var p = w.split('–');
    if (p.length === 2) {
      return hourLabel(p[0].trim().split(':')[0]) + ' – ' + hourLabel(p[1].trim().split(':')[0]);
    }
    return w;
  }
  function checkMaintenance() {
    window.JC.getStatus().then(function (s) {
      var banner = document.getElementById('maintenanceBanner');
      var msg = document.getElementById('maintenanceMsg');
      var win = document.getElementById('mtgWindow');
      if (s.maintenance) {
        support.maintenance = true;
        var wl = windowLabel(s.maintenanceWindow || '00:00–08:00');
        if (win) win.textContent = '维护时间 ' + wl;
        if (msg) msg.textContent = '系统正在进行每日例行维护（' + wl + '），期间 AI 客服暂停服务。您仍可留言，客服将于上午8点恢复 AI 客服、上午9点恢复人工客服后优先回复您。';
        if (banner && !mtgDismissed) banner.hidden = false;
      } else {
        support.maintenance = false;
        mtgDismissed = false; // 非维护时段重置 dismissed
        if (banner) banner.hidden = true;
      }
    }).catch(function () {});
  }
  checkMaintenance();
  setInterval(checkMaintenance, 10000);
  // 关闭弹窗按钮
  var mtgCloseBtn = document.getElementById('mtgCloseBtn');
  if (mtgCloseBtn) {
    mtgCloseBtn.addEventListener('click', function () {
      var banner = document.getElementById('maintenanceBanner');
      if (banner) banner.hidden = true;
      mtgDismissed = true;
    });
  }

  // 每次转人工都生成全新会话 ID，确保人工客服始终是全新对话
  var humanSessionId = null;
  function newSessionId() {
    return 'JD' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  var SESSIONS_KEY = 'jc_sessions';

  function readSessions() {
    try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function writeSessions(s) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(s));
    // 跨设备实时同步：把最新会话快照推送到 Supabase
    window.JC.setSessions(s);
  }
  function upsertSession(sess) {
    var all = readSessions();
    all[sess.id] = sess;
    writeSessions(all);
  }
  function getSession(id) { return readSessions()[id]; }

  function initSupport() {
    var panel = document.getElementById('supportPanel');
    var body = document.getElementById('supportBody');
    var quick = document.getElementById('supportQuick');
    var form = document.getElementById('supportForm');
    var input = document.getElementById('supportInput');
    var send = document.getElementById('supportSend');
    var title = document.getElementById('supportTitle');
    var status = document.getElementById('supportStatus');
    var switchBtn = document.getElementById('switchToAgent');
    var endChatBtn = document.getElementById('endChatBtn');
    var closeBtn = document.getElementById('supportClose');
    var openBtn = document.getElementById('openSupportBtn');
    var footerBtn = document.getElementById('openChatFooter');

    // 跨设备实时同步：以 Supabase 为权威数据源，轮询拉取变更
    function applyRemote(all) {
      if (all && typeof all === 'object') {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
      }
      if (support.mode === 'human') renderSupportLine();
    }
    function pullRemote() {
      window.JC.getSessions().then(applyRemote);
    }
    pullRemote();
    setInterval(pullRemote, 5000);

    // 快捷提问（AI 模式显示）
    quick.innerHTML = MOCK.chat.quickQuestions.map(function (q) {
      return '<button class="quick-btn" type="button" data-q="' + escapeHTML(q) + '">' + escapeHTML(q) + '</button>';
    }).join('');

    function scrollBottom() { body.scrollTop = body.scrollHeight; }

    function appendMsg(role, text) {
      var div = document.createElement('div');
      div.className = 'msg msg--' + role;
      div.textContent = text;
      body.appendChild(div);
      scrollBottom();
      return div;
    }

    function appendTyping() {
      var div = document.createElement('div');
      div.className = 'msg msg--typing';
      div.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(div);
      scrollBottom();
      return div;
    }

    function open() {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (!support.greeted) {
        support.greeted = true;
        appendMsg('bot', MOCK.chat.greeting);
      }
      if (support.mode === 'human') renderSupportLine();
      setTimeout(function () { input.focus(); }, 150);
      scrollBottom();
    }
    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }

    // 人工会话：从会话消息全量重绘
    function renderSupportLine() {
      var s = getSession(humanSessionId);
      body.innerHTML = '';
      if (!s || !s.messages || !s.messages.length) {
        appendMsg('sys', '尚未有消息，请输入你的问题。');
        return;
      }
      s.messages.forEach(function (m) {
        var role = m.role === 'customer' ? 'user' : (m.role === 'agent' ? 'bot' : 'sys');
        appendMsg(role, m.content);
      });
    }

    // 转人工
    function transferToAgent() {
      if (support.mode === 'human' || support.mode === 'leave') return;
      // 维护模式（0:00–8:00）：显示留言表单
      if (support.maintenance) {
        support.mode = 'leave';
        title.textContent = '净垢灵 人工客服';
        status.innerHTML = '<i></i> 系统维护 · 留言';
        switchBtn.hidden = true;
        endChatBtn.hidden = false;
        quick.hidden = true;
        form.style.display = 'none';
        var leaveBox = document.getElementById('supportLeave');
        var leaveTip = document.getElementById('leaveTip');
        leaveTip.textContent = '系统正在维护中（0:00–8:00），请留下您的姓名、手机号和问题，客服上班后将优先回复您。';
        leaveBox.hidden = false;
        appendMsg('sys', '系统正在维护中（0:00–8:00）。请留下您的姓名、手机号和问题，客服上班后（9:00）将优先与您联系。');
        return;
      }
      // 非服务时间：显示留言表单
      if (!isWithinServiceHours()) {
        support.mode = 'leave';
        title.textContent = '净垢灵 人工客服';
        status.innerHTML = '<i></i> 非服务时间 · 留言';
        switchBtn.hidden = true;
        endChatBtn.hidden = false;
        quick.hidden = true;
        form.style.display = 'none';
        var leaveBox = document.getElementById('supportLeave');
        var leaveTip = document.getElementById('leaveTip');
        leaveTip.textContent = MOCK.chat.offHoursTip;
        leaveBox.hidden = false;
        appendMsg('sys', MOCK.chat.offHoursTip);
        return;
      }
      support.mode = 'human';
      title.textContent = '净垢灵 人工客服';
      status.innerHTML = '<i></i> 人工客服 · 实时回复';
      switchBtn.hidden = true;
      endChatBtn.hidden = false;

      body.innerHTML = '';
      humanSessionId = newSessionId();
      var s = { id: humanSessionId, name: '顾客', productLine: currentLineName(), messages: [] };
      s.messages.push({ role: 'system', content: '已转接人工客服，咨询产品型号：' + currentLineName() + '。', ts: Date.now() });
      s.updatedAt = Date.now();
      // 清除之前所有会话，只保留当前这一条全新对话
      var fresh = {};
      fresh[humanSessionId] = s;
      writeSessions(fresh);
      renderSupportLine();
      appendMsg('sys', '已为您转接人工客服，请直接描述您的问题，客服会尽快回复您。');
    }

    // 结束人工/留言模式：回到 AI 模式并通知后台
    function resetToAI() {
      support.mode = 'ai';
      title.textContent = '净垢灵 AI 客服';
      status.innerHTML = '<i></i> 智能客服 · 秒回';
      switchBtn.disabled = false;
      switchBtn.textContent = '转人工客服';
      switchBtn.hidden = false;
      endChatBtn.hidden = true;
      quick.hidden = false;
      form.style.display = '';
      document.getElementById('supportLeave').hidden = true;
    }

    function endManualChat() {
      if (support.mode === 'leave') {
        resetToAI();
        appendMsg('sys', '已取消留言。如需继续，可再次咨询 AI 客服或重新转人工。');
        return;
      }
      if (support.mode !== 'human') return;
      var s = getSession(humanSessionId);
      if (s) {
        s.messages.push({ role: 'system', content: '顾客已结束对话', ts: Date.now() });
        s.updatedAt = Date.now();
        upsertSession(s);
      }
      resetToAI();
      appendMsg('sys', '人工对话已结束。如需继续，可再次咨询 AI 客服或重新转人工。');
    }

    // 发送消息
    function sendMessage(text) {
      text = (text || '').trim();
      if (!text) return;
      input.value = '';
      send.disabled = true;

      if (support.mode === 'human') {
        var s = getSession(humanSessionId) || { id: humanSessionId, name: '顾客', productLine: currentLineName(), messages: [] };
        s.messages.push({ role: 'customer', content: text, ts: Date.now() });
        s.updatedAt = Date.now();
        upsertSession(s);
        renderSupportLine();
        send.disabled = false;
        input.focus();
        return;
      }

      // AI 模式：维护期间直接提示留言
      if (support.maintenance) {
        appendMsg('user', text);
        appendMsg('bot', '系统正在维护中（0:00–8:00），AI 客服暂停服务。请点击「转人工客服」留下您的姓名、手机号和问题，客服上班后（9:00）将优先与您联系。');
        send.disabled = false;
        input.focus();
        return;
      }

      // AI 模式：本地关键词 + 预留真实接口
      appendMsg('user', text);
      var typing = appendTyping();
      API.askAI(text, []).then(function (res) {
        typing.remove();
        var reply = (res && res.reply) || MOCK.answerFor(text);
        appendMsg('bot', reply);
        send.disabled = false;
        input.focus();
        // 顾客说「转人工」且在服务时间内：AI 回复后自动转接
        if (/转人工|人工客服|找人工|真人客服/.test(text) && isWithinServiceHours()) {
          setTimeout(function () {
            appendMsg('sys', '正在为您转接人工客服…');
            transferToAgent();
          }, 800);
        }
      });
    }

    openBtn.addEventListener('click', open);
    if (footerBtn) footerBtn.addEventListener('click', function () {
      var target = document.getElementById('buy');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      setTimeout(open, 400);
    });
    closeBtn.addEventListener('click', closePanel);
    switchBtn.addEventListener('click', transferToAgent);
    endChatBtn.addEventListener('click', endManualChat);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage(input.value);
    });
    quick.addEventListener('click', function (e) {
      var btn = e.target.closest('.quick-btn');
      if (btn && support.mode === 'ai') sendMessage(btn.getAttribute('data-q'));
    });

    // 留言表单提交
    var leaveForm = document.getElementById('leaveForm');
    leaveForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('leaveName').value.trim();
      var phone = document.getElementById('leavePhone').value.trim();
      var msg = document.getElementById('leaveMessage').value.trim();
      if (!name) { showToast('请填写您的姓名'); return; }
      if (!phone || !/^1\d{10}$/.test(phone)) { showToast('请填写正确的手机号码'); return; }
      humanSessionId = newSessionId();
      var s = {
        id: humanSessionId,
        name: name,
        phone: phone,
        productLine: currentLineName(),
        type: 'leave-message',
        messages: [
          { role: 'system', content: '顾客在非服务时间留言（9:00–21:00 外），请在工作时间内回复。', ts: Date.now() },
          { role: 'customer', content: '姓名：' + name + '　手机：' + phone + (msg ? '　留言：' + msg : ''), ts: Date.now() + 1 }
        ]
      };
      s.updatedAt = Date.now();
      var fresh = {};
      fresh[humanSessionId] = s;
      writeSessions(fresh);
      appendMsg('sys', '留言已提交，客服将在工作时间内（9:00–21:00）优先与您联系。');
      document.getElementById('supportLeave').hidden = true;
      endChatBtn.hidden = true;
      // 清空表单
      document.getElementById('leaveName').value = '';
      document.getElementById('leavePhone').value = '';
      document.getElementById('leaveMessage').value = '';
      support.mode = 'ai';
      title.textContent = '净垢灵 AI 客服';
      status.innerHTML = '<i></i> 智能客服 · 秒回';
      switchBtn.hidden = false;
      quick.hidden = false;
      form.style.display = '';
    });
  }

  /* ============ 启动 ============ */
  document.addEventListener('DOMContentLoaded', function () {
    renderScenarios();
    renderFeatures();
    renderSteps();
    renderCertifications();
    renderIngredients();
    renderFaqs();
    renderProductLines();
    initNav();
    initBuy();
    initSupport();

    // 企业内部使用公告弹窗：页面加载即展示
    var noticeModal = document.getElementById('internalNoticeModal');
    if (noticeModal) noticeModal.hidden = false;
    var noticeClose = document.getElementById('internalNoticeClose');
    if (noticeClose) {
      noticeClose.addEventListener('click', function () {
        noticeModal.hidden = true;
      });
    }

    // 刷新按钮（手机端）：强制刷新跳过缓存
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        location.reload(true);
      });
    }
  });
})();