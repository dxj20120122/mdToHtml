# Markdown to HTML 转换组件

这是一个轻量级的Markdown转HTML组件，可以将Markdown文本实时转换为HTML。该组件支持大多数常用的Markdown语法，并且可以作为Web Component使用。

## 特性

- 支持基本的Markdown语法（标题、列表、链接、图片等）
- 支持代码块高亮
- 支持表格
- 支持任务列表
- 实时预览
- 可作为Web Component使用
- 轻量级，无需额外依赖
- 易于集成到任何网页中

## 快速开始

### 安装

1. 通过CDN直接引用：
```html
<script src="https://dxj20120122.github.io/mdToHtml/md-to-html.js"></script>
```

2. 下载并本地引用：
```html
<script src="path/to/md-to-html.js"></script>
```

### 基本使用

组件支持多种初始化方式：

1. 使用content属性（推荐）：
```html
<md-to-html content="# Hello World"></md-to-html>
```

2. 使用markdown或md属性：
```html
<md-to-html markdown="# Hello World"></md-to-html>
<md-to-html md="# Hello World"></md-to-html>
```

3. 使用innerHTML方式：
```html
<md-to-html>
    # Hello World
</md-to-html>
```

4. 使用JavaScript API：
```html
<md-to-html id="markdown"></md-to-html>
<script>
    const md = document.getElementById('markdown');
    // 以下方法都可以设置内容
    md.setContent('# Hello World');     // 推荐
    md.setMarkdown('# Hello World');    // 同上
    md.render('# Hello World');         // 同上
</script>
```

### 实时预览功能

创建一个实时预览的Markdown编辑器：

```html
<textarea id="editor" placeholder="输入Markdown文本..."></textarea>
<md-to-html id="preview"></md-to-html>

<script>
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

editor.addEventListener('input', () => {
    preview.setAttribute('content', editor.value);
});
</script>
```

## Markdown语法支持

### 1. 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

### 2. 文本格式化
```markdown
**粗体文本**
*斜体文本*
***粗斜体文本***
~~删除线文本~~
`行内代码`
```

### 3. 列表
```markdown
- 无序列表项
  - 子列表项
  - 子列表项

1. 有序列表项
2. 有序列表项
   1. 子列表项
   2. 子列表项

- [x] 已完成任务
- [ ] 待完成任务
```

### 4. 链接和图片
```markdown
[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)
```

### 5. 代码块
````markdown
```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}
```
````

### 6. 表格
```markdown
| 表头1 | 表头2 |
|-------|-------|
| 内容1 | 内容2 |
| 内容3 | 内容4 |
```

### 7. 引用
```markdown
> 引用文本
>> 嵌套引用
```

### 8. 水平线
```markdown
---
***
___
```

## API参考

### 属性

- `content`: 设置Markdown内容
- `markdown`/`md`: content的别名
- `theme`: 设置主题（可选）

### 方法

- `setContent(markdown)`: 设置Markdown内容
- `setMarkdown(markdown)`: setContent的别名
- `render(markdown)`: setContent的别名
- `getHTML()`: 获取转换后的HTML内容
- `refresh()`: 强制重新渲染

### 事件

- `rendered`: 当Markdown渲染完成时触发

```javascript
const md = document.querySelector('md-to-html');
md.addEventListener('rendered', (event) => {
    console.log('Markdown已渲染完成');
});
```

## 最佳实践

### 1. 动态加载内容

```javascript
async function loadMarkdown() {
    const response = await fetch('content.md');
    const markdown = await response.text();
    document.querySelector('md-to-html').setContent(markdown);
}
```

### 2. 自定义样式

```html
<style>
md-to-html {
    /* 自定义容器样式 */
    display: block;
    padding: 1rem;
}

md-to-html h1 {
    /* 自定义标题样式 */
    color: #2c3e50;
    border-bottom: 2px solid #eee;
}

md-to-html pre {
    /* 自定义代码块样式 */
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
}
</style>
```

### 3. 与表单集成

```html
<form onsubmit="handleSubmit(event)">
    <textarea id="editor" required></textarea>
    <md-to-html id="preview"></md-to-html>
    <button type="submit">提交</button>
</form>

<script>
function handleSubmit(event) {
    event.preventDefault();
    const markdown = document.getElementById('editor').value;
    // 处理markdown内容...
}
</script>
```

## 许可证

MIT License