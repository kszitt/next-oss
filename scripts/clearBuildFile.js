const {uploadFile} = require("../oss/oss");
const {message, getOptions} = require("../base");
const fs = require("fs");
const os = require('os');
const cmd = require('node-cmd');
const Promise = require('bluebird');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });


let options;


// 获取文件夹下所有的文件、文件夹
async function getReaddir(path, options){
  return await fs.readdirSync(path, options);
}

// 删除本地文件
async function delDir(path){
  if(os.platform() !== "linux"){
    path = path.replace(/\//g, "\\");
  }

  async function mac(){
    try {
      await getAsync('rm -rf '+ path);
    } catch(err){
      await win();
    }
  }

  async function win(){
    await getAsync('rd /s /q '+ path);
  }

  await mac();
}

async function delFile(path){
  try {
    await fs.unlinkSync(path);
  } catch(err){
    throw err;
  }
}


// 删除本地之前版本的文件
async function removePrevFiles(path=options.dirname){
  let files = await getReaddir(path, {withFileTypes: true}),
    i = 0;;

  while(files[i]){
    if(files[i].isFile()){
      await delFile(`${path}/${files[i].name}`);
    } else {
      await delDir(`${path}/${files[i].name}`);
    }
    files.splice(i, 1);
  }
}


// 清除打包的文件
async function clearBuildFile(){
  try {
    options = getOptions();

    // 删除本地之前版本的文件
    await removePrevFiles();

  } catch(err) {
    throw err;
  }
}



exports.clearBuildFile = clearBuildFile;


