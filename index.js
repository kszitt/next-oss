const {initAliyun} = require("./oss/aliyun");
const {config} = require("./base");
const {upload} = require("./scripts/upload");
const {remove} = require("./scripts/remove");
const {clearBuildFile} = require("./scripts/clearBuildFile");


function NextOSS(options){
  switch(true){
    case "aliyun" in options:
      initAliyun(options.aliyun);
      break;
    default:
      console.warn("必须传入云端平台，目前只支持aliyun。本次打包将不上传");
      options.disable = true;
  }
  if(!options.folder){
    console.warn("必须传入云端目录。本次打包将不上传");
    options.disable = true;
  }
  options.log = options.log || false;
  options.disable = options.disable || false;
  options.deletePrevBuildFile = options.deletePrevBuildFile || false;
  this.options = options;
}

NextOSS.prototype.apply = function(compiler) {
  let _this = this;

  // 初始化
  this.options.dirname = compiler.options.output.path;
  if(!this.options.disable) config(this.options);

  // 初始化插件之后
  compiler.plugin('afterPlugins', function() {
    if(!_this.options.disable) clearBuildFile();
  });

  // 打包完成后
  compiler.plugin('afterEmit', async function() {
    if(!_this.options.disable) await upload();
    if(!_this.options.disable && _this.options.deletePrevBuildFile) await remove();
  });
};


module.exports = NextOSS;

