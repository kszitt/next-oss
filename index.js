const OSS = require("./oss");
const Base = require("./base");


class NextOSS {
  constructor(options){
    let defaultOptions = {
      log: true,
      disable: false,
      removePrevVersion: false,
      cover: true
    };
    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler){
    // 初始化
    this.options.path = compiler.options.output.path;
    if(/\.next([\/\\]server)?$/.test(this.options.path)) {
      this.options.isNext = true;
      this.options.isServer = /server$/.test(this.options.path);
    }
    let {OSSFolder, OSSDomainName, OSSProduction=true} = require(compiler.options.context + "/package.json");
    OSSFolder = OSSFolder.replace(/([^/])$/, "$1/");
    OSSDomainName = OSSDomainName.replace(/([^/])$/, "$1/");
    this.options.OSSFolder = OSSFolder;
    this.options.OSSDomainName = OSSDomainName;
    if(this.options.isNext){
      this.options.disable = process.env.NODE_ENV === "production" ? !OSSProduction : true;
    }
    
    // 不是打包的时候不执行
    let script = process.title === "npm" ? process.env.npm_lifecycle_script : process.title;
    if(
      (this.options.isNext && !/next.+?build/.test(script)) ||
      (!this.options.isNext && !/webpack(?!-dev-server)/.test(script))
    ){
      return;
    }

    if(this.options.disable) return;
    
    if(!this.options.isNext){
      compiler.options.output.publicPath = `${OSSDomainName}${OSSFolder}`;
    }

    if(!OSSFolder || !OSSDomainName){
      console.warn("请在package.json中填入“OSSFolder”和“OSSDomainName”字段。本次打包将不上传");
      return;
    }

    // 打包完成后
    compiler.plugin('afterEmit', async compilation => {
      let isServer = this.options.isServer;
      global.OSSUpload = global.OSSUpload || new Set();

      // 本次打包的文件放到全局
      for(let k in compilation.assets){
        let name = k.replace(/\\/g, "/");
        if(/^\.\.\/(static\/)/.test(name)){
          name = name.replace(/^\.\.\/(static\/)/, "$1");
        } else if(isServer){
          name = "server/" + name;
        }
        global.OSSUpload.add(name);
      }

      // 添加另外的打包文件
      if(this.options.isNext){
        global.OSSUpload.add(`${isServer ? "server/" : ""}records.json`);
        if(!isServer) global.OSSUpload.add("BUILD_ID");
      }

      if(this.options.isNext && this.options.isServer) return;
      this.options.assets = Array.from(global.OSSUpload);
      this.OSSUploaded = 0;

      this.init();
      if(!this.oss.type){
        console.warn("必须传入云端平台，目前只支持aliyun。本次打包将不上传");
        return;
      }

      this.script();
    });
  }

  init(){
    this.oss = new OSS(this.options);
  }

  // 日志
  message(){
    if(!this.options.log) return;

    let string = "";
    for(let i = 0; i < arguments.length; i++){
      string += arguments[i];
    }
    console.log(string);
  }

  // 执行
  async script(){
    await this.upload(this.options.path);
    console.log("本地文件上传成功");

    if(!this.options.removePrevVersion) return;
    await this.remove();
    console.log("云端上个版本文件清除成功");
  }

  // 上传文件、删除本地文件
  async upload(path, folder=""){
    try {
      let files = await Base.getReaddir(path, {withFileTypes: true}),
        assets = this.options.assets,
        result;
      if(!files || files.length === 0) return;

      for(let i = 0; i < files.length; i++){
        let file = files[i],
          filePath = `${path}/${file.name}`,
          OSSPath;
        result = undefined;
        if(/node_modules/.test(filePath)) continue;

        switch(true){
          case file.isFile() && assets.filter(it => it === folder + file.name).length > 0:
            OSSPath = this.options.isNext ?
              filePath.replace(/.+?\.next[\/\\]/, this.options.OSSFolder+"_next/") :
              filePath.replace(this.options.path, this.options.OSSFolder.replace(/\/$/, ""));
              result = await this.oss.uploadFile(filePath, OSSPath, this.options.cover);
              ++this.OSSUploaded;
            if(result){
              this.message(
                `上传文件[${this.OSSUploaded}/${assets.length}]：`,
                folder + file.name, " ==>> ",
                this.options.OSSDomainName + OSSPath
              );
            }
            break;
          case file.isFile():
            await Base.delFile(filePath);
            // this.message("删除本地文件：", folder + file.name);
            break;
        }
        if(!file.isFile()) await this.upload(filePath, folder+file.name+"/");
      }
      result = await Base.delEmptyDir(path);
      // if(result) this.message("删除空文件夹：", path.replace(this.options.path, "").replace(/^[\/\\]+/, ""));
    } catch(err){
      throw err;
    }
  }

  // 删除云端文件
  async remove(){
    try {
      let path = this.options.OSSFolder + (this.options.isNext ? "_next/" : ""),
        assets = this.options.assets,
        cloudFiles = await this.oss.getListByFolder(path);

      for(let i = 0; i < assets.length; i++){
        cloudFiles = cloudFiles.filter(item =>
          assets[i] !== item.name.replace(this.options.OSSFolder, "").replace(/^_next\//, ""));
      }
      if(!this.options.cover){
        cloudFiles = cloudFiles.filter(item => !/\.(woff|svg|ttf|eot|woff2|png|jpg|gif)(\?.*)?$/.test(item.name));
      }

      for(let i = 0; i < cloudFiles.length; i++){
        let name = cloudFiles[i].name,
          file = name.replace(this.options.OSSFolder, ""),
          result;
        if(!file) continue;

        result = await this.oss.deleteFile(name);
        if(result){
          this.message(`云端文件删除[${i+1}/${cloudFiles.length}]：`, this.options.OSSDomainName + name);
        }
      }
    } catch(err){
      throw err;
    }
  }
}


module.exports = NextOSS;

