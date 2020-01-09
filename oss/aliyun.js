const OSS = require('ali-oss');
const {getOptions, message} = require("../base");
const {setOSSType} = require("./oss");
let options, client;

// 初始化aliyun
function initAliyun(options){
  try {
    client = new OSS(options);
    client.useBucket('apl-static');
    setOSSType("aliyun");
  } catch(err){
    throw err;
  }
}

// 上传单个文件
async function uploadFile(path){
  try {
    options = options || getOptions();

    oss_path =  options.isNext ?
      path.replace(/.+?\.next\//, options.folder+"/_next/") :
      path.replace(options.dirname, options.folder);

    await client.put(oss_path, path);
    message(`上传：${path.replace(options.dirname, "").replace(/^(\/|\\)/, "")} ==>> ${options.OSSDomainName ? (options.OSSDomainName + "/") : ""}${oss_path}`);
  } catch (err) {
    throw err;
  }
}

// 读取文件
async function getFile(path){
  try {
    let file = await client.get(path);
    return file.content.toString("utf8");
  } catch (err) {
    throw err;
  }
}

// 获取云文件夹下的文件、文件夹
async function getListByFolder(prefix, delimiter){
  try {
    return await client.list({
      prefix,
      delimiter
    });
  } catch (err) {
    throw err;
  }
}

// 删除多个文件
async function deleteFile(file){
  try {
    await client.delete(file);
    message("删除："+ file);
  } catch (err) {
    throw err;
  }
}


exports.initAliyun = initAliyun;
exports.uploadFile = uploadFile;
exports.getFile = getFile;
exports.getListByFolder = getListByFolder;
exports.deleteFile = deleteFile;
