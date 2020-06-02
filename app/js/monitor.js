const path = require('path');
const osu = require('node-os-utils');
const { ipcRenderer } = require('electron');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let alertFrequency;

// Get settings
ipcRenderer.on('settings:get', (e, settings) => {
	cpuOverload = +settings.cpuOverload;
	alertFrequency = +settings.alertFrequency;
});

document.getElementById('cpu-model').innerText = cpu.model();

document.getElementById('comp-name').innerText = os.hostname();
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;
mem.info().then((info) => (document.getElementById('mem-total').innerText = info.totalMemMb));

setDynamicInfo();

setInterval(() => {
	setDynamicInfo();
}, 1000);

function setDynamicInfo() {
	cpu.usage().then((info) => {
		document.getElementById('cpu-usage').innerText = info + '%';
		document.getElementById('cpu-progress').style.width = info + '%';
		if (info > cpuOverload) document.getElementById('cpu-progress').style.background = 'red';
		else document.getElementById('cpu-progress').style.background = '#30c88b';

		if (info > cpuOverload && runNotify(alertFrequency)) {
			notifyUser({
				title: 'CPU overload',
				body: `CPU is over ${cpuOverload}%`,
				icon: path.join(__dirname, 'img', 'icon.png'),
			});
			localStorage.setItem('lastNotify', +new Date());
		}
	});
	cpu.free().then((info) => (document.getElementById('cpu-free').innerText = info + '%'));
	document.getElementById('sys-uptime').innerText = secondsToDHMS(os.uptime());
}

function secondsToDHMS(seconds) {
	seconds = +seconds;
	const D = Math.floor(seconds / (3600 * 24));
	const H = Math.floor((seconds % (3600 * 24)) / 3600);
	const M = Math.floor((seconds % 3600) / 60);
	const S = Math.floor(seconds % 60);
	return `${D}d ${H}h ${M}m ${S}s`;
}

function runNotify(frequency) {
	if (!localStorage.getItem('lastNotify')) {
		localStorage.setItem('lastNotify', +new Date());
		return true;
	}
	const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
	const timeNow = new Date();
	const diffTime = Math.abs(timeNow - notifyTime);
	const minutesPassed = Math.ceil(diffTime / (1000 * 60));
	if (minutesPassed > frequency) return true;
	else return false;
}

function notifyUser(options) {
	new Notification(options.title, options);
}
