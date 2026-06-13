---
title: 说说
date: 2026-06-12 10:00:00
layout: page
comments: true
---
<style>
/* 页面样式 */
.memos-container{max-width:800px;margin:2rem auto;padding:0 1rem;}
.state-tips{text-align:center;padding:2rem;color:var(--vp-c-text-2);}
.memos-item{display:flex;gap:12px;background:var(--vp-c-bg-soft);border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0.08);}
.avatar-wrap{flex-shrink:0;width:40px;height:40px;border-radius:50%;overflow:hidden;background:#eee;}
/* 重点：头像图片强制清空占位背景、禁止懒加载样式 */
.avatar-wrap img {
  width:100%;
  height:100%;
  object-fit:cover;
  background: transparent !important;
  background-image: none !important;
  opacity: 1 !important;
}
.memos-content-wrap{flex:1;}
.user-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.username{font-weight:600;font-size:14px;color:var(--vp-c-text-1);}
.time{font-size:12px;color:var(--vp-c-text-2);}
.memos-content{line-height:1.6;font-size:15px;margin-bottom:10px;word-break:break-word;color:var(--vp-c-text-1);}
.img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:10px;}
.img-grid img{width:100%;height:auto;object-fit:contain;border-radius:8px;cursor:pointer;transition:transform 0.2s ease;background:#f5f5;}
.img-grid img:hover{transform:scale(1.02);}

/* 加载更多按钮样式 */
.load-more-btn{
  display:block;
  width:180px;
  height:40px;
  line-height:40px;
  text-align:center;
  margin:1rem auto 2rem;
  background:var(--vp-c-bg-soft);
  border-radius:20px;
  color:var(--vp-c-text-1);
  cursor:pointer;
  transition:all 0.2s;
  border:none;
  font-size:14px;
}
.load-more-btn:hover{
  background:var(--vp-c-bg-mute);
}
.load-more-btn:disabled{
  cursor:not-allowed;
  color:var(--vp-c-text-3);
  background:var(--vp-c-bg-alt);
}

/* 弹窗全局样式，最高优先级 */
.img-preview {
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0,0,0.85) !important;
  z-index: 99999 !important;
  display: none;
  align-items: center;
  justify-content: center;
}
.img-preview.show {
  display: flex !important;
}
.preview-img-wrapper {
  width: 90%;
  max-width: 800px;
  text-align: center;
}
.preview-img-wrapper img {
  max-width: 100%;
  max-height: 92vh;
  border-radius: 8px;
  object-fit: contain;
}
</style>

<div class="memos-container" id="memosList">
  <div class="state-tips">加载中...</div>
</div>
<!-- 加载更多按钮 -->
<button class="load-more-btn" id="loadMoreBtn" disabled>加载更多</button>

<!-- 弹窗DOM -->
<div class="img-preview" id="imgPreview">
  <div class="preview-img-wrapper">
    <img id="previewImg" alt="大图预览">
  </div>
</div>

<script>
window.onload = function(){
  // 接口 & 分页配置
  const API_BASE = "https://ss.z2m.store/api/v1/memos";
  const PAGE_SIZE = 10;
  let pageToken = "";
  let hasMore = true;
  let isLoading = false;

  const IMG_DOMAIN = "https://ss.z2m.store";
  const wrap = document.getElementById("memosList");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const previewBox = document.getElementById("imgPreview");
  const previewImg = document.getElementById("previewImg");
  const PIC = "https://com.z2m.store/img/butterfly-icon.png";
  let scrollTop = 0;

  // 弹窗移到body根节点
  function movePreviewToBody(){
    document.body.appendChild(previewBox);
  }

  // 打开图片预览
  window.openImg = function(url){
    movePreviewToBody();
    scrollTop = window.scrollY;
    previewImg.src = url;
    previewBox.classList.add("show");
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.top = `-${scrollTop}px`;
    document.documentElement.style.width = '100%';
  }

  // 关闭图片预览
  function closePreview(){
    previewBox.classList.remove("show");
    document.documentElement.style.position = '';
    document.documentElement.style.top = '';
    window.scrollTo(0, scrollTop);
  }

  // 关闭事件
  previewBox.addEventListener("click", e => {
    if(e.target === previewBox) closePreview();
  });
  document.addEventListener("keydown", e => {
    if(e.key === "Escape") closePreview();
  });

  // 时间格式化
  function formatTime(s){
    if(!s) return "未知时间";
    let d = new Date(s);
    if(isNaN(d.getTime())) return "未知时间";
    let pad = n => String(n).padStart(2,"0");
    return d.getFullYear()+"年"+pad(d.getMonth()+1)+"月"+pad(d.getDate())+"日 "+pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
  }

  // 生成图片标签
  function createSafeImg(originUrl) {
    return `<img 
      src="${originUrl}" 
      onclick="openImg('${originUrl}')" 
      loading="eager" 
      alt="说说图片" 
      data-no-lazy="1"
    >`;
  }

  // 拼接请求地址
  function buildApiUrl(){
    let url = `${API_BASE}?pageSize=${PAGE_SIZE}&sort=createTime&order=desc`;
    if(pageToken){
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }
    return url;
  }

  // 加载数据
  function loadData(isLoadMore = false){
    if(isLoading || !hasMore) return;
    isLoading = true;

    if(!isLoadMore){
      wrap.innerHTML = '<div class="state-tips">加载中...</div>';
    }else{
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = "加载中...";
    }

    let xhr = new XMLHttpRequest();
    xhr.timeout = 8000;
    xhr.open("GET", buildApiUrl(), true);
    xhr.setRequestHeader("Content-Type","application/json");

    xhr.onload = function(){
      isLoading = false;
      if(xhr.status >= 200 && xhr.status < 300){
        let data = JSON.parse(xhr.responseText);
        let list = Array.isArray(data.memos) ? data.memos : [];
        let nextToken = data.nextPageToken || "";
        hasMore = !!nextToken;
        pageToken = nextToken;

        if(list.length === 0){
          if(!isLoadMore){
            wrap.innerHTML = '<div class="state-tips">暂无说说</div>';
          }
          loadMoreBtn.disabled = true;
          loadMoreBtn.textContent = "没有更多了";
          return;
        }

        let html = "";
        for(let i = 0; i < list.length; i++){
          let item = list[i];
          let content = item.content || "";
          let imgHtml = "";
          if(Array.isArray(item.attachments) && item.attachments.length){
            imgHtml = '<div class="img-grid">';
            item.attachments.forEach(att => {
              if(att.type && att.type.startsWith("image/")){
                let imgUrl = IMG_DOMAIN + "/file/attachments/" + att.uid + "/" + att.filename;
                imgHtml += createSafeImg(imgUrl);
              }
            });
            imgHtml += "</div>";
          }

          html += `
            <div class="memos-item">
              <div class="avatar-wrap">
                <img src=${PIC} loading="eager" data-no-lazy>
              </div>
              <div class="memos-content-wrap">
                <div class="user-header">
                  <span class="username">深漂小鱼</span>
                  <span class="time">${formatTime(item.createTime)}</span>
                </div>
                <div class="memos-content">${content}</div>
                ${imgHtml}
              </div>
            </div>
          `;
        }

        if(isLoadMore){
          wrap.insertAdjacentHTML('beforeend', html);
        }else{
          wrap.innerHTML = html;
        }

        loadMoreBtn.disabled = !hasMore;
        loadMoreBtn.textContent = hasMore ? "加载更多" : "没有更多了";

        // 清理懒加载残留
        setTimeout(() => {
          const allImg = document.querySelectorAll('img');
          allImg.forEach(img => {
            img.classList.remove('lazy');
            img.removeAttribute('data-lazy');
            img.removeAttribute('data-src');
            if(img.src.includes("loading2.gif") && img.dataset.noLazy){
              img.src = img.getAttribute('src');
            }
          });
        }, 150);

      }else{
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = "加载更多";
        if(!isLoadMore){
          wrap.innerHTML = '<div class="state-tips">请求失败</div>';
        }
      }
    };

    xhr.onerror = function(){
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "加载更多";
      if(!isLoadMore){
        wrap.innerHTML = '<div class="state-tips">跨域/网络异常</div>';
      }
    };

    xhr.ontimeout = function(){
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "加载更多";
      if(!isLoadMore){
        wrap.innerHTML = '<div class="state-tips">请求超时</div>';
      }
    };

    xhr.send();
  }

  // 绑定点击事件（修复 loadMore 未定义）
  loadMoreBtn.addEventListener('click', () => {
    loadData(true);
  });

  // 初始加载
  setTimeout(() => {
    loadData(false);
  }, 100);
};
</script>