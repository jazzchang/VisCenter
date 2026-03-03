/**
 * CSInterface.js - Bundled minimal CSInterface for VisCenter
 * Adapted from Adobe CEP CSInterface SDK (Apache 2.0)
 */

var SystemPath = {
    USER_DATA: 'userData',
    COMMON_FILES: 'commonFiles',
    MY_DOCUMENTS: 'myDocuments',
    APPLICATION: 'application',
    EXTENSION: 'extension',
    HOST_APPLICATION: 'hostApplication'
};

function Version(major, minor, micro, special) {
    this.major = major || 0;
    this.minor = minor || 0;
    this.micro = micro || 0;
    this.special = special || '';
}

function CSInterface() {
    // Try to get the real CEP interface
    this.__isReal = (typeof __adobe_cep__ !== 'undefined');
}

CSInterface.prototype.getSystemPath = function (pathType) {
    var path = '';
    try { path = decodeURIComponent(__adobe_cep__.getSystemPath(pathType)); } catch (e) { }
    return path;
};

CSInterface.prototype.evalScript = function (script, callback) {
    if (!this.__isReal) {
        console.warn('[VisCenter] CSInterface not available (running outside Illustrator)');
        if (typeof callback === 'function') callback('error');
        return;
    }
    try {
        __adobe_cep__.evalScript(script, callback || function () { });
    } catch (e) {
        console.error('[VisCenter] evalScript error:', e);
        if (typeof callback === 'function') callback('error');
    }
};

CSInterface.prototype.openURLInDefaultBrowser = function (url) {
    try { __adobe_cep__.openURLInDefaultBrowser(url); } catch (e) { }
};

CSInterface.prototype.getExtensionID = function () {
    try { return __adobe_cep__.getExtensionId(); } catch (e) { return ''; }
};

CSInterface.prototype.closeExtension = function () {
    try { __adobe_cep__.closeExtension(); } catch (e) { }
};

CSInterface.prototype.addEventListener = function (type, listener, obj) {
    try { __adobe_cep__.addEventListener(type, listener, obj); } catch (e) { }
};

CSInterface.prototype.dispatchEvent = function (event) {
    try { __adobe_cep__.dispatchEvent(event); } catch (e) { }
};

var csInterface = null;
function getCSInterface() {
    if (!csInterface) csInterface = new CSInterface();
    return csInterface;
}
