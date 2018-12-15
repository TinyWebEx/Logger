# TinyWebEx Logger

Console logging module that makes logging easier and adjustable.

## Using with console.log

If you want the Logger module to overwrite the usual `console.log`, `console.error` etc. functions, you can include the `OverwriteConsoleLog` module. The advantage of this is, that other modules do not have to depend on this one then, but can just call `console` functions correctly and fall back to "normal" browser console logging.

It is recommend to load this script asynchronously (via the [async keyword](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-async)) and directly in the head as your first script, so the new logging mechanism is used right from the beginning.

```html
<head>
	<!-- […] -->
	<script type="module" src="./Logger/OverwriteConsoleLog.js" async></script>
</head>
```

## API note

Everything in the `internal` dir is considered to be an internal module/file and thus not be considered to be an API under _semantic versioning_. That means the API there can change at any time, do _not_ import anything from there!
