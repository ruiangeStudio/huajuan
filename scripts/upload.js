const ci = require('miniprogram-ci');
const path = require('path');


require('dotenv').config();

// 引入 package.json 来获取版本号
const packageJson = require('../package.json');

const uploadMini = async () => {
  // 直接使用 package.json 中的版本号
  const version = packageJson.version;
  console.log(`上传版本号: ${version}`);
  
  // 使用绝对路径
  const projectPath = path.resolve(__dirname, '../dist/build/mp-weixin');
  const privateKeyPath = path.resolve(__dirname, './private.wxbf1c228ee7bb0bef.key');

  const project = new ci.Project({
    appid: 'wxbf1c228ee7bb0bef',
    type: 'miniProgram',
    projectPath: projectPath,
    privateKeyPath: privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  ci.upload({
    project,
    version: version,
    desc: `机器人上传`,
    setting: {
      es6: true,
    },
    onProgressUpdate: console.log,
  })
    .then((uploadResult) => {
      console.log('上传成功', uploadResult);
    })
    .catch((err) => {
      console.error('上传失败', err);
    });
};
uploadMini().then((r) => {});