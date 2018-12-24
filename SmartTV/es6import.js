const fs = require("fs");
const path = require("path");
//const ClientJS = fs.readFileSync(require.resolve("./web/class/Client.js")).toString();
//fs.writeFileSync("./auth/Client.js", "// NOTE: this file is auto-generated from ./web/class/Client.js\n" +
//    ClientJS
//        .replace(/([\"\'])[^\"\']+\/event\-emitter\.js/ig, "$1eventemitter2")
//        .replace(/import +([a-z0-9_]+) +from \"([^\"]+)\"/ig, "const $1 = require(\"$2\")")
//        .replace(/export default ([a-z0-9_]+)/ig, "module.exports = $1")
//);
function transformPath(originalPath) {
    const dirname = path.dirname(originalPath);
    const basename = path.basename(originalPath);
    const newdir = path.join(dirname, "es6_transpiled_import");
    if (!fs.existsSync(newdir))
        fs.mkdirSync(newdir);
    return path.join(newdir, basename);
}

function requireES6(moduleName) {
    const realPath = moduleName;
    const targetPath = transformPath(realPath);
    if (isOutdated(realPath, targetPath)) {
        const origData = fs.readFileSync(realPath).toString();
        const result = origData.replace(/([\"\'])[^\"\']+\/event\-emitter\.js/ig, "$1eventemitter2")
            .replace(/import +([a-z0-9_]+) +from \"([^\"]+)\"/ig, "const $1 = require(\"$2\")")
            .replace(/export default ([a-z0-9_]+)/ig, "module.exports = $1")
        fs.writeFileSync(targetPath, result);
    }
    return require(targetPath);
}
function isOutdated(original, transformed) {
    if (!fs.existsSync(transformed)) {
        return true;
    }
    const origChtime = fs.statSync(original);
    const transChtime = fs.statSync(transformed);
    return origChtime.ctime.getTime() > transChtime.ctime.getTime();
}
module.exports = requireES6;