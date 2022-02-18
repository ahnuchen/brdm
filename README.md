# BRDM
## Quick start
install
```bash
yarn
# or
npm install
```

start dev
```bash
npm run dev
```

## TODO
- [x] key hdeader
- [x] string key content
- [x] hash key content
- [x] list key content
- [x] set key content
- [x] zset key content
- [x] search key
- [x] key list tree contextmenu
- [x] multi delete operation
- [ ] SSH tunnel
- [ ] change connection setting to localStorage
- [ ] command line tab
- [ ] select theme
- [ ] select font-family
- [x] add some page/global keyBoard shortcut
- [ ] rename project
- [ ] choose a software icon
- [ ] optimize code
- [ ] write an english README doc
- [ ] write a chinese README doc
- [ ] release version 1.0 on github
- [ ] release on Apple AppStore

## DevTools

Toggle DevTools:

* OSX: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
* Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
* Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

## Build package

Modify [builder.config.ts](./build/builder.config.ts) to edit package info.

For a full list of options see: https://www.electron.build/configuration/configuration

Create a package for OSX, Windows and Linuxw
```
npm run build
```

Please check the `release` folder after the build is complete.



## License
[MIT](./LICENSE)
