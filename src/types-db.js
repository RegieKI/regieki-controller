

module.exports = {
	db: {
		mode: 'director',
		"current_pdac": null,
		"pdacs": {
			"pdac-stage-01": {
			  "ip_address": "10.0.8.210",
			  "hostname": "pdac-stage-01"
			},
			"pdac-stage-02": {
			  "ip_address": "10.0.8.211",
			  "hostname": "pdac-stage-02"
			},
			"pdac-stage-03": {
			  "ip_address": "10.0.8.212",
			  "hostname": "pdac-stage-03"
			},
			"pdac-stage-04": {
			  "ip_address": "10.0.8.213", 
			  "hostname": "pdac-stage-04"
			},
			"pdac-stage-05": {
			  "ip_address": "10.0.8.214",
			  "hostname": "pdac-stage-05"
			}
		},
		dests: {
			"audio-machine": {
				type: 'osc',
				name: "audio-machine",
				url: '10.0.2.1:7331',
				test: 'localhost:7331',
				cmds: [ 
					{ url: '', value: '' }, 
					{ url: '/scenes', value: 0 }, 
					{ url: '/tracks', value: 0 },
				]
			},
			"av-machine": {
				type: 'off',
				name: "av-machine",
				url: '10.0.8.203:5678',
				test: 'localhost:5678',
				cmds: [
					{ url: 'main', value: '' },
					{ url: 'side', value: '' },
					{ url: 'scene', value: '' }
				]
			},
			"ai-machine": {
				type: 'off',
				name: "ai-machine",
				url: '10.0.8.202:7777',
				test: 'localhost:7777',
				cmds: [
					{ url: '/enable', value: 0 }
				]
			},
			"pdac-stage-01": {
				type: 'sockets',
				name: "pdac-stage-01",
				url: '10.0.8.210:8765',
				test: 'localhost:8210',
				cmds: [ 
					{ url: 'type', value: '', opts: [ "wait", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ] }
				]
			},
			"pdac-stage-02": {
				type: 'sockets',
				name: "pdac-stage-02",
				url: '10.0.8.211:8765',
				test: 'localhost:8211',
				cmds: [ 
					{ url: 'type', value: '', opts: [ "wait", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ] }
				]
			},
			"pdac-stage-03": {
				type: 'sockets',
				name: "pdac-stage-03",
				url: '10.0.8.212:8765',
				test: 'localhost:8212',
				cmds: [ 
					{ url: 'type', value: '', opts: [ "wait", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ] }
				]
			},
			"pdac-stage-04": {
				type: 'sockets',
				name: "pdac-stage-04",
				url: '10.0.8.213:8765',
				test: 'localhost:8213',
				cmds: [ 
					{ url: 'type', value: '', opts: [ "wait", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ] }
				]
			},
			"pdac-stage-05": {
				type: 'sockets',
				name: "pdac-stage-05",
				url: '10.0.8.214:8765',
				test: 'localhost:8214',
				cmds: [ 
					{ url: 'type', value: '', opts: [ "wait", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ] }
				]
			}
		}
	},
	pdac: {
		ip_address: '',
		hostname: ''
	}
}