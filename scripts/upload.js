const {uploadFile} = require("../oss/oss");
const {getDirname, message} = require("../base");
const fs = require("fs");

let version, dirname;






// 获取文件夹下所有的文件、文件夹
async function getReaddir(path){
  message(`查找${path}文件夹`);
  return await fs.readdirSync(path, {withFileTypes: true});
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
      let list = await getReaddir(path + "/" + files[i].name);
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






// 开始上传
async function upload(){
  try {
    version = {};
    dirname = getDirname();
    let path = `${dirname}/.next/static`,
      files = await getReaddir(path);

    await filesEach(files, path);
    message(`上传：${dirname}/.next/BUILD_ID`);
    await uploadFile(`${dirname}/.next/BUILD_ID`);
    await writeVersion();

    console.log("upload success");
  } catch(err) {
    console.log(err);
  }
}



exports.upload = upload;


