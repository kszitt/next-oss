const {getFile, getListByFolder, deleteFile} = require("../oss/oss");
const {getOptions, message} = require("../base");
let version, options;

// 获取要刪除的所有文件路径
async function getAllFiles(){
  let path = options.isText ?
    (options.folder+"/_next/") :
    (options.folder+"/"),
    files = (await getListByFolder(path)).objects;
  if(!files || files.length === 0) return "none";

  for(let i = 0; i < files.length; i++){
    let file = files[i].name.match(/[^/]*$/)[0];
    if(!file) continue;

    if(version && !version[file]){
      await deleteFile(files[i].name);
    }
  }
}

async function remove(){
  try {
    options = getOptions();

    let versionPath = options.isNext ?
      `${options.folder}/_next/version.json` :
      `${options.folder}/version.json`;

    version = await getFile(versionPath);
    if(version) version = JSON.parse(version);

    let data = await getAllFiles();
    if(data === "none") return;

    console.log("删除成功");
  } catch(err) {
    throw err;
  }
}


exports.remove = remove;
