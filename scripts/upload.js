const {uploadFile} = require("../oss/oss");
const {message, getOptions} = require("../base");
const fs = require("fs");




let version, options;


// 获取文件夹下所有的文件、文件夹
async function getReaddir(path, options){
  return await fs.readdirSync(path, options);
}

// 获取本地文件内容
async function getReadFile(path){
  return await fs.readFileSync(path, {encoding: "utf8"});
}

// 遍历文件、文件夹列表
async function filesEach(files, path){
  for(let i = 0; i < files.length; i++){
    if(files[i].isFile()){
      // 是文件的话就上传
      version = version || {};
      version[files[i].name] = true;
      await uploadFile(path + "/" + files[i].name);
    } else if(files[i].isDirectory()){
      // 文件夹递归遍历
      let list = await getReaddir(path + "/" + files[i].name, {withFileTypes: true});
      await filesEach(list, path + "/" + files[i].name);
    }
  }
}



// 写入版本文件
async function writeVersion(){
  try {
    let versionPath = `${options.dirname}/version.json`;

    await fs.writeFileSync(versionPath, JSON.stringify(version));
    await uploadFile(versionPath);
  } catch (err) {
    throw err;
  }
}

// 开始上传
async function upload(){
  try {
    now_version = {};
    options = getOptions();

    let path = options.dirname,
      files = await getReaddir(path, {withFileTypes: true});
    if(!files || files.length === 0) return;

    await filesEach(files, path);
    await writeVersion();
    console.log("上传成功");
  } catch(err) {
    throw err;
  }
}



exports.upload = upload;


