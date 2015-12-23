### eval真的在js中一无是处吗

js中的eval被很多人所诟病，包括其作用域各方面的问题。在绝大多数的场景中，eval的操作都几乎能被普通的代码语句所替代。
<br>
但我碰到一种情况，似乎除了用eval语句来完成，无法找到更好的解决方案。例如，某组件alert message时，其阻塞式alert序列的用法为
```javascript
message({
    text: 'foo',
    callback: function () {
        message({
            text: 'bar',
            callback: function () {
                message({
                    text: 'tux'
                })
            }
        })
    }
})
```
假如我想在有个数组var arr = ['aa', 'bb', 'tt', 'ww', ...]，希望以上述方式阻塞式alert输出，该怎么写？
<br/>
首先是想办法得完整的参数形式，我选择尾部递归的方式
```javascript
var param;
param = (function (obj) {
    var newObj;
    newObj = {
        text: arr.pop()
    }

    if (obj) {
        
        newObj['callback'] = function () {
            Message(obj);  
        }
       
    }

    if (arr.length) {
        return arguments.callee(newObj);
    } else {
        return newObj;
    }

})();
```
这样行行得通吗，可以console.log(param)，结果是多少呢
```javascript
{
    text: 'aa',
    call: function () {
        Message(obj);
    }
}
```
在递归过程中callback的赋值并没有包含之前递归进来的值，只会是普普通通的一个脱离context的语句，怎么办，这个时候eval就派上用场了，如果我们这么写
```javascript
var param;
param = (function (obj) {
    var newObj, callback;
    newObj = {
        text: arr.pop()
    }

    if (obj) {
        
        callback = "function () {" +
            "Message({" +
                "text: '" + obj.text + "'" + 
                (obj.callback ? ("," +"callback:" + obj.callback.toString()) : '') +
            "});" +
        "}";

        eval("newObj['callback'] = " + callback);
       
    }

    if (arr.length) {
        return arguments.callee(newObj);
    } else {
        return newObj;
    }

})();

```
就可以解决上述问题。
