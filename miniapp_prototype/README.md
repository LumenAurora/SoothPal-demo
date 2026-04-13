# SoothPal 微信小程序原型

## 使用方式

1. 打开微信开发者工具。
2. 导入目录：`miniapp_prototype`。
3. AppID 使用：`wxf8f500e291ca1d77`。
4. 点击编译即可体验原型。

## 原型页面

- 首页：演示入口与场景切换
- 记录页：疼痛部位采集 + 语音结构化 + 保存触发预警
- 仪表盘：7 日疼痛/步数趋势
- 预警页：L1/L2/L3 预警与触发依据
- 亲情号：最小必要信息共享
- 问答页：脱敏 RAG + 引用 + 红旗词护栏

## 说明

- 当前版本为比赛演示原型，数据均为合成数据。
- 不包含真实医疗诊断与处方建议。

## 体验版上传（CI）

已内置上传脚本：

```bash
cd miniapp_prototype
npm install
npm run upload:trial
```

可选环境变量：

- `MINIPROGRAM_PRIVATE_KEY_PATH`：上传密钥路径
- `MINIPROGRAM_VERSION`：体验版版本号
- `MINIPROGRAM_DESC`：版本描述
- `MINIPROGRAM_ROBOT`：机器人编号（默认 1）

如果提示 `invalid ip`：

1. 进入微信公众平台 -> 小程序后台 -> 开发管理 -> 开发设置。
2. 在“代码上传 IP 白名单”中加入当前出口 IP。
3. 重新执行 `npm run upload:trial`。
