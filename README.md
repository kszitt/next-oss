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

## 使用
### webpack配置文件
```jsx
const NextOss = require('next-oss');

...
output: {
  ...
  publicPath: "https://<domain name>/<Folder>/"
}
...
plugins: [
  ...
  new NextOss({
    folder: "<Folder>",
    aliyun: {
      region: "<OSS region>",
      accessKeyId: "<Your accessKeyId>",
      accessKeySecret: "<Your accessKeySecret>",
      bucket: "<Your bucket name>"
    }
  })
]
```
##### NextOSS(options)支持的选项:
- `Folder` - 将要保存到云端的文件夹。
- `aliyun` - 初始化阿里云信息。
- `disable` - 是否禁用，默认`false`
- `deletePrevBuildFile` - 是否删除云端以前的版本，默认`true`
- `log` - 是否显示日志，默认`false`

