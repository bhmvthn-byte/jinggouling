/* ============================================================
   api.js — API 存根层（前端与后端唯一接缝）
   签名、延迟、加载/错误形态与真实接口一致；后续接入后端只需改动本文件内部实现。
   注意：本原型为纯静态展示，默认走本地演示回复，不连接真实后端。
   ============================================================ */
(function () {
  'use strict';

  /* ============ 接入真实 AI 客服：只需改这里的配置 ============ */
  window.API_CONFIG = {
    // 改为 true 即走真实 AI 接口，false 走本地关键词演示逻辑
    enabled: false,
    // 你的后端 AI 代理地址（强烈建议用你自己的服务端代理，保护密钥）
    endpoint: '',                       // 例：'https://your-server.com/api/ai/chat'
    method: 'POST',
    model: ''                           // 例：'gpt-4o-mini' / 'deepseek-chat' 等
  };

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  /* ============ AI 客服对话 ============
   * TODO: 替换为真实 AI 对话接口
   *   方法:   POST
   *   路径:   /api/ai/chat
   *   请求体: { messages: [{role:'user'|'assistant', content:string}], productId:'jingchang', model:string }
   *   响应体: { reply: string }
   * 见 contract/openapi.yaml 与 contract/endpoint-map.md
   */
  async function askAI(message, history) {
    await delay(650); // 模拟网络延迟，让「正在输入」状态可见

    if (window.API_CONFIG.enabled && window.API_CONFIG.endpoint) {
      try {
        var res = await fetch(window.API_CONFIG.endpoint, {
          method: window.API_CONFIG.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: (history || []).concat([{ role: 'user', content: message }]),
            productId: 'jingchang',
            model: window.API_CONFIG.model || undefined
          })
        });
        var data = await res.json();
        var reply = (data && (data.reply || (data.data && data.data.reply))) || '';
        if (reply) return { reply: reply };
        throw new Error('empty reply');
      } catch (err) {
        // 真实接口失败时回退本地演示回复，避免客服面板空白
        return { reply: window.MOCK.answerFor(message) };
      }
    }

    return { reply: window.MOCK.answerFor(message) };
  }

  /* ============ 下单（购买） ============
   * TODO: 替换为真实下单接口
   *   方法:   POST
   *   路径:   /api/orders
   *   请求体: { productId:string, qty:number, contact:string }
   *   响应体: { code:0, orderNo:string }
   */
  async function createOrder(payload) {
    await delay(700);
    return {
      code: 0,
      orderNo: 'JC' + Date.now(),
      message: '下单成功（演示）'
    };
  }

  window.API = {
    askAI: askAI,
    createOrder: createOrder
  };
})();