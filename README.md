# VisualizationComponents
VisualizationComponents简称vico，是面向DOM提供简单的ui组件接口。

## 依赖
vico基于jquery而写，须引入jquery。
```html
<script src="http://cdn.bootcss.com/jquery/2.1.4/jquery.js"></script>
```
其图标选择器组件使用免费的[ionicons](http://ionicons.com/),在使用图标选择器时需引入其样式表
```html
<link rel="stylesheet" href="http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
```

## 引入
基本的vico提供一个js脚本跟一个样式表，需引入
```html
<script src="path/to/vico.js"></script>
```
```html
<link rel="stylesheet" href="path/to/vico.css" />
```
vico提供了ionicons的图标列表序列，用于实例化图标选择器时使用。因此在使用图标选择器时需引入
```html
<script src="path/to/ioniconlist.js"></script>
```

## 用法

### alert

可通过实例化的构造参数方式
```javascript
vico([1, 2, 3]).alert();
```
或者在调用方法中声明
```javascript
vico().alert({
  queue: [1, 2, 3],
  title: 'foo',
  button: 'confirm',
  callback: function () {
    // things to do after the queue is alerted
  }
});
```
对于回调，也提供了一种更接近语义的表示方式
```javascript
vico().alert({
  queue: [1, 2, 3],
  title: 'foo',
  button: 'confirm'
}).then(function () {
  // things to do
});
```

### autocomplete
实例化参数接受需要实例化元素的选择器表达式，调用方法中声明数据来源及其他参数。
对于前端静态数据
```javascript
vico('#foo').autocomplete({
  source: ['beijing', 'shenzhen', 'shanghai', 'guangzhou', 'wuhan']
});
```
对于后端静态数据
```javascript
vico('#foo').autocomplete({
  source: 'path/to/source',
  async: false // 默认为true
});
```
若筛选及相关操作交由用户自定义，
```javascript
vico('#foo').autocomplete({
  source: function (query, response) {
    // to do with query and get the ret
    response(ret);
  }
});
```

### icon picker
```javascript
vico().iconPicker({
  multiple: false,
  callback: function (res) {
      // res为数组类型，每个元素为一个object，包含图标的class及定义的title
      // to do with the res
  }
});
```
