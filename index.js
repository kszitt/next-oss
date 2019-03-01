const NextOSS = {};
const {initAliyun} = require("./oss/aliyun");
const {config} = require("./base");
const {upload} = require("./scripts/upload");
const {remove} = require("./scripts/remove");



NextOSS.initAliyun = initAliyun;
NextOSS.config = config;
NextOSS.upload = upload;
NextOSS.remove = remove;



module.exports = NextOSS;
