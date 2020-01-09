## 语言
[English](https://github.com/kszitt/next-oss/blob/master/README_EN.md)

## 描述
将webpack打包生成的文件上传到云端，以提高加载速度，效果明显   
目前，只支持`aliyun`，基于`ali-oss`插件实现。  

## 安装
```bash
npm install next-oss --save-dev
```

## 要求
### Node
Node.js >= 10.10.0 required

## 非`next`框架
#### 添加命令
```jsx
// package.json
{
  "folder": "<云端文件夹>",
  "OSSDomainName": "<云端域名>",
}
```
#### webpack配置文件
```jsx
// webpack.config.js
const NextOss = require('next-oss');
const {folder, OSSDomainName} = require('./package.json');

...
output: {
  ...
  publicPath: `${OSSDomainName}/${folder}/`
}
...
plugins: [
  ...
  new NextOss({
    folder,
    aliyun: {
      region: "<OSS region>",
      accessKeyId: "<Your accessKeyId>",
      accessKeySecret: "<Your accessKeySecret>",
      bucket: "<Your bucket name>"
    }
  })
]
```
## `next`框架
#### 添加命令
```jsx
// package.json
{
  "folder": "<云端文件夹>",
  "OSSDomainName": "<云端域名>",
  "scripts": {
    "build": "next build",  // 打包命令
    "start": "node server.js"   // 启动服务（这里不能用next start，得自定义服务端）
  }
}
```
#### 自定义服务端
```jsx
// server.js
const express = require('express');
const next = require('next');
const {folder, OSSDomainName} = require('./lib/routes');
const { NODE_ENV, PORT } = process.env;
const dev = NODE_ENV !== 'production';
const app = next({dir: '.', dev});


app.prepare().then(() => {
    const server = express();

    // 动态前缀
    app.setAssetPrefix(`${OSSDomainName}/${folder}`);

    server.listen(PORT, (err) => {
      if (err) {
        throw err
      }
      console.log(`> Ready on port ${PORT} [${NODE_ENV}]`);
    })
  }).catch((ex) => {
    console.log('An error occurred, unable to start the server')
    console.log(ex)
  });
```
#### webpack配置
```jsx
// next.config.js
const NextOss = require('next-oss');
const {folder} = require('./package.json');
const withPlugins = require ("next-compose-plugins");

...
const nextConfig = {
  webpack: (config, options) => {
    ...
    if(!options.isServer){
      config.plugins.push(
        new NextOss({
         folder,
         aliyun: {
           region: "<OSS region>",
           accessKeyId: "<Your accessKeyId>",
           accessKeySecret: "<Your accessKeySecret>",
           bucket: "<Your bucket name>"
         }
        })
      );
    }

    return config;
  }
};

module.exports = withPlugins([...], nextConfig);
```

## NextOSS(options)支持的选项:
- `Folder` - 将要保存到云端的文件夹。
- `aliyun` - 初始化阿里云信息。
- `disable` - 是否禁用，默认`false`
- `deletePrevBuildFile` - 是否删除云端以前的版本，默认`true`
- `log` - 是否显示日志，默认`false`

