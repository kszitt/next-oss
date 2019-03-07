const {uploadFile} = require("../oss/oss");
const {getDirname, message} = require("../base");
const fs = require("fs");
const cmd = require('node-cmd');
const Promise = require('bluebird');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });


let version, dirname, platform;






// 获取文件夹下所有的文件、文件夹
async function getReaddir(path, options){
  message(`查找${path}文件夹`);
  return await fs.readdirSync(path, options);
}

// 获取本地文件内容
async function getReadFile(path){
  return await fs.readFileSync(path, {encoding: "utf8"});
}

// 删除本地文件
async function delDir(path){
  path = path.replace(/\//g, "\\");

  async function mac(){
    try {
      await getAsync('rm -rf '+ path);
      console.log("删除文件夹成功", path)
    } catch(err){
      await win();
    }
  }

  async function win(){
    await getAsync('rd /s /q '+ path);
    console.log("删除文件夹成功", path);
  }

  await mac();
}




// 遍历文件、文件夹列表
async function filesEach(files, path){
  for(let i = 0; i < files.length; i++){
    if(files[i].isFile()){
      // 是文件的话就上传
      message(`上传：${files[i].name}`);
      version[files[i].name] = true;
      await uploadFile(path + "/" + files[i].name);
    } else if(files[i].isDirectory()){
      // 文件夹递归遍历
      let list = await getReaddir(path + "/" + files[i].name, {withFileTypes: true});
      await filesEach(list, path + "/" + files[i].name)
    }
  }
}



// 写入版本文件
async function writeVersion(){
  try {
    message("写入version.json文件");
    await fs.writeFileSync(`${dirname}/.next/version.json`, JSON.stringify(version));
    message("写入version.json成功");
    message(`上传：${dirname}/.next/version.json`);
    await uploadFile(`${dirname}/.next/version.json`);
  } catch (err) {
    console.log (err);
  }
}


async function removePrevFiles(){
  message(`获取打包版本号`);
  let build = await getReadFile(`${dirname}/.next/BUILD_ID`),
    files = await getReaddir(`${dirname}/.next/static/`),
    server_files = await getReaddir(`${dirname}/.next/server/static/`);
  message(`版本号：${build}`);

  // 删除static下的
  for(let i = 0; i < files.length; i++){
    if(/^[A-Za-z\d_-~!@#$%^&*+=]{21}$/.test(files[i])){
      if(!eval('/'+ build +'/').test(files[i])) {
        await delDir(`${dirname}/.next/static/${files[i]}`);
      }
    }
  }

  // 删除server/static下的
  for(let i = 0; i < server_files.length; i++){
    if(/^[A-Za-z\d_-~!@#$%^&*+=]{21}$/.test(server_files[i])){
      if(!eval('/'+ build +'/').test(server_files[i])) {
        await delDir(`${dirname}/.next/server/static/${server_files[i]}`);
      }
    }
  }
}



// 开始上传
async function upload(){
  try {
    version = {};
    dirname = getDirname();

    await removePrevFiles();

    let path = `${dirname}/.next`,
      files = await getReaddir(path, {withFileTypes: true});

    await filesEach(files, path);
    await writeVersion();

    console.log("upload success");
  } catch(err) {
    console.log(err);
  }
}



exports.upload = upload;


