## RegieKI Controller

Native debugging application for *Windows, Linux, macOS* for:

* testing multiple PDACs on a local network
* sending group messages to reboot or display text
* a backup sequencer for stage production (untested)

Example static IPs and general configuration including remote sound and lighting experiments can be found in `bin/db.json` or [db.json](https://github.com/RegieKI/regieki-controller/blob/main/bin/db.json)

**Binaries**

Pre-built binaries can be found in [releases](https://github.com/RegieKI/regieki-controller/releases).

**Installation**

```
cd node-osc && pnpm i && pnpm run build
cd ../
pnpm i
pnpm start:dev
```

**Screenshots**

* [screenshot #1](https://github.com/RegieKI/regieki-controller/blob/pdac/media/screen1.png)
* [screenshot #2](https://github.com/RegieKI/regieki-controller/blob/pdac/media/screen2.png)


#### License

[MIT](https://github.com/RegieKI/pdac/blob/main/LICENSE-MIT.md)