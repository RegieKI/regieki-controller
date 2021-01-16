const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron')
const path = require('path')
const promiseIpc = require('electron-promise-ipc');
const fsp = require( 'fs-promise' );
const fs = require( 'fs' )
const expandHomeDir = require('expand-home-dir')
const contextMenu = require('electron-context-menu')
const api = require('./api.js')




console.log('-------------------------------------------------------')

const production = !process.env.ELECTRON_RELOAD;

if (!production) {
	const path = require('path');
	require('electron-reload')(__dirname, {
		electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
		awaitWriteFinish: true,
	}); 
}

let mainWindow;

function createWindow () {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			webviewTag: true,
			nodeIntegration: true,
			preload: path.join(__dirname, "/preload.js")
		},
		icon: 'icon.png'
	});

	mainWindow.loadFile('public/index.html');
	// mainWindow.webContents.openDevTools({ mode: 'detach' });

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

contextMenu({
		prepend: (defaultActions, params, browserWindow) => [
				{
						label: 'Rainbow',
						// Only show it when right-clicking images
						visible: params.mediaType === 'image'
				},
				{
						label: 'Search Google for “{selection}”',
						// Only show it when right-clicking text
						visible: params.selectionText.trim().length > 0,
						click: () => {
								shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
						}
				}
		]
})

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
	if (mainWindow === null) createWindow();
})

app.on('before-quit', function() {
	console.log('[electron.js] 💀  close all opened ports...')

	for (const [key, value] of Object.entries(oscClients)) {
		const n = value.host + ':' + value.port
		value.close( function() {
			console.log(`[electron.js] 💀✅  oscClient ${n} closed.`)
		})
	}
	for (const [key, value] of Object.entries(testOscServers)) {
		const n = value.host + ':' + value.port
		value.close( function() {
			console.log(`[electron.js] 💀✅  testOscServer ${n} closed.`)
		})

	}
	for (const [key, value] of Object.entries(testWebsocketServers)) {
		console.log(`[electron.js] 💀✅  testWebsocketServer ${key} shutting down...`)
		value.shutDown()
	}

})

for (const [name, method] of Object.entries( api )) {
	console.log(name, method)
	promiseIpc.on( name, method )
}


