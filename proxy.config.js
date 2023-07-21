const proxy = [
    {
      context: '/api',
      target: 'http://casadopier.ddns.net:5000',
      pathRewrite: {'^/api' : ''}
    }
  ];
  module.exports = proxy;