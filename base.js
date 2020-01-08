const fs = require("fs");
let folder, dirname, log, isNext;


// 获取文件夹下所有的文件、文件夹
function getReaddir(path, options){
  return fs.readdirSync(path, options);
}

// config
function config(options){
  folder = options.folder;  // 云文件夹
  dirname = options.dirname;    // 要上传的文件夹
  log = options.log || false;
  isNext = /\.next$/.test(dirname);  // 是否时next项目
}

function getOptions(){
  return {
    folder,
    dirname,
    log,
    isNext
  }
}

// 日志
function message(string){
  if(log) console.log(string);
}


exports.config = config;
exports.getOptions = getOptions;
exports.message = message;
