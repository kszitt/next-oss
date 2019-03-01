const {getFile, getListByFolder, deleteFiles} = require("./oss");
const {getFolder, message} = require("./base");


let version, removeFiles, folder;





// 获取要刪除的所有文件路径
async function getAllFiles(){
  let result = await getListByFolder(folder+"/_next/static/"),
    build = await getFile(folder+"/_next/BUILD_ID"),
    files = result.objects;


  let file = "";
  files.forEach(item => {
    if(file !== "") file += "\n";
    file += item.name;
  });
  message(`打包版本号：${build}`);
  message(`云文件：${file}`);



  files.forEach(item => {
    let file = item.name.match(/\/[A-Za-z\d._-]+$/)[0].replace(/^\//, "");
    // 刪除以前的版本
    if(/\/static\/[A-Za-z\d_-~!@#$%^&*+=]{21}\//.test(item.name)){
      if(!eval('/'+ build +'/').test(item.name)) removeFiles.push(item.name);
    } else if(!version[file]){    // 没从版本文件中找到的也删除
      removeFiles.push(item.name);
    }
  });

  message(`将要删除的云文件：${removeFiles.length > 0 ? removeFiles : "没有"}`);
  await deleteFiles(removeFiles);
}

async function remove(){
  try {
    if(!folder) folder = getFolder();

    message(`获取版本文件：${folder}/_next/version.json`);
    version = await getFile(folder+"/_next/version.json");
    message(`version文件：${version}`);
    if(version) version = JSON.parse(version);

    removeFiles = [];
    await getAllFiles();

    console.log(removeFiles.length > 0 ? "delete success" : "没有要删除的文件");
  } catch(err) {
    console.log(err);
  }
}


exports.remove = remove;
