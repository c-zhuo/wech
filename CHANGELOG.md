# WECH (Wechat Component Helper)

## Changelog

### 0.2.2（2017.2.26）

移除无用依赖，调整readme

### 0.2.1（2017.2.25）

package.json的bugfix

### 0.2.0（2017.2.24）

组件支持watch方法，监听属性变化（触发时机为Page.setData开始时，watch不会引起多次setData）
调整目录结构，dist为wech输出目录，wechat-ide-binding-directory为小程序开发工具绑定目录

### 0.1.6（2017.2.24）

去除widget.js的require，使用时可以直接copy这个文件到项目里。jsmin压缩，修改readme

### 0.1.5（2017.2.23）

组件嵌套引用（a引用b，a引用c，b引用c）时，可以通过foo().addTo／foo().install避免冲突

### 0.1.4-0.1.1

完善文档，增加demo

### 0.1.0

基础widget.js开发
