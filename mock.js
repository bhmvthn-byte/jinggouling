/* ============================================================
   mock.js — 单一数据源（品牌官网所有展示数据 + AI 客服预置语料）
   统一通过 window.MOCK 暴露；页面 UI 不直接硬编码文案。
   ============================================================ */
(function () {
  'use strict';

  /* ---- 统一图标（Lucide 风格内联 SVG，离线可用，无 CDN） ---- */
  var ICONS = {
    droplet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 2.69 17.66 8.35a8 8 0 1 1-11.32 0L12 2.69Z"/>' +
      '</svg>',
    'shield-check':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.18 1.18 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>' +
      '<path d="m9 12 2 2 4-4"/>' +
      '</svg>',
    sparkles:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94a2 2 0 0 0 1.44-1.44l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>' +
      '</svg>',
    zap:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>' +
      '</svg>',
    leaf:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>' +
      '<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>' +
      '</svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6 9 17l-5-5"/>' +
      '</svg>',
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="m6 9 6 6 6-6"/>' +
      '</svg>'
  };

  /* ---- 产品基础信息 ---- */
  var product = {
    brand: '净垢灵',
    brandEn: 'JINGGOULING',
    name: '净垢灵除垢剂',
    tagline: '除垢 · 除菌 · 养护，饮水机 / 咖啡机 / 蒸饭机 分线更专业',
    priceNow: '¥49.9',
    priceOld: '¥79.9'
  };

  /* ---- 适用设备（三款独立产品：饮水机 / 咖啡机 / 蒸饭机） ---- */
  var devices = [
    { id: 'water-dispenser', name: '净垢灵饮水机除垢剂', short: '饮水机', desc: '针对桶装水饮水机、即热式管线机、下置桶饮水机的水路与内胆水垢、细菌、陈水异味分线清洁。' },
    { id: 'coffee-machine', name: '净垢灵咖啡机除垢剂', short: '咖啡机', desc: '针对意式半自动/全自动咖啡机、胶囊咖啡机与滴漏咖啡机的水箱与加热管路除垢除菌养护。' },
    { id: 'rice-steamer', name: '净垢灵蒸饭机除垢剂', short: '蒸饭机', desc: '针对电蒸箱、蒸饭柜、蒸饭车等蒸饭设备水箱与加热盘的水垢、细菌与异味分线清洁。' }
  ];

  /* ---- 产品线（除垢 / 除菌 / 养护三条功能分线） ---- */
  var scenarios = [
    { id: 'descale', icon: 'droplet', title: '除垢剂', short: '除垢', desc: '快速瓦解水路与水胆内的水垢沉积，恢复出水流速与加热效率，适用于饮水机、咖啡机、蒸饭机。' },
    { id: 'sterilize', icon: 'shield-check', title: '除菌剂', short: '除菌', desc: '深入内胆管路除菌，减少二次污染，让直饮更安心，适用于饮水机、咖啡机、蒸饭机。' },
    { id: 'maintain', icon: 'sparkles', title: '养护剂', short: '养护', desc: '日常去味养护，抑制陈水异味，延长设备使用寿命，适用于饮水机、咖啡机、蒸饭机。' }
  ];

  /* ---- 产品亮点 ---- */
  var features = [
    { icon: 'zap', title: '强效除垢', desc: '快速瓦解水垢与矿物沉积，清洁更彻底。' },
    { icon: 'shield-check', title: '食品级安全', desc: '食品级原料配方，接触饮水部件也安心。' },
    { icon: 'leaf', title: '除菌抑味', desc: '抑制细菌滋生，去除陈水异味，出水清甜。' },
    { icon: 'sparkles', title: '简捷省力', desc: '免拆机、免通电，几分钟完成整机清洁。' }
  ];

  /* ---- 使用步骤 ---- */
  var steps = [
    { title: '注水加剂', desc: '内胆注满水，按 1:50～1:100 加入除垢剂，打开排气孔。' },
    { title: '升温断电', desc: '加热水至 45–55°C，随后关闭设备电源。' },
    { title: '浸泡刷洗', desc: '浸泡 20–30 分钟或毛刷刷洗，再排干内胆水。' },
    { title: '清水冲洗', desc: '用清水冲洗 2–3 遍并排放干净，完成清洗。' },
    { title: '顽固水垢', desc: '对于较厚的水垢，按需重复步骤 1–3。' }
  ];

  /* ---- 成分 ---- */
  var ingredients = [
    { name: '食品级柠檬酸', note: '溶解水垢，温和除垢' },
    { name: '可降解表面活性剂', note: '高效去污，安全分解' },
    { name: '温和抑菌成分', note: '抑制细菌，减少二次污染' },
    { name: '碳酸氢钠', note: '中和异味，辅助清洁' },
    { name: '植物精油', note: '清爽留香，净味安心' },
    { name: '去离子水', note: '纯净载体，稳定配方' }
  ];

  /* ---- 安全认证 ---- */
  var certifications = [
    '通过广东省微生物分析检测中心安全检测',
    '食品级原料配方，可用作直饮接触',
    '除菌抑味，出水更安心',
    '温和无刺激，母婴家庭可用'
  ];

  /* ---- 常见问题 ---- */
  var faqs = [
    { q: '桶装水饮水机怎么清洗？', a: '选择「净垢灵饮水机除垢剂」：内胆注满水，按 1:50～1:100 加入除垢剂并打开排气孔；加热至 45–55°C 后断电，浸泡 20–30 分钟或毛刷刷洗；排干后用清水冲洗 2–3 遍并排放干净即可。' },
    { q: '产品是食品级吗？洗后可以直接喝水吗？', a: '是食品级原料配方，接触饮水部件也安全；清洗后务必用清水充分冲洗干净，即可正常饮用。' },
    { q: '多久除垢一次比较合适？', a: '建议每 6–12 个月定期除垢一次；水质偏硬或使用频繁时，可缩短到每 3–6 个月一次。' },
    { q: '不同品牌 / 机型都通用吗？', a: '净垢灵分为饮水机、咖啡机、蒸饭机三款设备除垢剂，请按设备类型选择对应型号；每款均适用于该设备下的桶装水、即热式、下置桶/管线机、胶囊/滴漏咖啡机、电蒸箱等常见机型。' },
    { q: '一次应该用多少剂量？', a: '按除垢剂与储水量 1:50～1:100 的比例用量（约每升水 10–20ml）；水垢较厚时可适当提高浓度并延长浸泡时间。' },
    { q: '即热式管线机能用吗？', a: '可以，选择「净垢灵饮水机除垢剂」。断电后按 1:50～1:100 稀释注入，重点浸泡加热管路 20–30 分钟，再用清水冲洗 2–3 遍干净即可。' },
    { q: '咖啡机、蒸饭机也能用吗？', a: '可以，净垢灵分别推出「净垢灵咖啡机除垢剂」和「净垢灵蒸饭机除垢剂」。断电后按 1:50～1:100 稀释加入水箱或内胆，浸泡 20–30 分钟，再用清水冲洗 2–3 遍并排放干净即可。' }
  ];

  /* ---- AI 客服语料 ---- */
  var greeting = '你好，我是净垢灵 AI 客服。有关饮水机、咖啡机、蒸饭机的除垢、除菌养护、剂量用法或下单，都可以问我。人工客服服务时间：9:00–21:00。';

  var quickQuestions = ['饮水机怎么清洗？', '是食品级吗？', '多久除垢一次？', '如何购买下单？'];

  /* ---- 客服服务时间 ---- */
  var serviceHours = { start: 9, end: 21, label: '9:00–21:00' };

  /* ---- 非服务时间提示 ---- */
  var offHoursTip = '当前为非人工客服服务时间（9:00–21:00），如需人工咨询请留下您的姓名、手机号和问题，客服将在工作时间内优先回复您。';

  var qa = [
    {
      k: ['咖啡机', '咖啡', '胶囊', '意式', '半自动', '全自动', '滴漏'],
      r: '可用「净垢灵咖啡机除垢剂」：断电后按 1:50～1:100 稀释加入水箱，运行清洗程序或浸泡 20–30 分钟，再用清水反复冲洗 2–3 遍并排放干净即可。食品级原料配方，接触部件也安全。'
    },
    {
      k: ['蒸饭机', '蒸饭', '蒸箱', '蒸饭柜', '蒸饭车'],
      r: '可用「净垢灵蒸饭机除垢剂」：断电后按 1:50～1:100 稀释加入水箱或内胆，浸泡 20–30 分钟，再用清水冲洗 2–3 遍并排放干净即可。食品级原料配方，接触部件也安全。'
    },
    {
      k: ['怎么洗', '清洗', '步骤', '方法', '使用', '冲洗', '浸泡'],
      r: '通用清洗步骤：①内胆/水箱注满水，按 1:50～1:100 加除垢剂并打开排气孔；②加热至 45–55°C 后断电；③浸泡 20–30 分钟或毛刷刷洗后排干；④清水冲洗 2–3 遍并排放干净。饮水机、咖啡机、蒸饭机均适用。'
    },
    {
      k: ['食品级', '能不能喝', '能喝', '直接喝', '安全吗', '有毒', '残留'],
      r: '净垢灵为食品级原料配方，接触设备部件也安全；清洗后充分冲洗干净即可正常使用。'
    },
    {
      k: ['除垢', '水垢', '垢', '硬水', '结垢'],
      r: '除垢建议每 6–12 个月一次；水质偏硬或使用频繁可缩短到每 3–6 个月一次。首次清洗或水垢较厚时可提高浓度并延长浸泡时间。'
    },
    {
      k: ['除菌', '细菌', '消毒', '杀菌', '污染'],
      r: '净垢灵除菌剂可深入内胆管路减少二次污染；搭配每月一次的定期养护，设备使用更安心。'
    },
    {
      k: ['多久', '频率', '周期', '几次'],
      r: '建议每 6–12 个月定期除垢，日常养护每 3–6 个月 1 次；水质偏硬或使用频繁时适当加密。'
    },
    {
      k: ['剂量', '多少', '用量', '毫升', 'ml', '一次倒'],
      r: '按除垢剂与储水量 1:50～1:100 的比例用量（约每升水 10–20ml）；水垢较厚时可提高浓度并延长浸泡时间。'
    },
    {
      k: ['机型', '通用', '品牌', '管线机', '即热', '桶装', '下置', '净水壶', '买哪个'],
      r: '净垢灵分为饮水机、咖啡机、蒸饭机三款除垢剂，请按设备类型选择：饮水机选「饮水机除垢剂」，咖啡机选「咖啡机除垢剂」，蒸饭机选「蒸饭机除垢剂」。'
    },
    {
      k: ['买', '购买', '下单', '价格', '多少钱', '哪里买', '如何买', '怎么买'],
      r: '请点击页面下方「在线客服」按钮，转人工客服协助您下单。现在下单享 6.2 折 ¥49.9，7 天无理由退换、全国包邮。'
    },
    {
      k: ['养护', '保养', '异味', '味道', '陈水', '去味'],
      r: '日常养护剂可抑制陈水异味、保持设备清爽；建议每月 1 次，配合除垢使用效果更佳。'
    }
  ];

  var fallback = '这个问题我记下了。你可以换个问法，如「饮水机怎么清洗」「是食品级吗」「多久除垢一次」，或点击下方快捷提问。如需人工协助，可拨打客服热线 400-800-1234。';

  /* ---- AI 客服：关键词匹配回复（真实接口接入前的演示逻辑） ---- */
  function isWithinServiceHours() {
    var h = new Date().getHours();
    return h >= serviceHours.start && h < serviceHours.end;
  }

  function answerFor(raw) {
    var text = String(raw || '').toLowerCase();

    // 转人工 / 人工客服
    if (/转人工|人工|真人|客服小姐姐|人工客服/.test(text)) {
      if (isWithinServiceHours()) {
        return '人工客服服务时间为每天 ' + serviceHours.label + '，当前在线，正在为您转接人工客服，请稍候。';
      } else {
        return '当前为非人工客服服务时间（' + serviceHours.label + '），请您点击「转人工客服」按钮，留下您的姓名、手机号和问题，客服将在工作时间内优先与您联系。';
      }
    }

    // 上班时间 / 服务时间
    if (/上班|几点|服务时间|营业|几点上班|什么时间|工作时间|下班|几点下班/.test(text)) {
      if (isWithinServiceHours()) {
        return '人工客服服务时间为每天 ' + serviceHours.label + '，当前在线，欢迎咨询。如需转人工，请点击「转人工客服」按钮。';
      } else {
        return '人工客服服务时间为每天 ' + serviceHours.label + '，当前为非服务时间。请您留下姓名、手机号和问题，客服将在上班后优先与您联系。';
      }
    }

    // 非服务时间：所有回复末尾追加留言提示
    var result = fallback;
    for (var i = 0; i < qa.length; i++) {
      var item = qa[i];
      for (var j = 0; j < item.k.length; j++) {
        if (text.indexOf(item.k[j].toLowerCase()) !== -1) {
          result = item.r;
          break;
        }
      }
      if (result !== fallback) break;
    }
    if (!isWithinServiceHours() && result === fallback) {
      result = '当前为非人工客服服务时间（' + serviceHours.label + '）。您可以先参考以上回答，如需进一步咨询，请点击「转人工客服」留下您的姓名、手机号和问题，客服将在工作时间内回复您。';
    }
    return result;
  }

  window.MOCK = {
    ICONS: ICONS,
    product: product,
    devices: devices,
    scenarios: scenarios,
    features: features,
    steps: steps,
    ingredients: ingredients,
    certifications: certifications,
    faqs: faqs,
    chat: {
      greeting: greeting,
      quickQuestions: quickQuestions,
      serviceHours: serviceHours,
      offHoursTip: offHoursTip,
      isWithinServiceHours: isWithinServiceHours
    },
    answerFor: answerFor
  };
})();