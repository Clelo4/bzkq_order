const { decrypt, jFn, lFn } = require('./utils.js');
const initData = require('./init.json');
const { getKey, saveKey } = require('./store.js');
const {
	// YysamedayAppointment, samedayAppointment,
	getAfterdayDepartment, getTodayDepartment,
	getYyDoctorInfo, getDoctorInfo,
	getScheduleInfo, getYyScheduleInfo
} = require('./api.js');

const parseLoginJSON = (encrypt, xSign) => {
	const res = decrypt(xSign, encrypt);
	if (res.status !== 0) {
		process.exit(-1);
	}
	const data = res.data || {};
	return data;
}

const print = (data) => {
	console.log(JSON.stringify(data, null, 2));
}

const formatDate = (timestamp) => {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`;
}

/**
 * 今日挂号
 * @param {string} deptCode 科室号码
 * @param {number} patientId 病人号码
 * @returns 
 */
const orderToday = async (deptCode, patientId) => {
	let data = await getTodayDepartment();
	// find target deptCode
	let lists = data.lists;
	const findDept = lists.find((element) => { return element.majorDetailId === ('' + deptCode); });
	if (findDept) {
		console.log('检测到科室：', findDept.deptName);
	} else {
		console.error('找不到对应的科室');
		return;
	}
	const doctorList = await getDoctorInfo(deptCode);
	if (!doctorList || doctorList.length === 0) {
		console.error('找不到挂号医生信息');
		return;
	}
	let selectedDoctor = null;
	// 选择医生算法-start
	selectedDoctor = doctorList[0];
	// 选择医生算法-end

	// 获取医生排班信息
	const scheduleInfo = await getScheduleInfo(deptCode, selectedDoctor.doctId);
	if (!scheduleInfo || scheduleInfo.length === 0) {
		console.error('找不到医生排班信息');
		return;
	}

	// 选择就诊时段算法-start
	const targetAppointment = scheduleInfo[0];
	// 选择就诊时段算法-end

	print(targetAppointment);

	const scheduleId = targetAppointment.scheduleId;
	const visitDate = formatDate(targetAppointment.visitDate);
	const deptId = targetAppointment.deptId;
	const sguId = targetAppointment.sguID;

	return;
	// data = await samedayAppointment(patientId, scheduleId, visitDate, deptId, sguId);
}

/**
 * 预约挂号
 * @param {string} deptCode 科室号码
 * @param {number} patientId 就诊人ID
 * @returns 
 */
const orderAfterDay = async(deptCode, patientId) => {
	const afterDay = formatDate(+new Date() + 2 * 3600 * 1000 * 24);
	let data = await getAfterdayDepartment();
	// find target deptCode
	let lists = data.lists || [];
	const findDept = lists.find((element) => { return element.majorDetailId === ('' + deptCode); });
	if (findDept) {
		console.log('检测到科室：', findDept.deptName);
	} else {
		console.error('找不到对应的科室');
		return;
	}
	const doctorList = await getYyDoctorInfo(afterDay, deptCode);
	if (!doctorList || doctorList.length === 0) {
		console.error('找不到挂号医生信息');
		return;
	}
	let selectedDoctor = null;
	// 选择医生算法-start
	selectedDoctor = doctorList[0];
	// 选择医生算法-end

	// 获取医生排班信息
	const scheduleInfo = await getYyScheduleInfo(afterDay, deptCode, selectedDoctor.doctId);
	if (!scheduleInfo || scheduleInfo.length === 0) {
		console.error('找不到医生排班信息');
		return;
	}

	// 选择就诊时段算法-start
	const targetAppointment = scheduleInfo[0];
	// 选择就诊时段算法-end

	if (!targetAppointment) return;
	print(targetAppointment);

	const scheduleId = targetAppointment.scheduleId;
	const visitDate = formatDate(targetAppointment.visitDate);
	const deptId = targetAppointment.deptId;
	const sguId = targetAppointment.sguID;

	return;
	// data = await YysamedayAppointment(patientId, scheduleId, visitDate, deptId, sguId);
}

const main = async() => {
	const loginData = parseLoginJSON(initData.encrypt, initData.xSigin);
	// print(loginData);
	Object.entries(loginData).forEach(item => {
		saveKey(item[0], item[1]);
	});
	saveKey('xVersion', initData.xVersion);
	saveKey('host', initData.host);
	saveKey('branchIndex', initData.branchIndex);

	const patientId = +loginData.cardInfo[0].clientId;

	const deptCode = '874001'; // '874004';
	await orderToday(deptCode);
}

main();
