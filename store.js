'use strict';

const globalData = {};

module.exports.saveKey = (key, val) => {
  globalData[key] = val;
}

module.exports.getKey = (key) => {
  return globalData[key];
}