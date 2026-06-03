const { backendConfig } = require('../config/index');

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${backendConfig.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || backendConfig.timeout,
      header: Object.assign(
        {
          'content-type': 'application/json',
          'x-tenant-code': backendConfig.tenantCode,
        },
        options.header || {}
      ),
      success(response) {
        const { statusCode, data } = response;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(data);
          return;
        }
        reject({
          message: '接口请求失败',
          response,
        });
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

async function requestWithFallback(options) {
  try {
    return await request(options);
  } catch (error) {
    if (!backendConfig.useLocalFallback || typeof options.fallback !== 'function') {
      throw error;
    }
    return options.fallback(error);
  }
}

module.exports = {
  request,
  requestWithFallback,
};
