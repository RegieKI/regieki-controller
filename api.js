const {app, BrowserWindow, dialog, ipcMain, shell, remote} = require('electron')
const midi = require('midi')
const websocket = require( 'websocket' )
const http = require('http')
const { Client, Server } = require('node-osc')
const templates = require('./src/types-db.js')


let oscClients = {}
let oscServers = {}
let wsServers = {}

const readFileSync = ( url, template ) => {
	console.log('[electron.js] 📚  reading / writing file...', url)
	return new Promise( (resolve, reject) => {
		fs.access( url, fs.F_OK, (err) =>{
			if (err) {
				const j = JSON.stringify(template, null, 2)
				console.log('[electron.js] 🌀📚  writing template...', url, j)
				fsp.writeFile( url, j, 'utf8').then( res => {
					console.log('[electron.js] ✅📚  template successfully written...', url)
					resolve( j )
				}).catch( err => {
					console.log('[electron.js] ❌📚  error writing template...', url)
					reject(err)
				})
			} else {

				console.log('[electron.js] 🌀📚  opening existing...', url)
				fsp.readFile( url, 'utf8').then( (res) => {
					console.log('[electron.js] ✅📚  file successfully read...', url)
					resolve(res)
				}).catch( err => {
				console.log('[electron.js] ❌📚  error reading file...', url, err.message)
					reject(err)
				})
			}
		})
	}) 
}

module.exports = {
	listMidi: args => {

		return new Promise( (resolve, reject) => {
	 
			// Set up a new output.
			const output = new midi.Output()
			 
			// Count the available output ports.
			output.getPortCount()
			 
			// Get the name of a specified output port.
			output.getPortName(0)
			 
			// Open the first available output port.
			output.openPort(0)
			 
			// Send a MIDI message.
			output.sendMessage([176,22,1])
			 
			// Close the port when done.
			output.closePort()
		})
	},


	showDialogBox: args => {

		console.log('[electron-app.js] 👋 🚚  showDialogBox')

		return new Promise( (resolve,reject) => {
			dialog.showMessageBox(null, args).then(r => {
				resolve( r.response )
			})
		})
	},


	clearCache: (args) => {
		console.log('[electron-app.js] 👋 🚚  clearCache')

		return new Promise( (resolve,reject) => {

			remote.getCurrentWindow().webContents.session.clearCache().finally( e => {
				remote.getCurrentWindow().webContents.session.clearStorageData().finally( e => {
					resolve()
				})
			})
		})
	},

	getDB: args => {
		const p = path.join(app.getPath('home'), `./pdacs-db.json`)
		console.log('[electron-app.js] 👋 🚚  getDB', p)
		return readFileSync( p, templates.db )
	},


	setDB: (args) => {
		const p = path.join(app.getPath('home'), `./pdacs-db.json`)
		const j =  JSON.stringify( args, null, 2 )
		console.log('[electron-app.js] 👋 🚚  setDB', p)
		return fsp.writeFile(p, j, 'utf8')
	},


	// CLIENT...

	oscClientConnect: args => {

		console.log('[electron-app.js] 🎷 ✨  connecting client osc...', args.url )

		return new Promise( (resolve, reject) => {
			try {
				const u = args.url.split(":")
				oscClients[ args.url ] = new Client( u[0], u[1] )
				resolve( )
				console.log('[electron-app.js] 🎷 ✨ ✅  success connecting client osc:', args.url )
			} catch( err ) {
				console.log('[electron-app.js] 🎷 ✨ ❌  error connecting client osc:', err.message )
				reject(err.message)
			}
		})
	},

	oscClientSend: args => {
		console.log('[electron-app.js] -----> 🎷  sending client osc:', args.url, args.path, args.value )

		return new Promise( (resolve, reject) => {
			try {
				oscClients[ args.url ].send( args.path, args.value, (err) => {
					if (err) {
						console.log('[electron-app.js] -----> 🎷 ❌  sending client osc error', err.message )
						return reject(err)
					}
					console.log('[electron-app.js] -----> 🎷 ✅  sending client osc success' )
					return resolve( )
				})
			} catch( err ) {
				console.log('[electron-app.js] -----> 🎷 ❌  sending client osc error', err.message )
				reject( err.message )
			}
		})
	},

	// SERVER...

	oscServerConnect: args => {

		console.log('[electron-app.js] 🥁 ✨  connecting server osc...', args.url )

		return new Promise( (resolve, reject) => {
			try {
				const u = args.url.split(":")
				oscServers[ args.url ] = new Server( u[0], u[1] )
				resolve()
				console.log('[electron-app.js] 🥁 ✨ ✅  success connecting server osc:', args.url )
			} catch( err ) {
				console.log('[electron-app.js] 🥁 ✨ ❌  error connecting server osc:', err.message )
				reject(err.message)
			}
		})
	},

	oscServerSend: args => {
		console.log('[electron-app.js] -----> 🥁  sending server osc:', args.url, args.path, args.value )

		return new Promise( (resolve, reject) => {
			try {
				oscServers[ args.url ].send( args.path, args.value, (err) => {
					if (err) {
						console.log('[electron-app.js] -----> 🥁 ❌  sending server osc error', err.message )
						return reject(err)
					}
					console.log('[electron-app.js] -----> 🥁 ✅  sending server osc success' )
					return resolve( )
				})
			} catch( err ) {
				console.log('[electron-app.js] -----> 🥁 ❌  sending server osc error', err.message )
				reject( err.message )
			}
		})
	},

	wsServerCreate: args => {

		try {



			const u = args.url.split(":")
			const server = http.createServer( function(req, res) {
				console.log(`received test websockets request for ${req.url} `)
				res.writeHead(404)
				res.end()
			})

			wsServers[ args.url ] = new websocket.server( {
				httpServer: server,
				autoAcceptConnections: true
			})
			const port = args.url.split(':')[1]
			server.listen(port, function() {
				console.log(`test server is listening on port ${port}`)
			})


			wsServers[ args.url ].on('request', function(req) {

				connection.on('message', function(message) {
						if (message.type === 'utf8') {
								console.log('-------> TEST:SOCKETS ✅ received', message.utf8Data)
								connection.sendUTF( message.utf8Data )
						}
						else if (message.type === 'binary') {
								console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
								connection.sendBytes(message.binaryData)
						}
				})
				connection.on('close', function(reasonCode, description) {
					console.log((new Date()) + ' test peer ' + connection.remoteAddress + ' disconnected.')
				})
			})
		} catch( err ) {
			console.log('❌  error creating ws server', err.message)
			if ( wsServers[ args.url ] ) wsServers[ args.url ].close()
			delete wsServers[ args.url ]
		}
	}

}