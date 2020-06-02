const { BrowserWindow } = require('electron');

class MainWindow extends BrowserWindow {
	constructor(file, isDev) {
		super({
			title: 'SysTop',
			width: isDev ? 800 : 500,
			height: 600,
			icon: './assets/icons/icon.png',
			resizable: isDev ? true : false,
			backgroundColor: 'white',
			show: false,
			webPreferences: {
				nodeIntegration: true,
			},
		});

		if (isDev) {
			this.webContents.openDevTools();
		}

		this.loadFile(file);
	}
}

module.exports = MainWindow;
