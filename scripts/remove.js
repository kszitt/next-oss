const {getFile, getListByFolder, deleteFile} = require("../oss/oss");
const {getFolder, message} = require("../base");


let version, folder;





// 获取要刪除的所有文件路径
async function getAllFiles(){
  let result = await getListByFolder(folder+"/_next/"),
    build = await getFile(folder+"/_next/BUILD_ID"),
    files = result.objects;


  for(let i = 0; i < files.length; i++){
    let file = files[i].name.match(/\/[A-Za-z\d._-]+$/)[0].replace(/^\//, "");
    // 刪除以前的版本
    if(/\/static\/.{21}\/pages\//.test(files[i].name)){
      let newBuild = files[i].name.replace(/.+\/static\//, "").replace(/\/pages\/.+/, "");
      if(newBuild !== build) {
        await deleteFile(files[i].name);
      }
    } else if(!version[file]){    // 没从版本文件中找到的也删除
      await deleteFile(files[i].name);
    }
  }
}

async function remove(){
  try {
    if(!folder) folder = getFolder();

    message(`获取版本文件：${folder}/_next/version.json`);
    version = await getFile(folder+"/_next/version.json");
    message(`version文件：${version}`);
    if(version) version = JSON.parse(version);

    await getAllFiles();

    console.log("remove success");
  } catch(err) {
    console.log(err);
  }
}


exports.remove = remove;