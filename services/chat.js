const { requestWithFallback } = require('../utils/request');
const { createChatBootstrap, createHistoryMessages, createChatReply } = require('../utils/local-data');

function fetchConversationBootstrap() {
  return requestWithFallback({
    url: '/conversation/bootstrap',
    method: 'GET',
    fallback() {
      return createChatBootstrap();
    },
  });
}

function fetchAssistantProfile() {
  return requestWithFallback({
    url: '/assistant/profile',
    method: 'GET',
    fallback() {
      return createChatBootstrap().assistantProfile;
    },
  });
}

function fetchConversationHistory(payload) {
  return requestWithFallback({
    url: '/conversation/history',
    method: 'GET',
    data: payload,
    fallback() {
      return {
        messages: createHistoryMessages(),
        hasMoreHistory: false,
      };
    },
  });
}

function sendConversationMessage(payload) {
  return requestWithFallback({
    url: '/conversation/message',
    method: 'POST',
    data: payload,
    fallback() {
      return createChatReply(payload);
    },
  });
}

module.exports = {
  fetchConversationBootstrap,
  fetchAssistantProfile,
  fetchConversationHistory,
  sendConversationMessage,
};
