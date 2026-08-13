const PROXY_CONFIG = [
  {
    context: ['/files'],
    target: 'http://file-server:5091',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/files': '' },
    logLevel: 'debug'
  },
  {
    context: ['/mongodb'],
    target: 'http://backend-server:9091',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/mongodb': '' },
    ws: true,
    logLevel: 'debug'
  },
  {
    context: ['/api-nest'],
    target: 'http://backend-server-nest:3000',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/api-nest': '' },
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;
