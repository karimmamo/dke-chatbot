const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const targets = [
    process.env.ZAPIER_WEBHOOK,
    process.env.CLOSE_WEBHOOK
  ].filter(url => url && !url.includes('_HIER'));

  await Promise.all(targets.map(url => {
    return new Promise((resolve) => {
      const parsed = new URL(url);
      const req = https.request({
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, () => resolve());
      req.on('error', () => resolve());
      req.write(event.body);
      req.end();
    });
  }));

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ok: true })
  };
};
