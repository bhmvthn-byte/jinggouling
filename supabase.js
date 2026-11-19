/* =====================================================================
 * 净垢灵网站 · Supabase 数据层（替代原 Python 后端 server.py）
 *
 * 原后端提供的三个能力，这里用 Supabase 实现，前端通过 window.JC 访问：
 *   - /api/sessions  GET   -> JC.getSessions()   (Promise<object>)
 *   - /api/sessions  POST  -> JC.setSessions(s)  (Promise<boolean>)
 *   - /api/sessions  DELETE-> JC.clearSessions() (Promise<boolean>)
 *   - /api/status    GET   -> JC.getStatus()     (Promise<object>)
 *   - /api/events    SSE   -> 改为前端轮询（setInterval 定时 getSessions）
 *
 * 维护模式判断（原 server.py is_maintenance）移到前端本地计算：
 *   - 每日例行维护：0:00–8:00
 *   - 临时维护：每月 1 号 11:00–12:00
 * ===================================================================== */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://uxcanqumxlqkdlvjzfbu.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_LLurF13FExuLF_uv2lU1hA_B0tjVXz7';

  function getClient() {
    if (!window.supabase) return null;
    if (!window.__jcClient) {
      window.__jcClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.__jcClient;
  }

  // ---- 北京时间（中国标准时间 UTC+8，与访客设备时区无关）----
  function beijingNow() {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
  }

  // ---- 维护模式 ----
  function isMaintenance(now) {
    now = now || beijingNow();
    var h = now.getHours();
    var d = now.getDate();
    if (h >= 0 && h < 8) return true;                 // 每日例行维护
    if (d === 1 && h >= 11 && h < 12) return true;    // 临时维护（每月1号）
    return false;
  }

  function maintenanceType(now) {
    now = now || beijingNow();
    var h = now.getHours();
    var d = now.getDate();
    if (h >= 0 && h < 8) return 'daily';
    if (d === 1 && h >= 11 && h < 12) return 'monthly';
    return 'daily';
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function formatTime(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // ---- 会话数据读写（单行 JSON 快照，与原后端 SESSIONS 语义一致）----
  function getSessions() {
    var c = getClient();
    if (!c) return Promise.resolve({});
    return c.from('sessions_state').select('data').eq('id', 1).maybeSingle()
      .then(function (res) {
        if (res.error || !res.data) return {};
        return res.data.data || {};
      })
      .catch(function () { return {}; });
  }

  function setSessions(s) {
    var c = getClient();
    if (!c) return Promise.resolve(false);
    return c.from('sessions_state')
      .upsert({ id: 1, data: s, updated_at: new Date().toISOString() })
      .then(function (res) { return !res.error; })
      .catch(function () { return false; });
  }

  function clearSessions() {
    return setSessions({});
  }

  // ---- 状态（替代 /api/status）----
  function getStatus() {
    return getSessions().then(function (sessions) {
      var values = Object.keys(sessions).map(function (k) { return sessions[k]; });
      var leaveCount = values.filter(function (s) {
        return s && typeof s === 'object' && s.type === 'leave-message';
      }).length;
      var now = beijingNow();
      var maint = isMaintenance(now);
      return {
        maintenance: maint,
        maintenanceType: maintenanceType(now),
        maintenanceWindow: '00:00–08:00 / 每月1号 11:00–12:00',
        serviceHours: '9:00–21:00',
        uptime: '云端在线',
        sessionCount: values.length,
        leaveMessageCount: leaveCount,
        onlineConnections: 0,
        serverTime: formatTime(now),
        status: maint ? '维护中' : '运行中'
      };
    });
  }

  window.JC = {
    getSessions: getSessions,
    setSessions: setSessions,
    clearSessions: clearSessions,
    getStatus: getStatus,
    isMaintenance: isMaintenance,
    nowBeijing: function () { return formatTime(beijingNow()); }
  };
})();
