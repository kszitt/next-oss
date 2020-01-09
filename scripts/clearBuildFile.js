const {uploadFile} = require("../oss/oss");
const {message, getOptions, getReaddir, getReadFile} = require("../base");
const fs = require("fs");
const os = require('os');
const cmd = require('node-cmd');
const Promise = require('bluebird');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });
let options, version, build_id;

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
    try {
      await getAsync('rd /s /q '+ path);
    } catch(err) {
      throw err;
    }
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
    i = 0;

  while(files[i]){
    let now_path = `${path}/${files[i].name}`;
    let now_build = now_path.match(/static(\/|\\)[^/\\]{21}/);
    if(files[i].isFile()){
      if(!version[now_path.replace(options.dirname, "").replace(/^(\/|\\)/, "")]){
        await delFile(now_path);
      }
    } else if(now_build && now_build[0].replace(/static(\/|\\)/, "") !== build_id){
      await delDir(now_path);
    } else {
      await removePrevFiles(now_path);
    }
    files.splice(i, 1);
  }
}

// 清除打包的文件
async function clearBuildFile(){
  try {
    options = getOptions();

    // 删除本地之前版本的文件
    version = getReadFile(`${options.dirname}/version.json`);
    version = JSON.parse(version);
    build_id = getReadFile(`${options.dirname}/BUILD_ID`);
    await removePrevFiles();

    // message("删除本地之前版本的文件成功")
  } catch(err) {
    throw err;
  }
}



exports.clearBuildFile = clearBuildFile;


