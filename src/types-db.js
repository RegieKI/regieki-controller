module.exports = {
	db: {
		"current_pdac": null,
		"pdacs": {},
		dests: {
			"audio-machine": {
				type: 'osc',
				name: "audio-machine",
				path: '10.0.8.111',
				cmds: ['/music/audio 3', '/music/audio 8', '/fx/trigger 1', '/fx/trigger 2', '/fx/trigger 2']
			},
			"av-machine": {
				type: 'sockets',
				name: "av-machine",
				path: '10.0.8.203',
				cmds: ['["scene4", "scene1"]', '["scene4", "scene1"]']
			},
			"ai-machine": {
				type: 'osc',
				name: "ai-machine",
				path: '10.0.8.202',
				cmds: ['/ai/type 1', '/ai/type 2']
			},
			"stage-pdac-01": {
				type: 'osc',
				name: "stage-pdac-01",
				path: '10.0.8.202',
				cmds: [ "pause", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ]
			},
			"stage-pdac-02": {
				type: 'osc',
				name: "stage-pdac-02",
				path: '10.0.8.202',
				cmds: [ "pause", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ]
			},
			"stage-pdac-03": {
				type: 'osc',
				name: "stage-pdac-03",
				path: '10.0.8.202',
				cmds: [ "pause", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ]
			},
			"stage-pdac-04": {
				type: 'osc',
				name: "stage-pdac-04",
				path: '10.0.8.202',
				cmds: [ "pause", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ]
			},
			"stage-pdac-05": {
				type: 'osc',
				name: "stage-pdac-05",
				path: '10.0.8.202',
				cmds: [ "pause", "angst", "freude", "liebe", "trauer", "uberraschung", "verachtung", "wut" ]
			}
		}
	},
	pdac: {
		ip_address: '',
		hostname: ''
	}
}