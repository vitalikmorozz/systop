const { app, Menu, Tray, ipcMain } = require('electron');
const log = require('electron-log');
const path = require('path');
const Store = require('./Store');

const MainWindow = require('./MainWindow');
const AppTray = require('./AppTray');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let tray = null;

// Init store and defaults
const store = new Store({
	configName: 'user-settings',
	defaults: {
		settings: {
			cpuOverload: 80,
			alertFrequency: 5,
		},
	},
});

function createMainWindow() {
	mainWindow = new MainWindow('./app/index.html', isDev);
}

app.on('ready', () => {
	createMainWindow();

	mainWindow.webContents.on('dom-ready', () => {
		mainWindow.webContents.send('settings:get', store.get('settings'));
	});

	const trayIconPath = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');
	tray = new AppTray(trayIconPath, mainWindow);

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	mainWindow.on('ready', () => (mainWindow = null));

	mainWindow.on('close', (e) => {
		if (!app.isQuitting) {
			e.preventDefault();
			mainWindow.hide();
		}
		return true;
	});
});

const menu = [
	...(isMac ? [{ role: 'appMenu' }] : []),
	{
		role: 'fileMenu',
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Toggle navigation',
				click: () => {
					mainWindow.webContents.send('nav:toggle');
				},
			},
		],
	},
	...(isDev
		? [
				{
					label: 'Developer',
					submenu: [{ role: 'reload' }, { role: 'forcereload' }, { type: 'separator' }, { role: 'toggledevtools' }],
				},
		  ]
		: []),
];

// Events handlers
ipcMain.on('settings:set', (e, settings) => {
	store.set('settings', settings);
	mainWindow.webContents.send('settings:get', store.get('settings'));
	mainWindow.webContents.send('settings:set:confirm');
});

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});

app.allowRendererProcessReuse = true;
