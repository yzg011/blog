---
title: 友链展示
date: 2025-11-16
type: "link"
---

# 友链交换


<style>
:root {
  --friend-card-bg: var(--card-bg, #fff);
  --friend-text: var(--text-color, #333);
  --friend-text-secondary: var(--text-secondary, #666);
  --friend-border: var(--border-color, #eee);
}
[data-theme="dark"] {
  --friend-card-bg: #1e1e2e;
  --friend-text: #e5e5e5;
  --friend-text-secondary: #a0a0a0;
  --friend-border: #333;
}

.friends-wrap {margin: 2rem 0;}
.friends-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.friend-card {
  background: var(--friend-card-bg);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.3s ease;
  border: 1px solid var(--friend-border);
  color: var(--friend-text);
  text-decoration: none;
}
.friend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 26px rgba(0,0,0,0.12);
}
.friend-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}
.friend-info {flex: 1;}
.friend-name {
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 4px;
}
.friend-desc {
  font-size: 13px;
  color: var(--friend-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.apply-box {
  margin-top: 40px;
  padding: 24px;
  background: var(--friend-card-bg);
  border-radius: 12px;
  border: 1px solid var(--friend-border);
}
.apply-title {font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--friend-text);}
.apply-tips {color: #e63946; margin-bottom: 12px; font-size: 14px;}
.apply-form-item {margin-bottom: 12px;}
.apply-form-item label {display: block; margin-bottom: 6px; font-size: 14px; color: var(--friend-text);}
.apply-form-item input, .apply-form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--friend-border);
  background: var(--friend-card-bg);
  color: var(--friend-text);
}
.apply-btn {
  padding: 10px 20px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.apply-btn:hover {background: #337ecc;}
</style>

<div class="friends-wrap">
  <div class="friends-card-list" id="friendsList"></div>
</div>

<script>
fetch("/friends/friends.json")
.then(res=>res.json())
.then(list=>{
  let html=""
  list.forEach(item=>{
    html+=`
    <a href="${item.url}" target="_blank" class="friend-card">
      <img class="friend-avatar" src="${item.avatar}" alt="${item.name}">
      <div class="friend-info">
        <div class="friend-name">${item.name}</div>
        <div class="friend-desc">${item.desc}</div>
      </div>
    </a>`
  })
  document.getElementById("friendsList").innerHTML=html
})
</script>

<div class="apply-box">
  <div class="apply-title">🔗 申请友链</div>
  <div class="apply-tips">
    请务必先添加本站友链：<code>https://com.z2m.store</code><br>
    信息无误后提交，审核通过自动加入友链列表。
  </div>
  <form id="friendApplyForm">
    <div class="apply-form-item">
      <label>站点名称</label>
      <input type="text" name="name" required placeholder="你的站点名称">
    </div>
    <div class="apply-form-item">
      <label>网站地址</label>
      <input type="url" name="url" required placeholder="https://xxx.com">
    </div>
    <div class="apply-form-item">
      <label>头像地址</label>
      <input type="url" name="avatar" required placeholder="https://xxx.jpg">
    </div>
    <div class="apply-form-item">
      <label>站点简介</label>
      <textarea name="desc" rows="3" required placeholder="一句话介绍你的网站"></textarea>
    </div>
    <div class="apply-form-item">
      <button type="submit" class="apply-btn">提交申请</button>
    </div>
  </form>
</div>

<script>
document.getElementById('friendApplyForm').addEventListener('submit',function(e){
  e.preventDefault();
  const data=new FormData(this);
  const name=data.get('name');
  const url=data.get('url');
  const avatar=data.get('avatar');
  const desc=data.get('desc');
  const body=`
昵称：${name}
链接：${url}
头像：${avatar}
简介：${desc}
`;
  window.open(`https://github.com/yzg011/com/issues/new?title=友链申请-${name}&body=${encodeURIComponent(body)}`);
})
</script>