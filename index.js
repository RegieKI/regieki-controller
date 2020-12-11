const {app, BrowserWindow, dialog, ipcMain, shell} = require('electron')
const path = require('path')
const promiseIpc = require('electron-promise-ipc');
const fsp = require( 'fs-promise' );
const fs = require( 'fs' );
const templates = require('./src/types-db.js')
const expandHomeDir = require('expand-home-dir')
const contextMenu = require('electron-context-menu');
const { db } = require('./src/types-db.js')
const websocket = require( 'websocket' )
const { Client, Server } = require('node-osc')
const http = require('http');


let oscClients = {}
let testWebsocketServers = {}
let testOscServers = {}


console.log('-------------------------------------------------------')

Object.keys( db.dests ).forEach( name => {
  const dest = db.dests[name]
  if (dest.type == 'osc') {

    const port = parseInt(dest.test.split(':')[1])
    const address = dest.test.split(':')[0]

    console.log('-------> TEST:OSC ', address, port)

    testOscServers[name] = new Server(port, address, () => {
      console.log('OSC Server is listening');
    })
     
    testOscServers[name].on('message', function (msg) {
      console.log(`-------> TEST:OSC ✅ received: ${msg}`);
    });
  } else if (dest.type == 'sockets') {

    try {
          const server = http.createServer( function(req, res) {
            console.log((new Date()) + ' received test websockets request for ' + req.url);
            res.writeHead(404);
            res.end();
          })

          testWebsocketServers[name] = new websocket.server( {
            httpServer: server,
            autoAcceptConnections: true
          })
          const port = dest.test.split(':')[1]
          console.log('-------> TEST:SOCKETS', port)
          server.listen(port, function() {
              console.log((new Date()) + ' test server is listening on port 8080');
          })


          testWebsocketServers[name].on('request', function(req) {

            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    console.log('-------> TEST:SOCKETS ✅ received', message.utf8Data)
                    connection.sendUTF(message.utf8Data);
                }
                else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    connection.sendBytes(message.binaryData);
                }
            });
            connection.on('close', function(reasonCode, description) {
                console.log((new Date()) + ' test peer ' + connection.remoteAddress + ' disconnected.');
            });
          })
    } catch( err ) {
      console.log('❌  error creating test server', err.message)
    }
  }
})

promiseIpc.on('oscClientConnect', args => {

  console.log('[electron-app.js] 🎷 ✨  connecting osc...', args.url );

  return new Promise( (resolve, reject) => {
    try {
      const u = args.url.split(":")
      oscClients[ args.url ] = new Client( u[0], u[1] )
      resolve( )
      console.log('[electron-app.js] 🎷 ✨ ✅  success connecting osc:', args.url );
    } catch( err ) {
      console.log('[electron-app.js] 🎷 ✨ ❌  error connecting osc:', err.message );
      reject(err.message)
    }
  })
});

promiseIpc.on('oscClientSend', (args) => {
  console.log('[electron-app.js] -----> 🎷  sending osc:', args.url, args.path, args.value );

  return new Promise( (resolve, reject) => {
    try {
      oscClients[ args.url ].send( args.path, args.value, (err) => {
        if (err) {
          console.log('[electron-app.js] -----> 🎷 ❌  sending osc error', err.message )
          return reject(err)
        }
        console.log('[electron-app.js] -----> 🎷 ✅  sending osc success' )
        return resolve( )
      })
    } catch( err ) {
      console.log('[electron-app.js] -----> 🎷 ❌  sending osc error', err.message )
      reject( err.message )
    }
  })
});

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
	});
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
});

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
	if (mainWindow === null) createWindow();
})



const readFileSync = ( url, template ) => {
  console.log('[electron.js] 📚  reading / writing file...', url);
  return new Promise( (resolve, reject) => {
    fs.access( url, fs.F_OK, (err) =>{
      if (err) {
        const j = JSON.stringify(template, null, 2);
        console.log('[electron.js] 🌀📚  writing template...', url, j);
        fsp.writeFile( url, j, 'utf8').then( res => {
          console.log('[electron.js] ✅📚  template successfully written...', url);
          resolve( j );
        }).catch( err => {
          console.log('[electron.js] ❌📚  error writing template...', url);
          reject(err);
        })
      } else {

        console.log('[electron.js] 🌀📚  opening existing...', url);
        fsp.readFile( url, 'utf8').then( (res) => {
          console.log('[electron.js] ✅📚  file successfully read...', url);
          resolve(res);
        }).catch( err => {
        console.log('[electron.js] ❌📚  error reading file...', url, err.message);
          reject(err);
        });
      }
    });
  }); 
}

promiseIpc.on('showDialogBox', (config) => {

  console.log('[electron-app.js] 👋 🚚  showDialogBox')

  return new Promise( (resolve,reject) => {
    dialog.showMessageBox(null, config).then(r => {
      resolve( r.response )
    })
  })
})


promiseIpc.on('clearCache', (args) => {
  console.log('[electron-app.js] 👋 🚚  clearCache')

  return new Promise( (resolve,reject) => {

    mainWindow.webContents.session.clearCache().finally( e => {
      mainWindow.webContents.session.clearStorageData().finally( e => {
        resolve();
      });
    })
  })
});

promiseIpc.on('getDB', args => {
  const p = path.join(app.getPath('home'), `./pdacs-db.json`);
  console.log('[electron-app.js] 👋 🚚  getDB', p)
  return readFileSync( p, templates.db );
});


promiseIpc.on('setDB', (args) => {
  const p = path.join(app.getPath('home'), `./pdacs-db.json`);
  const j =  JSON.stringify( args, null, 2 );
  console.log('[electron-app.js] 👋 🚚  setDB', p)
  return fsp.writeFile(p, j, 'utf8');
});


