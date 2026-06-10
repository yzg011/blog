---
title: 友情链接
date: 2026-06-10 12:00:00
layout: page
comments: true
---

<style>
/* 全局容器：给按钮提供定位基准 */
.friends-wrap {
  position: relative;
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
  min-height: 300px;
}

/* 右上角 友链申请按钮（强制样式，避免被覆盖） */
.friend-apply-btn {
  position: absolute;
  top: 0;
  right: 1rem;
  padding: 8px 18px;
  background: #42b983 !important;
  color: #fff !important;
  border-radius: 20px;
  font-size: 14px;
  text-decoration: none !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
  transition: all 0.2s ease;
  z-index: 9999 !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
.friend-apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
  color: #fff !important;
  text-decoration: none !important;
}

/* 友链列表网格布局 */
.friends-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
  margin-top: 3rem;
}

/* 单个友链卡片 */
.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  text-decoration: none !important;
  color: inherit !important;
}
.friend-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

/* 头像样式（强制优先级，解决主题覆盖） */
.friend-avatar {
  width: 64px !important;
  height: 64px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  flex-shrink: 0 !important;
  display: block !important;
  border: 2px solid var(--border-color) !important;
  background: #f5f5f5 !important;
  min-width: 64px !important;
  min-height: 64px !important;
}

/* 友链信息 */
.friend-info {
  flex: 1;
  overflow: hidden;
}
.friend-info .name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  text-decoration: none;
  display: block;
}
.friend-info .name:hover {
  color: var(--theme-color);
}
.friend-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载/错误提示 */
.friend-tips {
  text-align: center;
  padding: 4rem 0;
  color: var(--text-secondary);
  font-size: 15px;
}
</style>

<div class="friends-wrap">
  <!-- 右上角友链申请按钮 -->
  <a class="friend-apply-btn" 
     href="https://github.com/yzg011/Link/issues/new?template=friend-request.yml" 
     target="_blank" rel="noopener noreferrer">
    自助友链申请
  </a>

  <!-- 友链列表容器 -->
  <div id="friendsContainer" class="friend-tips">加载中...</div>
</div>

<script>
// 远程 JSON 地址
const JSON_URL = "https://lk.z2m.store/friends.json";
const container = document.getElementById('friendsContainer');

// 渲染单条友链（增加图片加载失败处理）
function renderFriend(item) {
  if (!item.name || !item.url) return '';
  // 头像加载失败时显示备用头像
  const avatar = item.avatar || 'https://cdn.jsdelivr.net/gh/butterfly-theme/CDN/img/avatar/default.png';
  return `
    <a class="friend-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
      <img class="friend-avatar" 
           src="${avatar}" 
           alt="${item.name}" 
           loading="lazy"
           onerror="this.src='https://cdn.jsdelivr.net/gh/butterfly-theme/CDN/img/avatar/default.png'">
      <div class="friend-info">
        <span class="name">${item.name}</span>
        <div class="friend-desc">${item.description || ''}</div>
      </div>
    </a>
  `;
}

// 加载远程友链数据
async function loadFriends() {
  try {
    const res = await fetch(JSON_URL, {
      mode: 'cors',
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error('数据请求失败');

    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = '<div class="friend-tips">暂无友链</div>';
      return;
    }

    // 拼接 HTML
    let html = '<div class="friends-list">';
    list.forEach(item => {
      html += renderFriend(item);
    });
    html += '</div>';
    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = `<div class="friend-tips">友链加载失败，请稍后重试</div>`;
    console.error('友链加载错误：', err);
  }
}

// 页面加载完成执行
document.addEventListener('DOMContentLoaded', loadFriends);
</script>