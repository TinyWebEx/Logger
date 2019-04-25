# TinyWebEx Logger

Console logging module that makes logging easier and adjustable.

## Features

* [continue using `console.log` or others](#using-with-consolelog), but prettify and enhance log messages
* prepends messages with an indentifier for your add-on, so you know which of your (installed) add-ons is emitting the message in the debugger
* [allows users to enable/disable debug logging](#addon-settings)

## Setup

This module does require two files in the `data` dir, located in the parent directory of this module, i.e. this is the files tree that is required:
```
.
├── Logger
│   ├── Logger.js
│   ├── CONTRIBUTORS
│   ├── LICENSE.md
│   ├── README.md
│   └── ...
├── data
│   ├── MessageLevel.js
│   ├── GlobalConsts.js
│   └── ...
...
```

The file `GlobalConsts.js` needs to export the constant `ADDON_NAME_SHORT`, which specifies the addon name to prepend log messages with. You can find an example file in [`examples/GlobalConsts.js`](examples/GlobalConsts.js).

## Using with console.log

If you want the Logger module to overwrite the usual `console.log`, `console.error` etc. functions, you can include the `OverwriteConsoleLog` module. The advantage of this is, that other modules do not have to depend on this one then, but can just call `console` functions correctly and fall back to "normal" browser console logging.

It is recommend to load this script asynchronously (via the [async keyword](https://developer.mozilla.org/docs/Web/HTML/Element/script#attr-async)) and directly in the head as your first script, so the new logging mechanism is used right from the beginning.

```html
<head>
	<!-- […] -->
	<script type="module" src="./Logger/OverwriteConsoleLog.js" async></script>
</head>
```

## Manually calling Logger

Alternatively, you can call the Logger manually via the `Logger.js` module. You have similar quick methods as you know from the `console` API, like `logInfo`, `logWarning`, etc.
Additionally, you could use the `log` function and pass a `MESSAGE_LEVEL` as the first parameter.

## Addon settings

The addon tries to load a setting called `debugMode` via [the TinyWebEx AddonSettings module](https://github.com/TinyWebEx/AddonSettings). This is a _boolean_ setting you can expose on the options page to let the user adjust the setting.

If it returns `true`, it enables "debug logging", i.e. the "info level" logging (i.e. `logInfo`, respectively `console.log` and `console.debug`) are ignored and not logged.
Only if set to `false` it ignores these log messages and does not log it. This is useful in production/if you do not want to log too many detailed messages.

**Note:** If the value is not specified (i.e. not loaded yet from the add-on settings, or manually set to `null` or `undefined`), the debug logging will be _enabled_! This prevents the loss of debug logging messages in case loading the add-on options via `AddonSettings` (and the internal storage APIs) takes longer than the first call to a debug/info log.

## API note

Everything in the `internal` dir is considered to be an internal module/file and thus not be considered to be an API under _semantic versioning_. That means the API there can change at any time, do _not_ import anything from there!
