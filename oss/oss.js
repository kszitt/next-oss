const Aliyun = require('ali-oss');



class OSS {
  constructor(options){
    switch(true){
      case "aliyun" in options:
        this.aliyun = new Aliyun(options.aliyun);
        this.aliyun.useBucket(options.aliyun.bucket);
        this.type = "aliyun";
        break;
    }
  }

  // 文件是否存在
  async exist(path){
    switch(this.type){
      case "aliyun":
        return await this.aliyun.get(path);
    }
  }

  // 上传文件
  async uploadFile(path, OSSPath, cover){
    switch(this.type){
      case "aliyun":
        if(!cover && /\.(woff|svg|ttf|eot|woff2|png|jpg|gif)(\?.*)?$/.test(OSSPath)){
          try {
            let data = await this.exist(OSSPath);
            if(data.res.status === 200){
              return;
            }
          } catch(err) {

          }
        }
        try {
          await this.aliyun.put(OSSPath, path);
        } catch(err){
          throw err;
        }
        return true;
    }
  }

  // 获取云文件夹下的文件、文件夹
  async getListByFolder(prefix){
    switch(this.type){
      case "aliyun":
        try {
          return (await this.aliyun.list({prefix})).objects;
        } catch(err){
          throw err;
        }
    }
  }

  // 删除文件
  async deleteFile(path){
    switch(this.type){
      case "aliyun":
        try {
          return await this.aliyun.delete(path);
        } catch(err){
          throw err;
        }
    }
  }
}

module.exports = OSS;
