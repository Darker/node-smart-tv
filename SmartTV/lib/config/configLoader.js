const fs = require("fs");

class Config {
    constructor() {
        this.datasources = {
            netflix: {
                password: "",
                email: ""
            }
        };
        this.paths = {
            vlc_path: "",
            firefox_path: "",
            videos_root_path: ""
        };
    }
}

/**
 * 
 * @param {...Config} configs
 * @return {Config}
 */
function mergeConfigs(...configs) {
    let lastConfig = null;
    for (const conf of configs) {
        if (lastConfig == null) {
            lastConfig = conf;
        }
        else {
            lastConfig = mergeObjects(lastConfig, conf)
        }
    }
    return lastConfig;
}

const configPaths = ["config/config_default.json", "config/config.json"];
/**
 * 
 * @param {...string} paths
 * @return {Config}
 */
function loadConfigs(...paths) {
    const configObjects = paths.map(loadConfig);
    return mergeConfigs(...configObjects);
}
/**
 * 
 * @param {string} filePath
 * @return {Config}
 */
function loadConfig(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ''));
    }
    catch (e) {
        console.error("ERROR reading " + filePath + " " + e.stack);
        return {};
    }
}
function mergeObjects(object, overrideObject) {
    for (let name in overrideObject) {
        if (overrideObject.hasOwnProperty(name)) {
            const value = overrideObject[name];

            if (typeof value != "object") {
                object[name] = value;
            }
            else {
                if (typeof object[name] != "object") {
                    object[name] = {};
                }
                mergeObjects(object[name], overrideObject[name])
            }
        }
    }
    return object;
}

module.exports = function () {
    return loadConfigs(...configPaths);
}
module.exports.Config = Config;