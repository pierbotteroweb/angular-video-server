const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'http://file-server:5091',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    logLevel: 'debug'
  },
  {
    context: ['/backend'],
    target: 'http://backend-server:9091',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/backend': '' },
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;
