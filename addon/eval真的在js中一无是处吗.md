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
