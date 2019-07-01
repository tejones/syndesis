/* tslint:disable */
const proxy = require('http-proxy-middleware');
const path = require('path');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

module.exports = function(app) {
  if (process.env.BACKEND) {
    function chaos(req, res, next) {
      const p = getRandomInt(0, 100);
      if (process.env.CHAOS && p > 50) {
        res.status(500).send('Something broke!');
        next('route');
      } else {
        next();
      }
    }

    const apiProxy = proxy({
      target: process.env.BACKEND,
      secure: false,
      changeOrigin: true,
      ws: !process.env.PROXY_NO_WS,
      headers: {
        'X-Forwarded-Origin': 'for=127.0.0.1;host=localhost:3000;proto=https',
        'X-Forwarded-Access-Token': 'supersecret',
        Cookie: process.env.BACKEND_COOKIE || '',
      },
    });

    ['/api/v1', '/vdb-builder/v1'].forEach(url => {
      app.use(url, chaos, apiProxy);
    });

    app.use('/logout', (req, res) => {
      res.clearCookie('_oauth_proxy', {
        domain: req.headers.referrer,
        path: '/',
      });
      res.sendFile(path.join(__dirname, '..', '/public/logout.html'));
    });
  }
};
