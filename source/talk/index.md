---
title: 说说
date: 2026-06-09 10:00:00
layout: page
comments: false
---

<style>
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
  transition: all 0.3s;
}
.memos-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.memos-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
}
.memos-content {
  line-height: 1.7;
}
.loading-tips {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>

<div class="memos-container" id="memosList">
  <div class="loading-tips">加载中...</div>
</div>

<script>
// ========== 配置项 ==========
const MEMOS_API = "https://ss.z2m.store/api/v1/memos";
const FIX_LINK = "https://ss.z2m.store/explore";
const LIMIT = 20;
// ============================

const listEl = document.getElementById('memosList');

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function renderItem(item) {
  const div = document.createElement('div');
  div.className = 'memos-item';
  div.innerHTML = `
    <div class="memos-content">${item.content}</div>
    <div class="memos-time">
      <span>${formatTime(item.createTime)}</span>
      <a href="${FIX_LINK}" target="_blank" rel="noopener noreferrer nofollow">查看详情</a>
    </div>
  `;
  return div;
}

async function getMemos() {
  try {
    const res = await fetch(`${MEMOS_API}?limit=${LIMIT}&sort=createTime&order=desc`, {
      mode: 'cors'
    });
    if (!res.ok) throw new Error(`请求失败，状态码：${res.status}`);
    
    const response = await res.json();
    const data = Array.isArray(response.memos) ? response.memos : [];

    listEl.innerHTML = '';
    if (data.length === 0) {
      listEl.innerHTML = '<div class="loading-tips">暂无说说</div>';
      return;
    }
    data.forEach(item => listEl.appendChild(renderItem(item)));
  } catch (err) {
    listEl.innerHTML = `<div class="loading-tips">加载失败：${err.message}</div>`;
    console.error('Memos加载错误:', err);
  }
}

getMemos();
</script>