let aliyun = require("./aliyun");
let OSSType;

// 设置OSS类型
function setOSSType(type){
  OSSType = type;
}

// 是否初始化
function noInit(){
  if(!OSSType){
    console.error("Initialize first, using NextOSS.initAliyun (options)");
  }
  return !OSSType;
}

// 上传单个文件
async function uploadFile(path){
  if(noInit()) return;

  if(!aliyun.uploadFile) aliyun = require("./aliyun");

  switch(OSSType){
    case "aliyun":
      await aliyun.uploadFile(path);
      break;
  }
}

// 读取文件
async function getFile(path){
  if(noInit()) return;

  if(!aliyun.getFile) aliyun = require("./aliyun");

  switch(OSSType){
    case "aliyun":
      return await aliyun.getFile(path);
  }
}

// 获取云文件夹下的文件、文件夹
async function getListByFolder(prefix, delimiter){
  if(noInit()) return;

  switch(OSSType){
    case "aliyun":
      return await aliyun.getListByFolder(prefix, delimiter);
  }
}

// 删除多个文件
async function deleteFile(file){
  if(noInit()) return;
  if(!file || file.length === 0) return;

  switch(OSSType){
    case "aliyun":
      await aliyun.deleteFile(file);
      break;
  }
}

exports.setOSSType = setOSSType;
exports.uploadFile = uploadFile;
exports.getFile = getFile;
exports.getListByFolder = getListByFolder;
exports.deleteFile = deleteFile;
