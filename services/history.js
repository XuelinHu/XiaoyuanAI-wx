const { requestWithFallback } = require('../utils/request');
const { createSessionList } = require('../utils/local-data');

function fetchSessionList() {
  return requestWithFallback({
    url: '/conversation/list',
    method: 'GET',
    fallback() {
      return {
        sessions: createSessionList(),
      };
    },
  });
}

module.exports = {
  fetchSessionList,
};
