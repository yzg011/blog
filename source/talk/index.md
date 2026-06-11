---
title: 说说
date: 2026-06-09 10:00:00
layout: page
comments: true
---

<style>
/* 全局基础样式 */
.memos-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.memos-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.memos-content {
  line-height: 1.7;
  margin-bottom: 1rem;
  word-break: break-all;
}
/* 图片最高优先级样式，杜绝占位/隐藏 */
.memos-content img {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-width: 100% !important;
  height: auto !important;
  border-radius: 8px;
  margin: 10px 0 !important;
  background: transparent !important;
  filter: none !important;
  border: none !important;
}
.memos-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
}
.tips {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>

<div class="memos-container" id="memosWrap">
  <div class="tips">加载中...</div>
</div>

<script>
const DOMAIN = "https://ss.z2m.store";
// 使用你指定的照片专属接口
const API = `${DOMAIN}/api/v1/memo?creatorId=1&tag=照片`;
const DETAIL_URL = `${DOMAIN}/explore`;
const wrap = document.getElementById("memosWrap");

// 时间格式化
function formatTime(isoStr) {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

// 多规则解析图片：Markdown图、完整链接、相对路径
function parseAllImages(text) {
  if (!text) return text;
  // 1. 解析 Markdown 图片 ![](url)
  let html = text.replace(/!\[.*?\]\((.*?)\)/g, (_, url) => {
    const fullUrl = url.startsWith("http") ? url : `${DOMAIN}${url}`;
    return `<img src="${fullUrl}" alt="照片">`;
  });
  // 2. 解析完整图片直链
  html = html.replace(/(https?:\/\/ss\.z2m\.store\/file\/attachments\/[^\s\)\]]+)/g, `<img src="$1" alt="照片">`);
  // 3. 解析相对路径图片
  html = html.replace(/(\/file\/attachments\/[^\s\)\]]+)/g, `<img src="${DOMAIN}$1" alt="照片">`);
  return html;
}

// 加载数据
async function init() {
  try {
    const res = await fetch(API, {
      mode: "cors",
      cache: "no-cache",
      credentials: "omit"
    });
    if (!res.ok) throw new Error("接口请求失败");

    const json = await res.json();
    const list = Array.isArray(json) ? json : [];

    if (list.length === 0) {
      wrap.innerHTML = '<div class="tips">暂无照片内容</div>';
      return;
    }

    let totalHtml = "";
    list.forEach(item => {
      const content = parseAllImages(item.content || "");
      const timeStr = formatTime(item.createTime);
      totalHtml += `
        <div class="memos-item">
          <div class="memos-content">${content}</div>
          <div class="memos-time">
            <span>${timeStr}</span>
            <a href="${DETAIL_URL}" target="_blank" rel="noopener noreferrer">查看详情</a>
          </div>
        </div>
      `;
    });

    wrap.innerHTML = totalHtml;

    // 图片加载失败自动加时间戳重试，解决缓存/占位问题
    document.querySelectorAll('.memos-content img').forEach(img => {
      img.onerror = function () {
        const oldSrc = this.src.split('?')[0];
        this.src = oldSrc + "?_t=" + Date.now();
      };
    });

  } catch (err) {
    wrap.innerHTML = `<div class="tips">加载异常：${err.message}</div>`;
    console.error("加载错误：", err);
  }
}

init();
</script>