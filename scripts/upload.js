// 引入微信小程序CI工具，用于自动化构建和上传小程序
const ci = require('miniprogram-ci');
// 引入Node.js内置path模块，用于处理文件路径
const path = require('path');

// 加载dotenv模块，用于从.env文件加载环境变量（虽然代码中未使用）
require('dotenv').config();

// 引入项目根目录下的package.json文件，主要用于获取版本号
const packageJson = require('../package.json');

// 定义异步函数uploadMini，用于执行小程序上传操作
const uploadMini = async () => {
  // 从package.json中直接读取版本号，保持版本一致性
  const version = packageJson.version;
  console.log(`上传版本号: ${version}`);
  
  // 使用path.resolve将相对路径解析为绝对路径，确保路径正确性
  // projectPath指向小程序编译后的代码目录
  const projectPath = path.resolve(__dirname, '../dist/build/mp-weixin');
  // privateKeyPath指向小程序上传所需的私钥文件
  const privateKeyPath = path.resolve(__dirname, './private.wxbf1c228ee7bb0bef.key');

  // 创建CI项目实例，配置小程序的基本信息
  const project = new ci.Project({
    appid: 'wxbf1c228ee7bb0bef',           // 小程序的AppID
    type: 'miniProgram',                    // 项目类型为小程序
    projectPath: projectPath,               // 小程序编译后代码的路径
    privateKeyPath: privateKeyPath,         // 私钥文件路径
    ignores: ['node_modules/**/*'],        // 上传时忽略node_modules目录
  });

  // 调用CI工具的上传方法
  ci.upload({
    project,                                // 项目实例
    version: version,                       // 版本号
    desc: `机器人上传`,                      // 上传描述
    setting: {
      es6: true,                            // 启用ES6转ES5编译
    },
    onProgressUpdate: console.log,          // 上传进度回调函数
  })
    .then((uploadResult) => {
      // 上传成功的回调处理
      console.log('上传成功', uploadResult);
    })
    .catch((err) => {
      // 上传失败的错误处理
      console.error('上传失败', err);
    });
};

// 执行上传函数并处理Promise结果
uploadMini().then((r) => {});