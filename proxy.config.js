const proxy = [
    {
      context: '/api',
      target: 'http://shuffletv.ddns.net:5000',
      pathRewrite: {'^/api' : ''}
    }
  ];
  module.exports = proxy;