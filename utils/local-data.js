function getTimeLabel() {
  const date = new Date();
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildAssistantReply(content) {
  if (content.includes('害怕') || content.includes('担心')) {
    return '害怕是很真实的反应，不代表你不够勇敢。现在先把最担心的那件事说清楚，小元会陪你把它拆开来看。';
  }

  if (content.includes('睡') || content.includes('失眠')) {
    return '睡不着时情绪会被放大，先不用要求自己立刻放松。你可以先把脑子里最吵的那个念头说出来，我们一起把它放到更可处理的位置。';
  }

  if (content.includes('家人') || content.includes('爸爸') || content.includes('妈妈')) {
    return '你在意家人的感受，也说明你一直在努力保护关系。可以先把“我现在有点难受，但你不用马上替我解决”这样的话说出来，沟通会更轻一点。';
  }

  return '我看到你已经把感受说出来了，这一步很重要。你可以继续说当下最压着你的那个点，小元会接着陪你往下梳理。';
}

function createChatBootstrap() {
  return {
    conversationId: 'conv-demo-001',
    assistantProfile: {
      name: '小元',
      roleTitle: '癌症情绪支持陪伴助手',
      statusText: '在线陪伴中',
      intro:
        '小元提供情绪支持会话、历史浏览和个人偏好服务，前端已接入会话初始化、消息发送、历史查询和个人配置接口。',
    },
    messages: [
      {
        id: 101,
        role: 'assistant',
        content: '你好，我是小元。这里是你的情绪支持会话空间，你可以直接说出现在最难受的感受。',
        time: '20:30',
      },
      {
        id: 102,
        role: 'assistant',
        content: '如果你愿意，我们可以从“今天最压着你的那件事”开始聊。',
        time: '20:31',
      },
    ],
    hasMoreHistory: true,
    nextMessageId: 103,
  };
}

function createHistoryMessages() {
  return [
    {
      id: 91,
      role: 'assistant',
      content: '你不需要一个人把所有情绪都扛住，我们可以先从最难受的那部分开始。',
      time: '20:25',
    },
    {
      id: 92,
      role: 'user',
      content: '这几天总觉得很累，也不知道怎么和家里人说。',
      time: '20:26',
    },
    {
      id: 93,
      role: 'assistant',
      content: '能说出这句话已经很不容易了。我们先不急着解决全部问题，先聊你最怕他们听到什么。',
      time: '20:27',
    },
  ];
}

function createChatReply(payload) {
  const content = payload && payload.content ? payload.content : '';
  return {
    replyMessage: {
      id: Date.now(),
      role: 'assistant',
      content: buildAssistantReply(content),
      time: getTimeLabel(),
      loading: false,
    },
    conversationId: payload && payload.conversationId ? payload.conversationId : 'conv-demo-001',
    assistantStatus: '在线陪伴中',
  };
}

function createSessionList() {
  return [
    {
      id: 1,
      title: '夜间情绪安抚',
      preview: '围绕睡眠压力、复查担忧和与家人的沟通方式进行了支持会话。',
      time: '昨天 22:18',
      mood: '需要安抚',
      moodClass: 'session-tag--warm',
    },
    {
      id: 2,
      title: '复诊前焦虑整理',
      preview: '帮助梳理复诊前的担忧点，并形成待沟通问题清单。',
      time: '周四 18:46',
      mood: '慢慢平稳',
      moodClass: 'session-tag--calm',
    },
    {
      id: 3,
      title: '家庭沟通支持',
      preview: '整理与家属沟通时的表达顺序和情绪边界，减轻“怕拖累别人”的压力。',
      time: '周二 09:12',
      mood: '持续支持',
      moodClass: 'session-tag--warm',
    },
  ];
}

function createProfileCards() {
  return [
    {
      title: '会话偏好',
      desc: '设置小元回复风格、安抚节奏、重点提醒和是否优先共情。',
      action: '管理',
    },
    {
      title: '紧急支持',
      desc: '维护热线、医院联系人和一键求助入口，便于在高压场景中快速触达支持资源。',
      action: '查看',
    },
    {
      title: '消息与提醒',
      desc: '管理复诊提醒、情绪记录、睡眠观察和系统通知策略。',
      action: '配置',
    },
  ];
}

module.exports = {
  createChatBootstrap,
  createHistoryMessages,
  createChatReply,
  createSessionList,
  createProfileCards,
};
