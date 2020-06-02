const { app, Tray, Menu } = require('electron');

class AppTray extends Tray {
	constructor(iconPath, mainWindow) {
		super(iconPath);
		this.mainWindow = mainWindow;
		this.on('click', () => this.onClick());

		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Quit',
				click: () => {
					app.isQuitting = true;
					app.quit();
				},
			},
		]);

		this.setContextMenu(contextMenu);
		this.setToolTip('SysTop');
	}

	onClick() {
		if (this.mainWindow.isVisible() === true) this.mainWindow.hide();
		else this.mainWindow.show();
	}
}

module.exports = AppTray;
