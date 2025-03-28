function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';
    markdown = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    markdown = markdown.split('\n').map(line => line.trimStart()).join('\n');

    const codeBlocks = [];
    markdown = markdown.replace(/```([\s\S]*?)```/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
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
        htmlTags.push(match);
        return `__HTML_TAG_${htmlTags.length - 1}__`;
    });

    markdown = markdown.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
        const codeBlock = codeBlocks[parseInt(index)];
        const code = codeBlock.replace(/^```[\s\S]*?\n([\s\S]*?)```$/g, '$1').trim();
        return `<pre><code>${code}</code></pre>`;
    });

    markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>');
    markdown = markdown.replace(/^\|(.+)\|\s*$/gm, (match, content) => {
        const cells = content.split('|').map(cell => cell.trim());
        return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    });
    markdown = markdown.replace(/(<tr>[\s\S]+?<\/tr>)/g, '<table>$1</table>');
    markdown = markdown.replace(/^#\s+([^\n]+?)\s*$/gm, '<h1>$1</h1>');
    markdown = markdown.replace(/^##\s+([^\n]+?)\s*$/gm, '<h2>$1</h2>');
    markdown = markdown.replace(/^###\s+([^\n]+?)\s*$/gm, '<h3>$1</h3>');
    markdown = markdown.replace(/^####\s+([^\n]+?)\s*$/gm, '<h4>$1</h4>');
    markdown = markdown.replace(/^#####\s+([^\n]+?)\s*$/gm, '<h5>$1</h5>');
    markdown = markdown.replace(/^######\s+([^\n]+?)\s*$/gm, '<h6>$1</h6>');
    markdown = markdown.replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>');
    markdown = markdown.replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>');
    markdown = markdown.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    markdown = markdown.replace(/(<li>[\s\S]+?<\/li>)/g, '<ol>$1</ol>');
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

    markdown = markdown.replace(/^(?!<[htupoia]).+$/gm, '<p>$&</p>');
    markdown = markdown.replace(/\n\s*\n/g, '\n');
    markdown = markdown.replace(/__HTML_TAG_(\d+)__/g, (match, index) => htmlTags[parseInt(index)]);
    markdown = markdown.replace(/__ESCAPED_CHAR_(\d+)__/g, (match, index) => escapedChars[parseInt(index)]);
    return markdown;
}

const markdownStyles = `
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
        background-color: #f6f8fa;
        border-radius: 6px;
    }
    code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: #f6f8fa;
        border-radius: 6px;
        unicode-bidi: plaintext;
        white-space: pre;
    }
    pre code {
        padding: 0;
        background-color: transparent;
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