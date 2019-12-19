const NextOSS = {};
const {initAliyun} = require("./oss/aliyun");
const {config} = require("./base");
const {upload} = require("./scripts/upload");
const {remove} = require("./scripts/remove");
const {clear} = require("./scripts/clear");



NextOSS.initAliyun = initAliyun;
NextOSS.config = config;
NextOSS.upload = upload;
NextOSS.remove = remove;
NextOSS.clear = clear;



module.exports = NextOSS;
