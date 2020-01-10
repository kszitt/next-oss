const OSS = require("./oss/oss");
const Base = require("./base");
const {upload} = require("./scripts/upload");
const {remove} = require("./scripts/remove");
const {clearBuildFile} = require("./scripts/clearBuildFile");


class NextOSS {
  constructor(options){
    let defaultOptions = {
      log: false,
      disable: false,
      removePrevVersion: true,
      cover: true
    };
    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler){
    // console.log(compiler.options);

    // 初始化
    this.options.path = compiler.options.output.path;
    if(/\.next$/.test(this.options.path)) this.options.isNext = true;
    const {OSSFolder, OSSDomainName} = require(compiler.options.context + "/package.json");
    this.options.OSSFolder = OSSFolder;
    this.options.OSSDomainName = OSSDomainName;

    // 打包完成后
    compiler.plugin('afterEmit', async compilation => {
      if(this.options.disable) return;

      let assets = [];
      for(let k in compilation.assets){
        assets.push(k);
      }
      this.options.assets = assets;
      this.init();
      if(!this.oss.type){
        console.warn("必须传入云端平台，目前只支持aliyun。本次打包将不上传");
        return;
      }

      this.upload();
    });
  }

  init(){
    if(!this.options.OSSFolder){
      console.warn("必须传入云端目录。本次打包将不上传");
      return;
    }

    this.oss = new OSS(this.options);
  }

  // 日志
  message(){
    if(this.options.log) console.log(...arguments);
  }

  // 上传
  async upload(){
    await this.fileUpload(this.options.path);
    this.message("本地上传成功");

    await this.remove();
    this.message("云端上个版本文件清除成功");
  }

  // 上传文件、删除本地文件
  async fileUpload(path, folder=""){
    let files = await Base.getReaddir(path, {withFileTypes: true}),
      result;
    if(!files || files.length === 0) return;

    for(let i = 0; i < files.length; i++){
      let file = files[i],
        filePath = `${path}/${file.name}`,
        OSSPath;
      result = undefined;
      if(/node_modules/.test(filePath)) continue;

      switch(true){
        case file.isFile() && this.options.assets.filter(it => it === folder + file.name).length > 0:
          OSSPath = this.options.isNext ?
            filePath.replace(/.+?\.next\//, this.options.OSSFolder+"/_next/") :
            filePath.replace(this.options.path, this.options.OSSFolder);
          result = await this.oss.uploadFile(filePath, OSSPath, this.options.cover);
          if(result) this.message(folder + file.name, " ==>> ", this.options.OSSDomainName + "/" + OSSPath);
          break;
        case file.isFile():
          await Base.delFile(filePath);
          this.message("删除本地文件：", folder + file.name);
          break;
      }
      if(!file.isFile()) await this.fileUpload(filePath, folder+file.name+"/");
    }
    result = await Base.delEmptyDir(path);
    if(result) this.message("删除空文件夹：", path);
  }

  // 删除云端文件
  async remove(){
    let path = this.options.OSSFolder + (this.options.isNext ? "/_next/" : "/"),
      cloudFiles = await this.oss.getListByFolder(path);

    for(let i = 0; i < cloudFiles.length; i++){
      let name = cloudFiles[i].name,
        file = name.replace(this.options.OSSFolder+"/", ""),
        result;
      if(!file) continue;

      if(this.options.assets.filter(item => item === file).length === 0){
        result = await this.oss.deleteFile(name);
        if(result.res && result.res.status >= 200 && result.res.status < 300){
          this.message("云端文件删除：", name);
        }
      }
    }
  }
}


module.exports = NextOSS;

