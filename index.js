const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * req-node: Lightweight HTTP/S Request Module
 * Built by Biono Samsun
 */

class ReqNode {
  constructor(defaults = {}) {
    this.defaults = {
      timeout: 10000,
      retries: 0,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'req-node/1.0'
      },
      ...defaults
    };
  }

  async request(url, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      headers: { ...this.defaults.headers, ...options.headers }
    };

    const targetUrl = new URL(url);
    let currentRetry = 0;

    const execute = () => {
      return new Promise((resolve, reject) => {
        const protocol = targetUrl.protocol === 'https:' ? https : http;

        const req = protocol.request(targetUrl.href, config, (res) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            clearTimeout(timer);
            const raw = Buffer.concat(chunks).toString();

            resolve({
              status: res.statusCode,
              ok: res.statusCode >= 200 && res.statusCode < 300,
              headers: res.headers,
              text: () => Promise.resolve(raw),
              json: () => {
                try {
                  return Promise.resolve(JSON.parse(raw));
                } catch (e) {
                  return Promise.reject(new Error("Gagal parsing JSON. Pastikan respon server berupa JSON."));
                }
              }
            });
          });
        });

        const timer = setTimeout(() => {
          req.destroy();
          reject(new Error(`Request Timeout (${config.timeout}ms)`));
        }, config.timeout);

        req.on('error', (err) => {
          clearTimeout(timer);
          reject(err);
        });

        if (config.body) {
          const payload = typeof config.body === 'object' 
            ? JSON.stringify(config.body) 
            : config.body;
          
          if (!config.headers['Content-Length'] && !config.headers['content-length']) {
            req.setHeader('Content-Length', Buffer.byteLength(payload));
          }
          
          req.write(payload);
        }

        req.end();
      });
    };

    while (true) {
      try {
        return await execute();
      } catch (err) {
        if (currentRetry < config.retries) {
          currentRetry++;
          await new Promise(res => setTimeout(res, 1000));
          continue;
        }
        throw err;
      }
    }
  }
}

const instance = new ReqNode();

/**
 * Export sebagai fungsi utama agar bisa dipanggil req("url")
 */
const req = (url, options) => instance.request(url, options);

req.get = (url, options) => instance.request(url, { ...options, method: 'GET' });
req.post = (url, body, options) => instance.request(url, { ...options, method: 'POST', body });
req.put = (url, body, options) => instance.request(url, { ...options, method: 'PUT', body });
req.patch = (url, body, options) => instance.request(url, { ...options, method: 'PATCH', body });
req.delete = (url, options) => instance.request(url, { ...options, method: 'DELETE' });

req.create = (config) => {
  const newInstance = new ReqNode(config);
  const newReq = (url, options) => newInstance.request(url, options);
  newReq.get = (url, options) => newInstance.request(url, { ...options, method: 'GET' });
  newReq.post = (url, body, options) => newInstance.request(url, { ...options, method: 'POST', body });
  return newReq;
};

module.exports = req;
