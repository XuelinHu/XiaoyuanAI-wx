const { requestWithFallback } = require('../utils/request');
const { createProfileCards } = require('../utils/local-data');

function fetchProfileCards() {
  return requestWithFallback({
    url: '/profile/cards',
    method: 'GET',
    fallback() {
      return {
        items: createProfileCards(),
      };
    },
  });
}

module.exports = {
  fetchProfileCards,
};
