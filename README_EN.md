## Language
[简体中文](https://github.com/kszitt/next-oss/blob/master/README.md)

## Description
Upload the package generated files to the cloud to improve the loading speed

## Install
```bash
npm install next-oss cross-env --save-dev
```

## Compatibility
### Node
Node.js >= 10.10.0 required

## How to use

### Init Cloud
Currently, only `aliyun` is supported. Based on `ali-oss` module  
Create `oss.js` in the project root directory, like this
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
  folder: PREFIX,
  dirname: path.resolve(__dirname, './<upload folder>',
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
#### Supported options by NextOSS.config:
- `folder` - A directory saved to the cloud, is request
- `dirname` - Folders to upload, is request

### Add Scripts
and add a script to your package.json like this:
```json
{
  "scripts": {
   "upload": "cross-env METHOD=upload PREFIX=<cloud folder> node oss.js",
   "remove": "cross-env METHOD=remove PREFIX=<cloud folder> node oss.js",
   "clear": "cross-env METHOD=clear PREFIX=<cloud folder> node oss.js",
   "build": "npm run clear && npm run <build script> && npm run upload && npm run remove"
  }
}
```

### Add domain name
Add the following code to server.js, where `folder`is consistent with `folder` in NextOSS.config().  

##### webpack project
```js
// webpack.config.js
const {PREFIX} = process.env;
const webpackConfig = {
  output: {
    //...
    publicPath: `https://<domain name>/${PREFIX}/`
  }
}
```
##### next project
```js
// next start file
const {PREFIX} = process.env;
if(PREFIX){
  app.setAssetPrefix(`https://<domain name>/${PREFIX}`);
}
```

### deploy
```bash
npm run build
// Deploy the generated index.html
```
