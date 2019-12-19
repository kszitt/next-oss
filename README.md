## 语言
[English](https://github.com/kszitt/next-oss/blob/master/README_EN.md)

## 描述
将打包生成的文件上传到云端，以提高加载速度，效果明显   

## 安装
```bash
npm install next-oss cross-env --save-dev
```

## 要求
### Node
Node.js >= 10.10.0 required

## 使用

### 初始化云端插件
目前，只支持`aliyun`，基于`ali-oss`插件实现。  
在项目根目录创建`oss.js`，写入如下代码
```jsx
const NextOSS = require("next-oss");
const path = require("path");
const {METHOD, PREFIX} = process.env;


// 初始化aliyun
NextOSS.initAliyun({
  region: '<oss region>',
  accessKeyId: '<Your accessKeyId>',
  accessKeySecret: '<Your accessKeySecret>',
  bucket: '<Your bucket name>'
});

let options = {
  folder: PREFIX,     // 云端的文件夹
  dirname: path.resolve(__dirname, './<upload folder>',           // 要上传的文件夹
};

NextOSS.config(options);


switch(METHOD){
  case "upload":
    NextOSS.upload();
    break;
  case "remove":
    NextOSS.remove();
    break;
  case "clear":
    NextOSS.clear();
    break;
}
```
##### NextOSS.config支持的选项:
- `folder` - 将要保存到云端的文件夹, 必须传
- `dirname` - 要上传的文件夹，必须传。

### 添加命令
在package.json中添加如下命令:
```json
{
  "scripts": {
    "upload": "cross-env METHOD=upload PREFIX=<云端文件夹> node oss.js",
    "remove": "cross-env METHOD=remove PREFIX=<云端文件夹> node oss.js",
    "clear": "cross-env METHOD=clear PREFIX=<云端文件夹> node oss.js",
    "build": "npm run clear && npm run <打包命令> && npm run upload && npm run remove"
  }
}
```

### 添加域名
在server.js中添加如下代码，其中`folder`要与NextOSS.config()中的`folder`要一致。  
##### webpack项目
```js
// webpack配置文件
 const {PREFIX} = process.env;
 const webpackConfig = {
   output: {
     //...
     publicPath: `https://<domain name>/${PREFIX}/`
   }
 }
```
##### next项目
```js
// next启动文件
const {PREFIX} = process.env;
if(PREFIX){
  app.setAssetPrefix(`https://<domain name>/${PREFIX}`);
}
```

### 部署
```bash
npm run build
// 将生成的index.html部署，即可
```
