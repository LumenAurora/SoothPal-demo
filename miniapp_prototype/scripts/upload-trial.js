const path = require('path');
const ci = require('miniprogram-ci');

async function run() {
  const appid = 'wxf8f500e291ca1d77';
  const privateKeyPath = process.env.MINIPROGRAM_PRIVATE_KEY_PATH || 'd:/Downloads/private.wxf8f500e291ca1d77.key';
  const projectPath = path.resolve(__dirname, '..');
  const version = process.env.MINIPROGRAM_VERSION || `prototype-${new Date().toISOString().slice(0, 10)}`;
  const desc = process.env.MINIPROGRAM_DESC || 'SoothPal 原型自动上传';
  const robot = Number(process.env.MINIPROGRAM_ROBOT || '1');

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  console.log('[upload] projectPath =', projectPath);
  console.log('[upload] version =', version);

  await ci.upload({
    project,
    version,
    desc,
    robot,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      minifyJS: true,
      minifyWXML: true,
      minifyWXSS: true,
      autoPrefixWXSS: true,
      uploadWithSourceMap: true,
    },
    onProgressUpdate: (task) => {
      if (typeof task.progress !== 'undefined') {
        console.log(`[upload] ${task.progress}%`);
      }
    },
  });

  console.log('[upload] done');
}

run().catch((error) => {
  console.error('[upload] failed:', error && error.message ? error.message : error);
  process.exit(1);
});
