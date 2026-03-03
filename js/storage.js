/**
 * storage.js — localStorage persistence for VisCenter
 */
var VisStorage = (function () {
  var KEY = 'viscenter_files';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function save(files) {
    try {
      localStorage.setItem(KEY, JSON.stringify(files));
    } catch (e) {}
  }

  function addFile(file) {
    var files = load();
    // Avoid duplicates based on path
    var exists = files.some(function (f) { return f.path === file.path; });
    if (!exists) {
      files.push(file);
      save(files);
      return true;
    }
    return false;
  }

  function removeFile(id) {
    var files = load().filter(function (f) { return f.id !== id; });
    save(files);
  }

  function updateFile(id, changes) {
    var files = load().map(function (f) {
      if (f.id === id) {
        return Object.assign({}, f, changes);
      }
      return f;
    });
    save(files);
  }

  function generateId() {
    return 'vc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  return { load: load, save: save, addFile: addFile, removeFile: removeFile, updateFile: updateFile, generateId: generateId };
})();
