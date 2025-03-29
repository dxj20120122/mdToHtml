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

    const codeBlocks = [];
    let lastIndex = 0;
    const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)```(?!`)/g;
    
    while (true) {
        const match = codeBlockRegex.exec(markdown);
        if (!match) break;
        
        // 检查是否在已处理的代码块内
        let isNested = false;
        for (let i = 0; i < codeBlocks.length; i++) {
            const blockPos = markdown.indexOf(`__CODE_BLOCK_${i}__`);
            if (blockPos !== -1 && match.index > blockPos && 
                match.index < blockPos + `__CODE_BLOCK_${i}__`.length) {
                isNested = true;
                break;
            }
        }
        
        if (!isNested) {
            const [fullMatch, lang, code] = match;
            
            // 检测并处理缩进
            const lines = code.split('\n');
            let minIndent = Infinity;
            
            // 计算最小缩进
            for (const line of lines) {
                if (line.trim().length > 0) {
                    const indent = line.match(/^\s*/)[0].length;
                    minIndent = Math.min(minIndent, indent);
                }
            }
            
            // 如果存在公共缩进，则去除
            let processedCode = code;
            if (minIndent < Infinity && minIndent > 0) {
                processedCode = lines.map(line => {
                    return line.length >= minIndent ? line.slice(minIndent) : line;
                }).join('\n');
            }
            
            // 确保代码块内容是顶格的
            const trimmedCode = processedCode.trimEnd();
            const safeCode = trimmedCode
                .replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;')
                .replace(/[\[\]\*_~`#\$\^\|\{\}\(\)\+\-\.\!\@\%\&\=\:\;\'\"\,\/\\]/g, c => `&#${c.charCodeAt(0)};`);
            codeBlocks.push({lang: lang.trim(), code: safeCode});
            const replacement = `__CODE_BLOCK_${codeBlocks.length - 1}__`;
            markdown = markdown.slice(0, match.index) + replacement + 
                      markdown.slice(match.index + fullMatch.length);
            codeBlockRegex.lastIndex = match.index + replacement.length;
        }
    }

    markdown = markdown.replace(/`([^`]+)`/g, (match, code) => {
        const safeCode = code.replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;');
        return `<code>${safeCode}</code>`;
    });

    markdown = markdown.replace(/(?<!__CODE_BLOCK_\d+__)\n/g, '<br>\n');

    const escapedChars = [];
    markdown = markdown.replace(/\\([\\`*_{}\[\]()#+\-.!n])/g, (match, char) => {
        if (char === 'n') {
            return '<br>';
        }
        escapedChars.push(char);
        return `__ESCAPED_CHAR_${escapedChars.length - 1}__`;
    });

    const htmlTags = [];
    markdown = markdown.replace(/<[^>]+>/g, (match) => {
        if (match.startsWith('</') || match.startsWith('<br') || match.startsWith('<hr')) {
            htmlTags.push(match);
            return `__HTML_TAG_${htmlTags.length - 1}__`;
        }
        return match.replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;');
    });

    markdown = markdown.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
        const codeBlock = codeBlocks[parseInt(index)];
        return `<pre><code${codeBlock.lang ? ` class="language-${codeBlock.lang}"` : ''}>${codeBlock.code}</code></pre>`;
    });

    markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>');
    let tables = [];
    markdown = markdown.replace(/^(\|[^\n]+\|\s*\n)(\|[-:\|\s]+\|\s*\n)?(\|[^\n]+\|\s*\n?)*$/gm, (match) => {
        tables.push(match);
        return `__TABLE_${tables.length - 1}__`;
    });

    markdown = markdown.replace(/__TABLE_(\d+)__/g, (match, index) => {
        const tableContent = tables[parseInt(index)];
        const rows = tableContent.trim().split('\n');
        const headerRow = rows[0];
        const alignRow = rows[1];
        const dataRows = rows.slice(alignRow ? 2 : 1);

        const alignments = alignRow
            ? alignRow.split('|').slice(1, -1).map(cell => {
                cell = cell.trim();
                return cell.startsWith(':') && cell.endsWith(':') ? 'center'
                     : cell.endsWith(':') ? 'right'
                     : cell.startsWith(':') ? 'left'
                     : '';
            })
            : [];

        const header = headerRow
            .split('|')
            .slice(1, -1)
            .map((cell, i) => `<th${alignments[i] ? ` style="text-align: ${alignments[i]}"` : ''}>${cell.trim()}</th>`)
            .join('');

        const body = dataRows
            .map(row => {
                const cells = row
                    .split('|')
                    .slice(1, -1)
                    .map((cell, i) => `<td${alignments[i] ? ` style="text-align: ${alignments[i]}"` : ''}>${cell.trim()}</td>`)
                    .join('');
                return `<tr>${cells}</tr>`;
            })
            .join('');

        return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
    });
    markdown = markdown.replace(/^#\s+([^\n]+?)\s*$/gm, '<h1>$1</h1>');
    markdown = markdown.replace(/^##\s+([^\n]+?)\s*$/gm, '<h2>$1</h2>');
    markdown = markdown.replace(/^###\s+([^\n]+?)\s*$/gm, '<h3>$1</h3>');
    markdown = markdown.replace(/^####\s+([^\n]+?)\s*$/gm, '<h4>$1</h4>');
    markdown = markdown.replace(/^#####\s+([^\n]+?)\s*$/gm, '<h5>$1</h5>');
    markdown = markdown.replace(/^######\s+([^\n]+?)\s*$/gm, '<h6>$1</h6>');
    let lists = [];
    markdown = markdown.replace(/(?:^[-*+]\s+.+$\n?)+/gm, (match) => {
        lists.push({type: 'ul', content: match});
        return `__LIST_${lists.length - 1}__`;
    });

    markdown = markdown.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (match) => {
        lists.push({type: 'ol', content: match});
        return `__LIST_${lists.length - 1}__`;
    });

    markdown = markdown.replace(/__LIST_(\d+)__/g, (match, index) => {
        const list = lists[parseInt(index)];
        const items = list.content
            .trim()
            .split('\n')
            .map(item => `<li>${item.replace(/^[-*+\d.]\s+/, '')}</li>`)
            .join('');
        return `<${list.type}>${items}</${list.type}>`;
    });
    markdown = markdown.replace(/^\[([x ])\]\s+(.+)$/gm, (match, checkbox, text) => {
        const checked = checkbox === 'x' ? ' checked' : '';
        return `<li class="task-list-item"><input type="checkbox"${checked} disabled>${text}</li>`;
    });
    markdown = markdown.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    markdown = markdown.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
    markdown = markdown.replace(/\[([^\]]*)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    markdown = markdown.replace(/^[-*_]{3,}$/gm, '<hr>');
    markdown = markdown.replace(/~~(.+?)~~/g, '<del>$1</del>');
    markdown = markdown.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 支持表格标题行
    markdown = markdown.replace(/^\|([:-]+\|)+\s*$/gm, (match) => {
        const cells = match.split('|').slice(1, -1).map(cell => cell.trim());
        return `<tr>${cells.map(cell => {
            const align = cell.startsWith(':') && cell.endsWith(':') ? 'center'
                       : cell.endsWith(':') ? 'right'
                       : cell.startsWith(':') ? 'left'
                       : '';
            return `<th style="text-align: ${align}">${'　'}</th>`;
        }).join('')}</tr>`;
    });

    // 支持音频和视频标签
    markdown = markdown.replace(/!\[audio\]\(([^\)]+)\)/g, '<audio controls src="$1"></audio>');
    markdown = markdown.replace(/!\[video\]\(([^\)]+)\)/g, '<video controls src="$1"></video>');

    // 支持键盘按键
    markdown = markdown.replace(/<kbd>([^<]+)<\/kbd>/g, '<kbd>$1</kbd>');

    // 支持上标和下标
    markdown = markdown.replace(/\^([^\^\s]+)\^/g, '<sup>$1</sup>');
    markdown = markdown.replace(/~([^~\s]+)~/g, '<sub>$1</sub>');

    // 支持脚注
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

    // 支持定义列表
    markdown = markdown.replace(/^([^\n]+)\n:\s+([^\n]+)(?:\n(?!:))?/gm, '<dl><dt>$1</dt><dd>$2</dd></dl>');

    markdown = markdown.replace(/^(?!<[htupoia]).+$/gm, '<p>$&</p>');

    // 在文档末尾添加脚注
    if (footnotes.length > 0) {
        markdown += '\n<div class="footnotes">\n<hr>\n<ol>';
        footnotes.forEach((footnote, index) => {
            markdown += `\n<li id="fn${index + 1}">${footnote.text} <a href="#fnref${index + 1}">↩</a></li>`;
        });
        markdown += '\n</ol>\n</div>';
    }
    markdown = markdown.replace(/\n\s*\n/g, '\n');
    markdown = markdown.replace(/__HTML_TAG_(\d+)__/g, (match, index) => htmlTags[parseInt(index)]);
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

    return markdown;
}

const markdownStyles = `
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
    /* 基础样式 */
    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f6f8fa;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    /* 音频和视频样式 */
    audio, video {
        width: 100%;
        max-width: 600px;
        margin: 1em 0;
        border-radius: 4px;
    }

    /* 键盘按键样式 */
    kbd {
        background-color: #f8f9fa;
        border: 1px solid #d1d5da;
        border-radius: 3px;
        box-shadow: inset 0 -1px 0 #d1d5da;
        color: #444d56;
        display: inline-block;
        font-size: 0.9em;
        line-height: 1;
        padding: 3px 5px;
    }

    /* 上标和下标样式 */
    sup, sub {
        font-size: 0.75em;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
    }
    sup {
        top: -0.5em;
    }
    sub {
        bottom: -0.25em;
    }
    :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
    }
    :host(.editor) {
        padding: 0;
    }
    .preview {
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 4px;
        overflow-y: auto;
        background: white;
    }
    textarea {
        width: 100%;
        height: 100%;
        min-height: 200px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: monospace;
        resize: vertical;
        white-space: pre-wrap;
    }
    h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; }
    pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        border-radius: 6px;
        background: #000 !important;
        color: #ffffff;
    }
    code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        border-radius: 6px;
        unicode-bidi: plaintext;
        white-space: pre;
        background: #000 !important;
        color: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    }
    pre code {
        padding: 0;
        background-color: transparent;
        color: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
    }
`;

class MarkdownElement extends HTMLElement {
    static get observedAttributes() {
        return ['content', 'markdown', 'md'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = markdownStyles;
        this.shadowRoot.appendChild(style);

        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'preview';
        this.contentDiv.style.background = '#fff';
        this.shadowRoot.appendChild(this.contentDiv);

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    this.updateContent();
                    break;
                }
            }
        });

        if (this.isConnected) {
            this.setupObserver();
            this.updateContent();
        }
    }

    setupObserver() {
        this.observer.observe(this, {
            childList: true,
            characterData: true,
            subtree: true,
            attributes: false
        });
    }

    connectedCallback() {
        if (this.tagName.toLowerCase() === 'md-to-html') {
            this.setupObserver();
            this.updateContent();
        }
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateContent();
        }
    }

    updateContent() {
        const markdown = this.getAttribute('content') ||
            this.getAttribute('markdown') ||
            this.getAttribute('md') ||
            this.textContent.trim();
        const html = convertMarkdownToHtml(markdown);
        if (this.contentDiv.innerHTML !== html) {
            this.contentDiv.innerHTML = html;
        }
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

    textarea.addEventListener('input', () => {
        const html = convertMarkdownToHtml(textarea.value);
        if (contentDiv.innerHTML !== html) {
            contentDiv.innerHTML = html;
        }
    });

    const html = convertMarkdownToHtml(textarea.value || '');
    contentDiv.innerHTML = html;
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