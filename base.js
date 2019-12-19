const fs = require("fs");
let folder, dirname, log, isNext;


// 获取文件夹下所有的文件、文件夹
function getReaddir(path, options){
  return fs.readdirSync(path, options);
}

// config
function config(options){
  if(!options || !options.folder || !options.dirname){
    console.error("初始化时，必须传入 options.folder(云文件夹)，options.dirname(要上传的文件夹)");
    return;
  }

  folder = options.folder;  // 云文件夹
  dirname = options.dirname;    // 要上传的文件夹
  log = options.log || false;
  isNext = /\.next$/.test(dirname);  // 是否时next项目

  if(!/\.next$/.test(dirname)){
    let files = fs.readdirSync(dirname);
    if(files){
      files = files.filter(item => item.name === ".next");
      if(files.length > 0) {
        dirname += "/.next";
        isNext = true;
      }
    }
  }
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
