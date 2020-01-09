const {uploadFile} = require("../oss/oss");
const {message, getOptions, getReaddir, getReadFile} = require("../base");
const fs = require("fs");
let version, options;


// 遍历文件、文件夹列表
async function filesEach(files, path){
  for(let i = 0; i < files.length; i++){
    let now_path = path + "/" + files[i].name;
    if(/node_modules/.test(now_path)) continue;

    // 是文件的话就上传
    if(files[i].isFile()){
      version = version || {};
      version[now_path.replace(options.dirname, "").replace(/^(\/|\\)/, "")] = true;
      await uploadFile(now_path);
    } else {
      let list = await getReaddir(now_path, {withFileTypes: true});
      await filesEach(list, now_path);
    }
  }
}

// 写入版本文件
async function writeVersion(){
  try {
    let versionPath = `${options.dirname}/version.json`;

    version["version.json"] = true;
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


