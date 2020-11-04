# miniprogram-analyze-cli

![](https://img.shields.io/npm/v/npm)&nbsp;![NPM](https://img.shields.io/npm/l/miniprogram-analyze-cli)

For the analysis and construction of imitated minprogram structure.



## Install

Install using npm.

```bash
npm i -s miniprogram-analyze-cli
```



## Usage

First, the project structure requirements are as follows:

```js
|-- myapp
|-- -- pages
|-- -- -- home
|-- -- -- -- index.html
|-- -- -- -- index.css
|-- -- -- -- index.js
|-- -- app.js
|-- -- app.json
|-- -- app.css
```

You can write normal templates in html file:

```html
<p>HelloWord</p>
```

And imitate the mini program syntax in js file:

```js
const app = getApp()
Page({
  name: "Home",
  data() {
    return {};
  },
  created () {
    app.globalData.name = 'Jenny'
    console.log(app);
  },
  methods: {}
});

```

Ok, you just need to execute the following commands in the required project structure directory:

```bash
miniprogram-analyze-cli build
```

Then you will get the same structure as [vue-cli](https://github.com/vuejs/vue-cli) packaged.



## License

The ISC License (ISC). Please see [License File](https://github.com/Andraw-lin/miniprogram-analyze-cli/blob/master/LICENSE). 

















































































