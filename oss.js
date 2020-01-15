const Aliyun = require('ali-oss');
const qiniu = require("qiniu");
const ObsClient = require('esdk-obs-nodejs');
const upyun = require('upyun');
const Base = require('./base');



class OSS {
  constructor(options){
    try {
      for(let key in options){
        switch(key){
          case "huawei":
            this.huawei = new ObsClient({
              access_key_id: options.huawei.accessKeyId,
              secret_access_key: options.huawei.secretAccessKey,
              server : options.huawei.server
            });
            this.type = key;
            this.options = options[key];
            break;
          case "aliyun":
            this.aliyun = new Aliyun(options.aliyun);
            this.aliyun.useBucket(options.aliyun.bucket);
            this.type = key;
            this.options = options[key];
            break;
          case "qiniu":
            let config = new qiniu.conf.Config();
            config.zone = qiniu.zone.Zone_z1;
            this.qiniu = {};
            this.qiniu.formUploader = new qiniu.form_up.FormUploader(config);
            this.qiniu.mac = new qiniu.auth.digest.Mac(options.qiniu.accessKey, options.qiniu.secretKey);
            this.qiniu.bucketManager = new qiniu.rs.BucketManager(this.qiniu.mac, config);
            this.type = key;
            this.options = options[key];
            break;
          case "upyun":
            console.log(options.upyun);
            let service = new upyun.Service(
              options.upyun.serviceName,
              options.upyun.operatorName,
              options.upyun.operatorPassword
            );
            this.upyun = new upyun.Client(service);
            this.type = key;
            this.options = options[key];
            break;
        }
        if(this.type) break;
      }
    } catch (err) {
      throw err;
    }
  }

  huaweiPromise(method, params={}){
    return new Promise(((resolve, reject) => {
      params.Bucket = this.options.bucket;
      this.huawei[method](params, (err, result) => {
        if(err){
          reject(err);
        }else{
          resolve(result);
        }
      })
    }))
  }

  qiniuPutFile(token, path, localFile){
    return new Promise(((resolve, reject) => {
      this.qiniu.formUploader.putFile(
        token,
        path,
        localFile,
        new qiniu.form_up.PutExtra(),
        (err, respBody, respInfo) => {
          if(err){
            reject(err);
          }else{
            resolve(respInfo);
          }
        })
    }))
  }

  qiniuListPrefix(prefix){
    return new Promise(((resolve, reject) => {
      this.qiniu.bucketManager.listPrefix(
        this.options.bucket,
        {prefix},
        (err, respBody, respInfo) => {
          if(err){
            reject(err);
          }
          if(respInfo.statusCode == 200){
            resolve(respBody);
          }
        })
    }))
  }

  // 上传文件
  async uploadFile(path, OSSPath, cover){
    let ignoreCover = !cover && /\.(woff|svg|ttf|eot|woff2|png|jpe?g|gif)(\?.*)?$/.test(OSSPath);
    switch(this.type){
      case "upyun":
        if(ignoreCover){
          try {
            let files = (await this.upyun.listDir(OSSPath)).files;
            if(files.length > 0){
              return;
            }
          } catch(err) {

          }
        }
        try {
          let content = await Base.getReadFile(path, null),
            result = await this.upyun.putFile(OSSPath, content);
          if(typeof result === "boolean") return result;
          if(typeof result === "object"){
            if(result["file-type"]) return true;
            throw result;
          }
        } catch(err){
          throw err;
        }
        break;
      case "qiniu":
        let options = {
            scope: `${this.options.bucket}:${OSSPath}`,
          },
          putPolicy;
        if(ignoreCover){
          try {
            let files = (await this.qiniuListPrefix(OSSPath)).items;
            files = files.filter(item => item.key === OSSPath);
            if(files.length > 0){
              return;
            }
          } catch(err) {

          }
        }
        try {
          putPolicy = new qiniu.rs.PutPolicy(options);
          let result = await this.qiniuPutFile(
            putPolicy.uploadToken(this.qiniu.mac),
            OSSPath,
            path
          );
          return result.statusCode === 200;
        } catch(err){
          throw err;
        }
        break;
      case "huawei":
        if(ignoreCover){
          try {
            let data = await this.huaweiPromise("getObjectMetadata", {
              Key: path,
            });
            if(data.InterfaceResult){
              return;
            }
          } catch(err) {

          }
        }
        try {
          let result = await this.huaweiPromise("putObject", {
            Key: OSSPath,
            SourceFile: path
          });
          return result.CommonMsg.Status === 200;
        } catch(err){
          throw err;
        }
        break;
      case "aliyun":
        if(ignoreCover){
          try {
            let data = await this.aliyun.get(path);
            if(data.res.status === 200){
              return;
            }
          } catch(err) {

          }
        }
        try {
          return await this.aliyun.put(OSSPath, path);
        } catch(err){
          throw err;
        }
    }
  }

  // 获取云文件夹下的文件、文件夹
  async getListByFolder(prefix){
    let _this = this,
      files=[];
    async function getFiles(path){
      let now_files = (await _this.upyun.listDir(path)).files;
      for(let item of now_files){
        if(item.type === "N"){
          item.name = `${path.replace(/\/$/, "")}/${item.name}`;
          files.push(item);
        } else if(item.type === "F"){
          await getFiles(`${path.replace(/\/$/, "")}/${item.name}`);
        }
      }
    }
    switch(this.type){
      case "upyun":
        try {
          await getFiles(prefix);
          return files;
        } catch(err) {
          throw err;
        }
        break;
      case "qiniu":
        try {
          files = (await this.qiniuListPrefix(prefix)).items;
          files = files.map(item => {
            item.name = item.key;
            return item;
          });
          return files;
        } catch(err) {
          throw err;
        }
        break;
      case "huawei":
        try {
          files = (await this.huaweiPromise("listObjects", {
            Prefix : prefix
          })).InterfaceResult.Contents;
          files = files.map(item => {
            item.name = item.Key;
            return item;
          });
          return files;
        } catch(err){
          throw err;
        }
        break;
      case "aliyun":
        try {
          return (await this.aliyun.list({prefix})).objects;
        } catch(err){
          throw err;
        }
        break;
    }
  }

  // 删除文件
  async deleteFile(path){
    let result;
    switch(this.type){
      case "upyun":
        try {
          return await this.upyun.deleteFile(path);
        } catch(err) {
          throw err;
        }
       break;
      case "qiniu":
        result = await new Promise(((resolve, reject) => {
          this.qiniu.bucketManager.delete(
            this.options.bucket,
            path,
            (err, respBody, respInfo) => {
              if(err){
                throw err;
                reject(err);
              }
              resolve(respInfo);
            })
        }));
        return result.statusCode >= 200 && result.statusCode < 300;
      case "huawei":
        try {
          result = await this.huaweiPromise("deleteObject", {
            Key: path
          });
          return result.CommonMsg.Status >= 200 && result.CommonMsg.Status < 300;
        } catch(err){
          throw err;
        }
        break;
      case "aliyun":
        try {
          result = await this.aliyun.delete(path);
          return result.res && result.res.status >= 200 && result.res.status < 300;
        } catch(err){
          throw err;
        }
        break;
    }
  }
}

module.exports = OSS;
