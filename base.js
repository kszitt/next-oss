let folder, dirname, log = false;



// config
function config(options){
  if(!options){
    console.error("request options.folder");
    return;
  }

  folder = options.folder;  // 云文件夹
  dirname = options.dirname;    // 当前目录
  log = options.log || false;
}

// 获取folder
function getFolder(){
  if(!folder){
    console.error("please Use NextOSS.config to set folder.");
    return;
  }
  return folder;
}

// 获取folder
function getDirname(){
  if(!dirname){
    console.error("please Use NextOSS.config to set dirname.");
    return;
  }
  return dirname;
}

// 日志
function message(string){
  if(log) console.log(string);
}


exports.config = config;
exports.getFolder = getFolder;
exports.getDirname = getDirname;
exports.message = message;
