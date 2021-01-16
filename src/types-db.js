

module.exports = {
	db: {
		mode: 'director',
		production: false,
		data: [],
		current_pdac: null,
		pdacs: {
			"pdac-stage-01": {
				ip_address: "10.0.8.210",
				hostname: "pdac-stage-01"
			},
			"pdac-stage-02": {
				ip_address: "10.0.8.211",
				hostname: "pdac-stage-02"
			},
			"pdac-stage-03": {
				ip_address: "10.0.8.212",
				hostname: "pdac-stage-03"
			},
			"pdac-stage-04": {
				ip_address: "10.0.8.213", 
				hostname: "pdac-stage-04"
			},
			"pdac-stage-05": {
				ip_address: "10.0.8.214",
				hostname: "pdac-stage-05"
			}
		},
		servers: {
			"audio-machine": {
				type: 'osc',
				name: "audio-machine",
				url: '10.0.2.1:7331',
				test: 'localhost:7331',
				cmds: [ 
					{ url: '*', value: '' }, 
					{ url: '/scenes', value: 0 }, 
					{ url: '/tracks', value: 0 },
				]
			},
			"regieki": { 
				name: 'regieki', 
				type: 'internal', 
				cmds: [ 
					{ url: 'action', value: '', opts: ['act','wait','button','text'] }, 
					{ url: 'time', value: 10 }
				] 
			},
			"av-machine": { 
				name: 'av-machine', 
				type: 'sockets', 
				url: '10.0.8.201:8765',
				test: '*:8765',
				cmds: [
					{ url: 'pdac_visual', opts: ["3D", "score", "etc" ] },
					{ url: 'main_visual', opts: ["melt", "something", "etc" ] }
				] 
			}
		},
		clients: {
			"ai-machine": {
				type: 'osc',
				name: "ai-machine",
				url: '10.0.8.202:7777',
				test: 'localhost:7777'
			}
		}
	}
}