const OSS = require('ali-oss');
const {getFolder} = require("./base");
const {setOSSType} = require("./oss");
let folder, client, output = {};



// 初始化aliyun
function initAliyun(options){
  try {
    client = new OSS(options);
    client.useBucket('apl-static');
    setOSSType("aliyun");
  } catch(err){
    console.error(err);
  }
}


// 上传单个文件
async function uploadFile(path){
  try {
    if(!folder) folder = getFolder();
    await client.put(path.replace(/.+?\/\.next/, folder+"/_next"), path);
    console.log("上传成功：", path);
  } catch (err) {
    console.log (err);
  }
}

// 读取文件
async function getFile(path){
  try {
    let file = await client.get(path);
    return file.content.toString("utf8");
  } catch (err) {
    console.log (err);
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
    console.log (err);
  }
}

// 删除多个文件
async function deleteFiles(files){
  try {
    await client.deleteMulti(files);
    files.forEach(file => {
      console.log("删除成功：", file);
    })
  } catch (err) {
    console.log (err);
  }
}


exports.initAliyun = initAliyun;
exports.uploadFile = uploadFile;
exports.getFile = getFile;
exports.getListByFolder = getListByFolder;
exports.deleteFiles = deleteFiles;
