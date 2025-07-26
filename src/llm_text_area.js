// ==UserScript==
// @name         LLM Text Replacer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add context menu option to replace text with ChatGPT response
// @author       You
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const API_KEY = GM_getValue('chatgpt_api_key', '');
    const PROMPT = 'Improve this text and make it more professional:';

    if (!API_KEY) {
        alert('Please set your ChatGPT API key in Tampermonkey settings');
    }

    GM_registerMenuCommand('Set ChatGPT API Key', () => {
        const key = prompt('Enter your ChatGPT API key:');
        if (key) {
            GM_setValue('chatgpt_api_key', key);
            alert('API key saved!');
        }
    });

    let currentInput = null;

    document.addEventListener('contextmenu', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
            currentInput = target;
        }
    });

    const menuItem = document.createElement('div');
    menuItem.innerHTML = 'Improve with AI';
    menuItem.style.cssText = 'padding:8px;cursor:pointer;background:#f0f0f0;border:1px solid #ccc;position:absolute;z-index:10000;display:none;';

    document.body.appendChild(menuItem);

    document.addEventListener('contextmenu', (e) => {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
            currentInput = target;
            menuItem.style.left = e.pageX + 'px';
            menuItem.style.top = e.pageY + 'px';
            menuItem.style.display = 'block';
        } else {
            menuItem.style.display = 'none';
        }
    });

    document.addEventListener('click', () => {
        menuItem.style.display = 'none';
    });

    menuItem.addEventListener('click', async (e) => {
        e.stopPropagation();
        menuItem.style.display = 'none';

        if (!currentInput) return;

        const text = currentInput.value || currentInput.textContent || '';
        if (!text.trim()) return;

        const apiKey = GM_getValue('chatgpt_api_key', '');
        if (!apiKey) {
            alert('Please set your ChatGPT API key first');
            return;
        }

        currentInput.style.opacity = '0.5';

        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            data: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: PROMPT + ' ' + text
                }],
                max_tokens: 1000
            }),
            onload: (response) => {
                currentInput.style.opacity = '1';
                try {
                    const data = JSON.parse(response.responseText);
                    const newText = data.choices[0].message.content;
                    
                    if (currentInput.tagName === 'INPUT' || currentInput.tagName === 'TEXTAREA') {
                        currentInput.value = newText;
                    } else {
                        currentInput.textContent = newText;
                    }
                } catch (e) {
                    alert('Error processing response');
                }
            },
            onerror: () => {
                currentInput.style.opacity = '1';
                alert('Request failed');
            }
        });
    });
})();
