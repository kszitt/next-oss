const fs = require("fs");


// 获取文件夹下所有的文件、文件夹
async function getReaddir(path, options){
  return await fs.readdirSync(path, options);
}

// 获取本地文件内容
async function getReadFile(path){
  try {
    return await fs.readFileSync(path, {encoding: "utf8"});
  } catch(err) {
    
  }
}

// 删除空文件夹
async function delEmptyDir(path){
  try {
    await fs.rmdirSync(path);
    return true;
  } catch(err){

  }
}

async function delFile(path){
  try {
    await fs.unlinkSync(path);
  } catch(err){
    throw err;
  }
}


module.exports = {
  getReaddir,
  getReadFile,
  delFile,
  delEmptyDir
};
