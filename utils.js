'use strict';

const cryptoJS = require('crypto-js');
const fetch = require('node-fetch');

const { getKey, saveKey } = require('./store.js');
const { API_SECRET } =require('./dataMap.js');

const MD5 = (val) => {
  return cryptoJS.MD5(val.toString()).toString();
};

const btoa = (str) => {
  return Buffer.from(str).toString('base64');
};

const atob = (b64Encoded) => {
  Buffer.from(b64Encoded, 'base64').toString()
};

const mFn = function(e) {
  const t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
  return e === null ? t : ("object" === typeof e) ? JSON.stringify(e) : e.toString();
}

const xFn = (val) => {
  return Array.from(mFn(val)).reverse().join("");
}

const bFn = (secretStr, e) => {
  const t = cryptoJS.enc.Utf8.parse(e.toString());
  const n = cryptoJS.enc.Utf8.parse(xFn(e.toString()));
  const i = cryptoJS.AES.decrypt(
    secretStr.toString(), t,
  {
      iv: n,
      mode: cryptoJS.mode.CBC,
      padding: cryptoJS.pad.Pkcs7
  });
  return cryptoJS.enc.Utf8.stringify(i);
}

const pFn = (val) => {
  return mFn(val).trim();
}

const bbFn = function(e) {
  return !!(null === e) || ("object" === typeof e ? 0 === Object.keys(e).length : "" === mFn(e).trim());
}

const PFn = (val) => {
  return !bbFn(val);
}

const randomId = () => {
  const list = [];
  for (let i = 0; i < 36; i++)
    list[i] = "0123456789abcdef".substr(Math.floor(16 * Math.random()), 1);
  list[14] = "4";
  list[19] = "0123456789abcdef".substr(3 & list[19] | 8, 1);
  list[8] = list[13] = list[18] = list[23] = "-";
  return list.join("");
}

const _defineProperty = (e, r, n) => {
  return r in e ? Object.defineProperty(e, r, {
    value: n,
    enumerable: true,
    configurable: true,
    writable: true,
  })
  : e[r] = n, e;
}

const lFn = function(A) {
  const obj = new Object();
  if (bbFn(A)) return obj;
  const n = new RegExp("[?&][^&]+=?[^&]*", "g");
  const i = A.match(n);
  if (bbFn(i)) return obj;
  for (let r = 0; r < i.length; r++) {
      let a = i[r].substring(1).split("=");
      Object.assign(obj, _defineProperty({}, a[0], 2 == a.length ? a[1] : ""));
  }
  return obj;
}

const zFn = function(A, e) {
  var t = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
  if (t) {
      for (var n = !1, i = 0; i < e.length; i++) if (-1 != e[i].indexOf(A) || -1 != A.indexOf(e[i])) {
          n = !0;
          break;
      }
      return n;
  }
  return -1 != e.indexOf(A);
}

const yFn = (A) => {
  const e = pFn(A).toLowerCase();
  return PFn(e) && !zFn(e, [ "null", "undefined", "{}", "[]" ]) && e.length <= 2048;
}

const hFn = function(A) {
  var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2;
  return (Array(e).join(0) + A).slice(-e);
}

const qFn = function(A) {
  for (var e = "", t = 0; t < A.toString().length; t++) {
      var n = parseInt(A.toString().charCodeAt(t), 10);
      e += "\\u" + hFn(n.toString(16), 4).toUpperCase();
  }
  return e;
}

const SFn = function(A) {
  return btoa(A.toString());
}

const jFn = (data, e, timestamp, xNonce) => {
  const i = new Array();
  Object.keys(data).sort().forEach(function(e) {
    const val = data[e];
    if (yFn(val)) {
        i.push(qFn(e) + "=" + qFn(pFn(val)));
    }
  })
  if (yFn(e)) {
    i.push(qFn(pFn(e)));
  }
  i.push("timestamp=" + timestamp),
  i.push("nonce=" + xNonce),
  i.push("key=" + API_SECRET);
  const a = i.join("&"),
  o = MD5(timestamp + "@@" + API_SECRET),
  s = MD5(xNonce + "@@" + API_SECRET),
  u = SFn(a);
  return MD5("[" + o + "#" + MD5(u) + "#" + s + "]");
}

/**
 * 解码密文
 * @param {string} xSign 解码签名
 * @param {string} encryptString 密文
 * @returns 明文
 */
const decrypt = (xSign, encryptString) => {
  const list = MD5(xFn(xSign + ":" + API_SECRET)).substring(8, 24).toUpperCase().split("");
  for (let i = 0; i < list.length / 2; i++) {
    const temp = list[2 * i];
    list[2 * i] = list[2 * i + 1];
    list[2 * i + 1] = temp;
  }
  const f = bFn(encryptString, list.join(""));
  let result = null;
  try {
    result = JSON.parse(f);
  } catch (error) {
    console.error(error);
    result = f;
  }
  return result;
};

/**
 * 请求函数
 * @param {string} url 请求api
 * @param {string} method 请求method
 * @param {object} data 请求数据
 * @returns 请求结果
 */
const request = async(url, method, data = {}) => {
  const startTime = +new Date();
  const realMethod = method.toLowerCase();
  const body = JSON.stringify(data);
  const xVersion = getKey('xVersion');
  const host = getKey('host');
  const timestamp = new Date().getTime().toString();
  const xNonce = randomId();

  const n = (realMethod === 'get') ? Object.assign(lFn(url), data) : lFn(url);
  const xSign = jFn(n, (realMethod === 'get') ? '' : body, timestamp, xNonce);
  const accessToken = getKey('accessToken');

  const headers = {
    'Host': host,
    'Connection': 'keep-alive',
    'x-nonce': xNonce,
    'x-token': accessToken,
    'content-type': 'application/json',
    'x-sign': xSign,
    'x-timestamp': timestamp,
    'Accept-Encoding': 'gzip,compress,br,deflate',
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac',
    'Refer': 'https://servicewechat.com/wxf47aa38d871be854/166/page-frame.html',
  };
  const queryString = (realMethod === 'get')
    ? Object.entries(data).map(item => {
      return encodeURIComponent(item[0]) + '=' + encodeURIComponent(item[1]);
    }).join('&')
    : '';

  const resp = await fetch('https://' + host + `/weixin-miniapp-bdkq@${xVersion}${url}${queryString && '?' + queryString}`,
    { method: realMethod, headers, data: realMethod === 'post' ? body : null });
  console.debug(`${realMethod} ${url}: ${+new Date() - startTime}ms`, resp.status);
  if (!(resp.status >= 200 && resp.status < 300)) throw new Error(`${url} status ${resp.status}`);
  let resData = {};
  try {
    resData = await resp.json();
  } catch (e) {
    console.error(e);
  }
  if (!resData.encrypt) {
    console.error(resData);
    throw new Error(`${realMethod} ${url} 请求错误`);
  }
  const decryptData = decrypt(xSign, resData.encrypt);
  if (decryptData.status !== 0) {
    console.error(decryptData);
    throw new Error(decryptData.message);
  }
  return decryptData.data || {};
}

module.exports.decrypt = decrypt;
module.exports.request = request;
module.exports.lFn = lFn;
module.exports.jFn = jFn;