const fs = require("fs");
let folder, dirname, log, isNext, OSSFolder, OSSDomainName;


// 获取文件夹下所有的文件、文件夹
function getReaddir(path, options){
  return fs.readdirSync(path, options);
}

// 获取本地文件内容
function getReadFile(path){
  return fs.readFileSync(path, {encoding: "utf8"});
}

// config
function config(options){
  folder = options.folder;  // 云文件夹
  dirname = options.dirname;    // 要上传的文件夹
  OSSFolder = options.OSSFolder;
  OSSDomainName = options.OSSDomainName;
  log = options.log || false;
  isNext = /\.next$/.test(dirname);  // 是否时next项目
}

function getOptions(){
  return {
    folder,
    dirname,
    log,
    isNext,
    OSSFolder,
    OSSDomainName
  }
}

// 日志
function message(string){
  if(log) console.log(string);
}


exports.config = config;
exports.getOptions = getOptions;
exports.message = message;
exports.getReaddir = getReaddir;
exports.getReadFile = getReadFile;
