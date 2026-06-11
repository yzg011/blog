---
title: 说说
date: 2026-06-09 10:00:00
layout: page
comments: true
---

<style>
/* 全局容器 */
.memos-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
/* 单条说说卡片 */
.memos-item {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
/* 正文文本 */
.memos-content {
  line-height: 1.7;
  margin-bottom: 1rem;
  word-break: break-all;
}
/* 图片强制样式（最高优先级，覆盖所有规则） */
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
}
/* 时间栏 */
.memos-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
}
/* 加载/空提示 */
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
const API = `${DOMAIN}/api/v1/memos?limit=20&sort=createTime&order=desc`;
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

// 解析正文里的所有图片链接（包括 Markdown 和直接链接）
function parseAllImages(text) {
  if (!text) return text;
  
  // 1. 先处理 Markdown 图片语法：![...](url)
  const markdownReg = /!\[.*?\]\((.*?)\)/g;
  text = text.replace(markdownReg, (match, url) => {
    const fullUrl = url.startsWith("http") ? url : `${DOMAIN}${url}`;
    return `<img src="${fullUrl}" alt="说说图片">`;
  });

  // 2. 再处理直接的图片链接：https://ss.z2m.store/file/attachments/xxx
  const directReg = /(https?:\/\/ss\.z2m\.store\/file\/attachments\/[^\s\)\]]+)/g;
  text = text.replace(directReg, (url) => {
    return `<img src="${url}" alt="说说图片">`;
  });

  // 3. 处理相对路径图片链接：/file/attachments/xxx
  const relativeReg = /(\/file\/attachments\/[^\s\)\]]+)/g;
  text = text.replace(relativeReg, (path) => {
    return `<img src="${DOMAIN}${path}" alt="说说图片">`;
  });

  return text;
}

// 初始化加载数据
async function init() {
  try {
    const res = await fetch(API, { 
      mode: "cors",
      credentials: "omit"
    });
    if (!res.ok) throw new Error("接口请求异常");
    const json = await res.json();
    const memoList = json.memos || [];

    if (memoList.length === 0) {
      wrap.innerHTML = '<div class="tips">暂无说说</div>';
      return;
    }

    let totalHtml = "";
    memoList.forEach(memo => {
      // 解析所有可能的图片格式
      const content = parseAllImages(memo.content || "");
      const timeStr = formatTime(memo.createTime);

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

    // 图片加载失败兜底：自动重试加载
    document.querySelectorAll('.memos-content img').forEach(img => {
      img.onerror = function() {
        console.log("图片加载失败，尝试重新加载：", this.src);
        // 强制刷新图片，绕过缓存
        this.src = this.src + "?reload=" + Date.now();
      };
    });

  } catch (err) {
    wrap.innerHTML = `<div class="tips">加载失败：${err.message}</div>`;
    console.error(err);
  }
}

// 执行
init();
</script>