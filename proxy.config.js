const proxy = [
    {
      context: '/api',
      target: 'http://thisisshuffletv:5091',
      pathRewrite: {'^/api' : ''}
    }
  ];
  module.exports = proxy;