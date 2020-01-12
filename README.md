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
  "OSSDomainName": "<云端域名>",
  "OSSFolder": "<云端文件夹>",
  "OSSProduction": <:boolean>, // 生产模式是否使用OSS
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack",  // cross-env 请自行安装
  }
}
```
#### webpack配置文件
```jsx
// webpack.config.js
const NextOss = require('next-oss');

...
plugins: [
  ...
  new NextOss({
    disable: process.env.NODE_ENV !== "production",
    aliyun: {
      region: "<OSS region>",
      accessKeyId: "<Your accessKeyId>",
      accessKeySecret: "<Your accessKeySecret>",
      bucket: "<Your bucket name>"
    }
  })
]
```
#### 部署
``` hash
npm run build
// 将打包文件夹下的index.html文件部署到服务器，确保能访问到
```
## `next`框架
#### 添加命令
```jsx
// package.json
{
  "OSSDomainName": "<云端域名>",
  "OSSFolder": "<云端文件夹>",
  "OSSProduction": <:boolean>, // 开发模式是否使用OSS
  "scripts": {
    "build": "cross-env NODE_ENV=production next build",  // 打包命令（cross-env 请自行安装）
    "start": "cross-env NODE_ENV=production node server.js"   // 启动服务（这里不能用next start，得自定义服务端）
  }
}
```
#### 自定义服务端
```jsx
// server.js
const express = require('express');
const next = require('next');
const {OSSFolder, OSSDomainName, OSSProduction} = require('./package.json');
const { NODE_ENV, PORT=3000 } = process.env;
const dev = NODE_ENV !== 'production';
const Prod = NODE_ENV === "production";
const app = next({dir: '.', dev});

// 是否使用OSS（只有生产模式可以使用OSS，开发模式无效）
if(Prod ? OSSProduction : false){
  app.setAssetPrefix(`${OSSDomainName}/${OSSFolder}/`);
}

app.prepare().then(() => {
    const server = express();

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
const {OSSFolder, OSSDomainName, OSSProduction} = require('./package.json');
const withPlugins = require ("next-compose-plugins");
const { NODE_ENV } = process.env;
const Prod = NODE_ENV === "production";

...
const nextConfig = {
  webpack: (config, options) => {
    ...
    let NextOssOptions = {
      disable: Prod ? !OSSProduction : true,  // 只有生产模式可以使用OSS，开发模式无效
      aliyun: {
        region: "<OSS region>",
        accessKeyId: "<Your accessKeyId>",
        accessKeySecret: "<Your accessKeySecret>",
        bucket: "<Your bucket name>"
      }
    };
    if(!NextOssOptions.disable) options.config.assetPrefix = `${OSSDomainName}/"${OSSFolder}/`;
    config.plugins.push(
      new NextOss(NextOssOptions)
    );

    return config;
  }
};

module.exports = withPlugins([...], nextConfig);
```
#### 部署
``` hash
npm run build
npm run start
```

## NextOSS(options)支持的选项
- `aliyun` - 初始化阿里云OSS信息。
- `disable` - 是否禁用，默认`false`。
- `deletePrevBuildFile` - 是否删除云端以前的版本，默认`false`
- `log` - 是否显示日志，默认`true`
- `cover` - 图片、字体文件是否覆盖，默认`true`。

## 注意事项
- `options.disable` 该插件在非生产模式禁用，生产模式可以在`package.json`中的`OSSProduction`设置是否禁用。
- `options.deletePrevBuildFile` 启用该项会把以前的版本删掉，建议在服务器定期清理。
- `options.cover` 设置图禁止覆盖时，请将图片、字体的文件名添加[hash]值。否则，会找不到资源

