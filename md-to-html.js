// 定义样式字符串
const styles = `
:root {
    --primary-color: #4a90e2;
    --secondary-color: #34c759;
    --text-color: #2c3e50;
    --bg-color: #f9fafb;
    --border-color: #e2e8f0;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
}

.preview {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--bg-color);
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow-y: auto;
}

.preview h1 {
    font-size: 2.5em;
    color: #2c3e50;
    border-bottom: 2px solid #eaecef;
    padding-bottom: 0.3em;
    margin-top: 1.5em;
}

.preview h2 {
    font-size: 2em;
    color: #34495e;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
    margin-top: 1.3em;
}

.preview h3 {
    font-size: 1.5em;
    color: #3c4858;
    margin-top: 1.2em;
}

.preview blockquote {
    border-left: 4px solid var(--primary-color);
    margin: 1.5em 0;
    padding: 0.5em 1em;
    background-color: #f8f9fa;
    color: #6a737d;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.preview pre {
    background: #282c34;
    border-radius: var(--radius-md);
    padding: 1em;
    overflow-x: auto;
    margin: 1em 0;
}

.preview code {
    font-family: 'Source Code Pro', Consolas, Monaco, 'Courier New', monospace;
    color: #abb2bf;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
    background: rgba(135,131,120,0.15);
}

.preview pre code {
    background: none;
    color: #abb2bf;
    padding: 0;
}

.preview table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    background: white;
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.preview th {
    background: #f8f9fa;
    padding: 12px;
    border: 1px solid #e2e8f0;
    font-weight: 600;
}

.preview td {
    padding: 12px;
    border: 1px solid #e2e8f0;
}

.preview tr:hover {
    background: #f8f9fa;
}

.preview a {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s;
}

.preview a:hover {
    border-bottom-color: var(--primary-color);
}

.preview ul, .preview ol {
    padding-left: 1.5em;
    margin: 1em 0;
}

.preview li {
    margin: 0.5em 0;
    line-height: 1.6;
}

.preview ul li::marker {
    color: var(--primary-color);
}

.preview img {
    max-width: 100%;
    border-radius: var(--radius-md);
    margin: 1em 0;
    box-shadow: var(--shadow-sm);
}

.preview hr {
    border: none;
    height: 1px;
    background: linear-gradient(to right, var(--border-color), var(--primary-color), var(--border-color));
    margin: 2em 0;
}

/* 数学公式样式 */
.katex-display {
    display: block;
    margin: 1em 0;
    overflow-x: auto;
}
.katex {
    display: inline-block;
    vertical-align: middle;
}

/* 流程图和甘特图样式 */
.mermaid {
    margin: 1em 0;
    text-align: center;
}

/* 任务列表样式 */
.task-list-item {
    list-style-type: none;
    margin-left: -1.5em;
}
.task-list-item input {
    margin-right: 0.5em;
}

/* 脚注样式 */
.footnotes {
    font-size: 0.9em;
    color: #666;
    border-top: 1px solid #eee;
    margin-top: 2em;
    padding-top: 1em;
}
.footnote-ref {
    font-size: 0.8em;
    vertical-align: super;
}
`;

// 创建并注入样式
function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// 页面加载完成后注入样式
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
} else {
    injectStyles();
}

function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';
    
    try {
        // 统一换行符
        markdown = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 支持数学公式
        const mathBlocks = [];
        markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
            mathBlocks.push({type: 'display', formula: formula.trim()});
            return `__MATH_BLOCK_${mathBlocks.length - 1}__`;
        });
        markdown = markdown.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
            mathBlocks.push({type: 'inline', formula: formula.trim()});
            return `__MATH_BLOCK_${mathBlocks.length - 1}__`;
        });

        // 支持流程图和甘特图
        const mermaidBlocks = [];
        markdown = markdown.replace(/```mermaid([\s\S]*?)```/g, (match, code) => {
            mermaidBlocks.push(code.trim());
            return `__MERMAID_BLOCK_${mermaidBlocks.length - 1}__`;
        });

        // 处理代码块
        const codeBlocks = [];
        markdown = markdown.replace(/```([a-z]*)\s*([\s\S]*?)```/g, (match, lang, code) => {
            // 转义代码中的特殊字符
            const escapedCode = code.replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/`/g, '&#96;');
            
            // 处理缩进
            const lines = escapedCode.split('\n');
            let minIndent = Infinity;
            
            // 计算最小缩进（忽略空行）
            for (const line of lines) {
                if (line.trim().length > 0) {
                    const indent = line.match(/^\s*/)[0].length;
                    minIndent = Math.min(minIndent, indent);
                }
            }
            
            // 统一去除缩进
            let processedCode = escapedCode;
            if (minIndent > 0 && minIndent < Infinity) {
                processedCode = lines.map(line => {
                    return line.length >= minIndent ? line.slice(minIndent) : line;
                }).join('\n');
            }
            
            // 保留原始换行
            processedCode = processedCode.trimEnd();
            
            codeBlocks.push({
                lang: lang ? lang.trim() : '',
                code: processedCode
            });
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // 处理行内代码
        markdown = markdown.replace(/`([^`]+)`/g, (match, code) => {
            return `<code>${code.replace(/&/g, '&amp;')
                               .replace(/</g, '&lt;')
                               .replace(/>/g, '&gt;')}</code>`;
        });

        // 处理换行
        markdown = markdown.replace(/(?<!\n)\n(?!\n)/g, '<br>');

        const escapedChars = [];
        markdown = markdown.replace(/\\([\\`*_{}\[\]()#+\-.!n])/g, (match, char) => {
            if (char === 'n') {
                return '<br>';
            }
            escapedChars.push(char);
            return `__ESCAPED_CHAR_${escapedChars.length - 1}__`;
        });

        const htmlTags = [];
        markdown = markdown.replace(/<([a-z][a-z0-9]*)([^>]*)>([\s\S]*?)<\/\1>/g, (match, tag, attrs, content) => {
            if (['script', 'style', 'iframe'].includes(tag.toLowerCase())) {
                return match;
            }
            htmlTags.push(match);
            return `__HTML_TAG_${htmlTags.length - 1}__`;
        });

        // 处理表格
        const tables = [];
        markdown = markdown.replace(/^(\|[^\n]+\|\r?\n)((?:\|[-:\s|]+\|(?:\r?\n)?))?((?:\|[^\n]+\|(?:\r?\n)?)+)/gm, (match, header, divider, rows) => {
            tables.push({header, divider, rows});
            return `__TABLE_${tables.length - 1}__`;
        });

        // 处理标题
        markdown = markdown.replace(/^#\s+([^\n]+?)\s*$/gm, '<h1>$1</h1>');
        markdown = markdown.replace(/^##\s+([^\n]+?)\s*$/gm, '<h2>$1</h2>');
        markdown = markdown.replace(/^###\s+([^\n]+?)\s*$/gm, '<h3>$1</h3>');
        markdown = markdown.replace(/^####\s+([^\n]+?)\s*$/gm, '<h4>$1</h4>');
        markdown = markdown.replace(/^#####\s+([^\n]+?)\s*$/gm, '<h5>$1</h5>');
        markdown = markdown.replace(/^######\s+([^\n]+?)\s*$/gm, '<h6>$1</h6>');

        // 处理列表
        const lists = [];
        markdown = markdown.replace(/^(?:[-*+]\s+.+(?:\n(?![-*+])\s+.+)*)(?:\n(?:[-*+]\s+.+(?:\n(?![-*+])\s+.+)*)*/gm, (match) => {
            lists.push({type: 'ul', content: match});
            return `__LIST_${lists.length - 1}__`;
        });

        markdown = markdown.replace(/^(?:\d+\.\s+.+(?:\n(?!\d+\.)\s+.+)*)(?:\n(?:\d+\.\s+.+(?:\n(?!\d+\.)\s+.+)*)*/gm, (match) => {
            lists.push({type: 'ol', content: match});
            return `__LIST_${lists.length - 1}__`;
        });

        // 处理其他元素
        markdown = markdown.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
        markdown = markdown.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
        markdown = markdown.replace(/\[([^\]]*)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
        markdown = markdown.replace(/^[-*_]{3,}$/gm, '<hr>');
        markdown = markdown.replace(/~~(.+?)~~/g, '<del>$1</del>');
        markdown = markdown.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        markdown = markdown.replace(/\*(.+?)\*/g, '<em>$1</em>');
        markdown = markdown.replace(/!\[audio\]\(([^\)]+)\)/g, '<audio controls src="$1"></audio>');
        markdown = markdown.replace(/!\[video\]\(([^\)]+)\)/g, '<video controls src="$1"></video>');
        markdown = markdown.replace(/<kbd>([^<]+)<\/kbd>/g, '<kbd>$1</kbd>');
        markdown = markdown.replace(/\^([^\^\s]+)\^/g, '<sup>$1</sup>');
        markdown = markdown.replace(/~([^~\s]+)~/g, '<sub>$1</sub>');

        // 处理任务列表
        markdown = markdown.replace(/^\[([x ])\]\s+(.+)$/gm, (match, checkbox, text) => {
            const checked = checkbox === 'x' ? ' checked' : '';
            return `<li class="task-list-item"><input type="checkbox"${checked} disabled>${text}</li>`;
        });

        // 处理脚注
        const footnotes = [];
        markdown = markdown.replace(/\[\^([^\]]+)\]:\s*([^\n]+)/g, (match, ref, text) => {
            footnotes.push({ref, text: text.trim()});
            return '';
        });
        markdown = markdown.replace(/\[\^([^\]]+)\]/g, (match, ref) => {
            const index = footnotes.findIndex(f => f.ref === ref) + 1;
            if (index > 0) {
                return `<sup class="footnote-ref"><a href="#fn${index}" id="fnref${index}">${index}</a></sup>`;
            }
            return match;
        });

        // 恢复代码块
        markdown = markdown.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
            const block = codeBlocks[parseInt(index)];
            const langClass = block.lang ? ` class="language-${block.lang}"` : '';
            return `<pre><code${langClass}>${block.code}</code></pre>`;
        });

        // 恢复表格
        markdown = markdown.replace(/__TABLE_(\d+)__/g, (match, index) => {
            const table = tables[parseInt(index)];
            const headerCells = table.header.split('|').slice(1, -1).map(cell => cell.trim());
            const rows = table.rows.split('\n').filter(row => row.trim());
            
            let alignments = [];
            if (table.divider) {
                alignments = table.divider.split('|').slice(1, -1).map(cell => {
                    cell = cell.trim();
                    return cell.startsWith(':') && cell.endsWith(':') ? 'center'
                         : cell.endsWith(':') ? 'right'
                         : cell.startsWith(':') ? 'left'
                         : '';
                });
            }

            const header = headerCells.map((cell, i) => 
                `<th${alignments[i] ? ` style="text-align: ${alignments[i]}"` : ''}>${cell}</th>`
            ).join('');

            const body = rows.map(row => {
                const cells = row.split('|').slice(1, -1).map((cell, i) => 
                    `<td${alignments[i] ? ` style="text-align: ${alignments[i]}"` : ''}>${cell.trim()}</td>`
                ).join('');
                return `<tr>${cells}</tr>`;
            }).join('');

            return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
        });

        // 恢复列表
        markdown = markdown.replace(/__LIST_(\d+)__/g, (match, index) => {
            const list = lists[parseInt(index)];
            const items = list.content.split('\n').filter(item => item.trim()).map(item => {
                const text = item.replace(/^[-*+\d.]\s+/, '');
                return `<li>${text}</li>`;
            }).join('');
            return `<${list.type}>${items}</${list.type}>`;
        });

        // 处理段落
        markdown = markdown.replace(/^(?!<[a-z\/]|__|$)(.+)$/gm, (match, line) => {
            if (line.trim()) {
                return `<p>${line}</p>`;
            }
            return line;
        });

        // 恢复HTML标签
        markdown = markdown.replace(/__HTML_TAG_(\d+)__/g, (match, index) => htmlTags[parseInt(index)]);

        // 恢复转义字符
        markdown = markdown.replace(/__ESCAPED_CHAR_(\d+)__/g, (match, index) => escapedChars[parseInt(index)]);

        // 渲染数学公式
        markdown = markdown.replace(/__MATH_BLOCK_(\d+)__/g, (match, index) => {
            const block = mathBlocks[parseInt(index)];
            return block.type === 'display'
                ? `<div class="katex-display">${block.formula}</div>`
                : `<span class="katex">${block.formula}</span>`;
        });

        // 渲染流程图和甘特图
        markdown = markdown.replace(/__MERMAID_BLOCK_(\d+)__/g, (match, index) => {
            const code = mermaidBlocks[parseInt(index)];
            return `<div class="mermaid">${code}</div>`;
        });

        // 在文档末尾添加脚注
        if (footnotes.length > 0) {
            markdown += '\n<div class="footnotes">\n<hr>\n<ol>';
            footnotes.forEach((footnote, index) => {
                markdown += `\n<li id="fn${index + 1}">${footnote.text} <a href="#fnref${index + 1}">↩</a></li>`;
            });
            markdown += '\n</ol>\n</div>';
        }

        return markdown;
    } catch (error) {
        console.error('Markdown解析错误:', error);
        return '<div class="markdown-error">Markdown解析错误</div>';
    }
}

class MarkdownElement extends HTMLElement {
    static get observedAttributes() {
        return ['content', 'markdown', 'md'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'preview';
        this.shadowRoot.appendChild(this.contentDiv);

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    this.updateContent();
                    break;
                }
            }
        });
    }

    connectedCallback() {
        this.setupObserver();
        this.updateContent();
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateContent();
        }
    }

    setupObserver() {
        this.observer.observe(this, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    updateContent() {
        const markdown = this.getAttribute('content') ||
            this.getAttribute('markdown') ||
            this.getAttribute('md') ||
            this.textContent.trim();
        const html = convertMarkdownToHtml(markdown);
        this.contentDiv.innerHTML = html;
    }

    setContent(markdown) {
        this.setAttribute('content', markdown);
    }

    setMarkdown(markdown) {
        this.setAttribute('markdown', markdown);
    }

    render(markdown) {
        this.setAttribute('content', markdown);
    }
}

function setupMarkdownTextarea(textarea) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    container.style.padding = '20px';

    textarea.style.display = 'block';
    textarea.style.width = '100%';
    textarea.style.minHeight = '200px';
    textarea.style.padding = '15px';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '14px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.borderRadius = '4px';
    textarea.style.resize = 'vertical';
    textarea.style.boxSizing = 'border-box';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'preview';
    contentDiv.style.width = '100%';
    contentDiv.style.minHeight = '200px';
    contentDiv.style.padding = '15px';
    contentDiv.style.border = '1px solid #ccc';
    contentDiv.style.borderRadius = '4px';
    contentDiv.style.overflowY = 'auto';
    contentDiv.style.background = '#fff';
    contentDiv.style.boxSizing = 'border-box';

    textarea.parentNode.insertBefore(container, textarea);
    container.appendChild(textarea);
    container.appendChild(contentDiv);

    const updatePreview = () => {
        const html = convertMarkdownToHtml(textarea.value);
        contentDiv.innerHTML = html;
    };

    textarea.addEventListener('input', updatePreview);
    updatePreview();
}

customElements.define('md-to-html', MarkdownElement);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('textarea.md-to-html').forEach(textarea => {
        setupMarkdownTextarea(textarea);
    });

    document.querySelectorAll('.md-to-html').forEach(element => {
        if (!(element instanceof MarkdownElement) && element.tagName.toLowerCase() !== 'textarea') {
            const newElement = new MarkdownElement();
            element.parentNode.replaceChild(newElement, element);
            newElement.textContent = element.textContent;
        }
    });
});
