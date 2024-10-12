const proxy = [
    {
      context: '/api',
      target: 'http://thisisshuffletv.zapto.org:5091',
      pathRewrite: {'^/api' : ''}
    }
  ];
  module.exports = proxy;