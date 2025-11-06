// JSON 工具
function formatJSON() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    try {
        const parsed = JSON.parse(input);
        output.textContent = JSON.stringify(parsed, null, 2);
        output.style.color = '#333';
    } catch (e) {
        output.textContent = '错误: ' + e.message;
        output.style.color = '#e74c3c';
    }
}

function minifyJSON() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    try {
        const parsed = JSON.parse(input);
        output.textContent = JSON.stringify(parsed);
        output.style.color = '#333';
    } catch (e) {
        output.textContent = '错误: ' + e.message;
        output.style.color = '#e74c3c';
    }
}

// Base64 工具
function encodeBase64() {
    const input = document.getElementById('base64Input').value;
    const output = document.getElementById('base64Output');
    try {
        output.value = btoa(unescape(encodeURIComponent(input)));
    } catch (e) {
        output.value = '错误: ' + e.message;
    }
}

function decodeBase64() {
    const input = document.getElementById('base64Input').value;
    const output = document.getElementById('base64Output');
    try {
        output.value = decodeURIComponent(escape(atob(input)));
    } catch (e) {
        output.value = '错误: ' + e.message;
    }
}

// URL 编解码
function encodeURL() {
    const input = document.getElementById('urlInput').value;
    const output = document.getElementById('urlOutput');
    output.value = encodeURIComponent(input);
}

function decodeURL() {
    const input = document.getElementById('urlInput').value;
    const output = document.getElementById('urlOutput');
    try {
        output.value = decodeURIComponent(input);
    } catch (e) {
        output.value = '错误: ' + e.message;
    }
}

// 时间戳转换
function convertTimestamp() {
    const input = document.getElementById('timestampInput').value;
    const output = document.getElementById('timestampOutput');

    try {
        let date;
        if (/^\d+$/.test(input)) {
            // 输入是时间戳
            const timestamp = input.length === 10 ? parseInt(input) * 1000 : parseInt(input);
            date = new Date(timestamp);
        } else {
            // 输入是日期
            date = new Date(input);
        }

        if (isNaN(date.getTime())) {
            output.textContent = '无效的日期或时间戳';
            return;
        }

        output.innerHTML = `
            <div>日期时间: ${date.toLocaleString('zh-CN')}</div>
            <div>时间戳(秒): ${Math.floor(date.getTime() / 1000)}</div>
            <div>时间戳(毫秒): ${date.getTime()}</div>
            <div>ISO: ${date.toISOString()}</div>
        `;
    } catch (e) {
        output.textContent = '错误: ' + e.message;
    }
}

function getCurrentTimestamp() {
    const now = new Date();
    const output = document.getElementById('timestampOutput');
    output.innerHTML = `
        <div>当前时间: ${now.toLocaleString('zh-CN')}</div>
        <div>时间戳(秒): ${Math.floor(now.getTime() / 1000)}</div>
        <div>时间戳(毫秒): ${now.getTime()}</div>
        <div>ISO: ${now.toISOString()}</div>
    `;
}

// 颜色转换
document.getElementById('colorPicker')?.addEventListener('input', function(e) {
    document.getElementById('colorInput').value = e.target.value;
});

function convertColor() {
    const input = document.getElementById('colorInput').value || document.getElementById('colorPicker').value;
    const output = document.getElementById('colorOutput');

    try {
        const hex = input.startsWith('#') ? input : '#' + input;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            output.textContent = '无效的颜色值';
            return;
        }

        output.innerHTML = `
            <div>HEX: ${hex.toUpperCase()}</div>
            <div>RGB: rgb(${r}, ${g}, ${b})</div>
            <div>RGBA: rgba(${r}, ${g}, ${b}, 1)</div>
            <div style="background: ${hex}; height: 40px; border-radius: 4px; margin-top: 8px;"></div>
        `;
    } catch (e) {
        output.textContent = '错误: ' + e.message;
    }
}

// 正则测试
function testRegex() {
    const pattern = document.getElementById('regexPattern').value;
    const text = document.getElementById('regexText').value;
    const output = document.getElementById('regexOutput');

    try {
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);

        if (matches) {
            output.innerHTML = `
                <div>匹配数: ${matches.length}</div>
                <div>匹配项: ${matches.join(', ')}</div>
            `;
        } else {
            output.textContent = '无匹配';
        }
    } catch (e) {
        output.textContent = '错误: ' + e.message;
    }
}

// Token 计数（简单估算）
function countTokens() {
    const input = document.getElementById('tokenInput').value;
    const output = document.getElementById('tokenOutput');

    // 简单估算: 中文约1字符1token，英文约4字符1token
    const chineseChars = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = input.length - chineseChars;
    const estimatedTokens = Math.ceil(chineseChars + otherChars / 4);

    output.innerHTML = `
        <div>字符数: ${input.length}</div>
        <div>中文字符: ${chineseChars}</div>
        <div>预估 Tokens: ~${estimatedTokens}</div>
        <div style="font-size: 12px; color: #666; margin-top: 8px;">注: 这是粗略估算，实际token数取决于具体模型</div>
    `;
}

// 提示词模板
const templates = {
    summary: '请总结以下内容的要点：\n\n[在此粘贴需要总结的内容]\n\n要求：\n1. 提取3-5个核心要点\n2. 每个要点用简洁的语言表达\n3. 保持客观中立',
    translate: '请将以下文本翻译成[目标语言]：\n\n[在此粘贴需要翻译的内容]\n\n要求：\n1. 保持原意\n2. 符合目标语言表达习惯\n3. 保持专业术语准确性',
    code: '请根据以下需求生成代码：\n\n功能需求：\n[描述功能需求]\n\n技术栈：\n[指定语言和框架]\n\n要求：\n1. 代码简洁可读\n2. 包含必要注释\n3. 考虑边界情况',
    analysis: '请分析以下数据：\n\n[在此粘贴数据]\n\n分析要求：\n1. 数据概览\n2. 关键趋势\n3. 异常值\n4. 结论建议'
};

function loadTemplate() {
    const select = document.getElementById('promptTemplate');
    const output = document.getElementById('promptOutput');
    const template = templates[select.value];
    output.value = template || '';
}

// Markdown 预览（简单实现）
function previewMarkdown() {
    const input = document.getElementById('markdownInput').value;
    const output = document.getElementById('markdownOutput');

    let html = input
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    output.innerHTML = '<p>' + html + '</p>';
}

// CSV to JSON
function csvToJSON() {
    const input = document.getElementById('csvInput').value;
    const output = document.getElementById('csvOutput');

    try {
        const lines = input.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const values = lines[i].split(',').map(v => v.trim());
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            result.push(obj);
        }

        output.textContent = JSON.stringify(result, null, 2);
        output.style.color = '#333';
    } catch (e) {
        output.textContent = '错误: ' + e.message;
        output.style.color = '#e74c3c';
    }
}

// UUID 生成器
function generateUUID() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    document.getElementById('uuidOutput').value = uuid;
}

function generateMultipleUUID() {
    const uuids = [];
    for (let i = 0; i < 10; i++) {
        uuids.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }));
    }
    document.getElementById('uuidOutput').value = uuids.join('\n');
}

// Hash 计算（简单实现）
async function calculateHash() {
    const input = document.getElementById('hashInput').value;
    const output = document.getElementById('hashOutput');

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        output.innerHTML = `
            <div>SHA-256:</div>
            <div style="word-break: break-all; font-size: 12px;">${hashHex}</div>
        `;
    } catch (e) {
        output.textContent = '错误: ' + e.message;
    }
}

// 复制功能
function copyResult(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.value;

    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1500);
    }).catch(err => {
        alert('复制失败: ' + err);
    });
}
