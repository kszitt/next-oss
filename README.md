## 语言
[English](https://github.com/kszitt/next-oss/blob/master/README_EN.md)

## 描述
将next.js打包生成的.next文件夹上传到云端，以提高加载速度。  
在自己的服务器上（服务器带宽太小了）  
<img alt="screen shot 2019-3-4 at 9 35 27 am" src="https://apl-static.oss-cn-beijing.aliyuncs.com/a0fa6c143e1d11e9a7df0242c0a80003.png">  
上传到云端后
<img alt="screen shot 2019-3-4 at 9 35 27 am" src="https://apl-static.oss-cn-beijing.aliyuncs.com/dd1a6adc3e1d11e99fad0242c0a80003.png">

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
const {method} = process.env;


// 初始化aliyun
NextOSS.initAliyun({
  region: '<oss region>',
  accessKeyId: '<Your accessKeyId>',
  accessKeySecret: '<Your accessKeySecret>',
  bucket: '<Your bucket name>'
});

let options = {
  folder: "<cloud folder>",     // 将要保存到云端的文件夹
  dirname: __dirname,           // 当前路径
};

NextOSS.config(options);


if(method === "upload"){
  NextOSS.upload();     // 上传
} else if(method === "remove"){
  NextOSS.remove();     // 删除以前的版本
}
```
#### NextOSS.config支持的选项:
- `folder` - 将要保存到云端的文件夹, 必须传
- `dirname` - 你需要设置为 `_dirname` 以便找到 `.next` 文件夹, 必须传
- `log` - 是否打印日志, 默认false

### 添加域名
在server.js中添加如下代码，其中`folder`要与NextOSS.config()中的`folder`要一致。
```js
app.setAssetPrefix("https://<domain name>/<folder>");
```

### 添加命令
在package.json中添加如下命令:
```json
{
  "scripts": {
    "upload": "cross-env method=upload node oss.js",
    "remove": "cross-env method=remove node oss.js"
  }
}
```

### 上传
```bash
npm run upload
```

### 删除
```bash
npm run remove
```



