'use strict';

const { request } = require('./utils.js');
const { getKey, saveKey } = require('./store.js');

// 预约-获取科室
module.exports.getAfterdayDepartment = async() => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentInfo/getAfterdayDepartment.json', 'get', {
    tapIndex: branchIndex,
  });
}

// 预约-获取医生信息
module.exports.getYyDoctorInfo = async(time, deptCode) => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentInfo/getYyDoctorInfo.json', 'get', {
    time: time,
    deptCode: deptCode,
    tapIndex: branchIndex,
  });
}

// 预约-获取号源信息
module.exports.getYyScheduleInfo = async(time, deptCode, doctId) => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentInfo/getYyScheduleInfo.json', 'get', {
    tapIndex: branchIndex,
    deptId: deptCode,
    doctId: doctId,
    time: time
  });
}

// 预约-申请挂号
module.exports.YysamedayAppointment = async(patientId, scheduleId, visitDate, deptId, sguId) => {
  return await request('/api/appointmentRecord/YysamedayAppointment.json', 'post', {
    "patientId": patientId,
    "scheduleId": scheduleId,
    "visitDate": visitDate,
    "deptId": deptId,
    "sguId": sguId,
    "dist": branchIndex,
  });
}

// 获取申请日期
module.exports.getAppointmentTime = async() => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/system/getAppointmentTime.json', 'get', {
    distCode: a.data.tapIndex,
    deptCode: a.data.deptObj.deptCode
  });
}

// 明日挂号-获取科室
module.exports.getTodayDepartment = async() => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentInfo/getTodayDepartment.json', 'get', {
    tapIndex: branchIndex,
  });
}

// 明日挂号-获取医生
module.exports.getDoctorInfo = async(deptCode) => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentInfo/getDoctorInfo.json', 'get', {
    deptCode: deptCode,
    tapIndex: branchIndex,
  });
}

// 明日挂号-获取号源信息
module.exports.getScheduleInfo = async(deptCode, doctId) => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentInfo/getScheduleInfo.json', 'get', {
    tapIndex: branchIndex,
    deptId: deptCode,
    doctId: doctId
  });
}

// 预约-申请挂号
module.exports.samedayAppointment = async(patientId, scheduleId, visitDate, deptId, sguId) => {
  const branchIndex = getKey('branchIndex');
  return await request('/api/appointmentRecord/samedayAppointment.json', 'post', {
    "patientId": patientId,
    "scheduleId": scheduleId,
    "visitDate": visitDate,
    "deptId": deptId,
    "sguId": sguId,
    "dist": branchIndex,
  });
}