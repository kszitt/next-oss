const NextOSS = {};
const {initAliyun} = require("./aliyun");
const {config} = require("./base");
const {upload} = require("./upload");
const {remove} = require("./remove");



NextOSS.initAliyun = initAliyun;
NextOSS.config = config;
NextOSS.upload = upload;
NextOSS.remove = remove;



module.exports = NextOSS;
