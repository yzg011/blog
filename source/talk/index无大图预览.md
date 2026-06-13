---
title: 说说
date: 2026-06-09 10:00:00
layout: page
comments: true
---
<style>
/* 页面样式 */
.memos-container{max-width:800px;margin:2rem auto;padding:0 1rem;}
.state-tips{text-align:center;padding:2rem;color:var(--vp-c-text-2);}
.memos-item{display:flex;gap:12px;background:var(--vp-c-bg-soft);border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
.avatar-wrap{flex-shrink:0;width:40px;height:40px;border-radius:50%;overflow:hidden;background:#eee;}
.avatar-wrap img{width:100%;height:100%;object-fit:cover;}
.memos-content-wrap{flex:1;}
.user-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.username{font-weight:600;font-size:14px;color:var(--vp-c-text-1);}
.time{font-size:12px;color:var(--vp-c-text-2);}
.memos-content{line-height:1.6;font-size:15px;margin-bottom:10px;word-break:break-word;color:var(--vp-c-text-1);}
.img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:10px;}
.img-grid img{width:100%;height:auto;object-fit:contain;border-radius:8px;cursor:pointer;transition:transform 0.2s ease;background:#f5f5f5;}
.img-grid img:hover{transform:scale(1.02);}

/* 蒙层+全屏预览容器 */
.img-preview {
  position: fixed !important; /* 固定定位，全屏覆盖 */
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important; /* 视口宽度100% */
  height: 100vh !important; /* 视口高度100% */
  background: rgba(0,0,0,0.85) !important; /* 半透明黑色蒙层 */
  z-index: 99999 !important; /* 最高层级，确保覆盖其他内容 */
  display: none; /* 默认隐藏 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
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

<!-- 弹窗DOM -->
<div class="img-preview" id="imgPreview">
  <div class="preview-img-wrapper">
    <img id="previewImg" alt="大图预览">
  </div>
</div>

<script>
// 【关键1】使用全局作用域判断，防止变量重复声明
window.onload = function(){
  const API = "https://ss.z2m.store/api/v1/memos?limit=20&sort=createTime&order=desc";
  const IMG_DOMAIN = "https://ss.z2m.store";
  const wrap = document.getElementById("memosList");
  const previewBox = document.getElementById("imgPreview");
  const previewImg = document.getElementById("previewImg");
  let scrollTop = 0;

  // 关键：每次打开弹窗前，强制移动到 body 末尾，脱离所有父容器
  function movePreviewToBody(){
    document.body.appendChild(previewBox);
  }

  // 打开预览
  window.openImg = function(url){
    movePreviewToBody();
    scrollTop = window.scrollY;
    previewImg.src = url;
    previewBox.classList.add("show");
    // 锁定页面
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.top = `-${scrollTop}px`;
    document.documentElement.style.width = '80%';
  }
  // 关闭预览
  function closePreview(){
    previewBox.classList.remove("show");
    document.documentElement.style.position = '';
    document.documentElement.style.top = '';
    window.scrollTo(0, scrollTop);
  }

  // 事件绑定
previewBox.addEventListener("click",e=>{if(e.target === previewBox) closePreview()});
document.addEventListener("keydown",e=>{if(e.key === "Escape") closePreview()});

  // 时间格式化
  function fmtTime(str) {
    const d = new Date(str);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}年${pad(d.getMonth()+1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // 生成图片标签
  function createImg(url){
    return `<img src="${url}" onclick="openImg('${url}')" loading="eager">`;
  }


  // 安全创建图片，屏蔽懒加载占位图
  function createSafeImg(originUrl) {
    const img = new Image();
    img.alt = "说说图片";
    img.dataset.origin = originUrl;
    img.dataset.noLazy = "1";
    img.loading = "eager";
    img.src = originUrl;
    return img.outerHTML;
  }

  // 主渲染函数
  async function renderMemos() {
    if (!wrap) return;
    try {
      const res = await fetch(API, { mode: "cors", cache: "no-cache" });
      if (!res.ok) throw new Error("接口请求失败");
      const json = await res.json();
      const list = json.memos || [];

      if (list.length === 0) {
        wrap.innerHTML = '<div class="loading-tips">暂无说说</div>';
        return;
      }

      let html = "";
      list.forEach(item => {
        const text = item.content || "";
        let imgHtml = '';
        if (Array.isArray(item.attachments) && item.attachments.length > 0) {
          imgHtml = '<div class="img-grid">';
          item.attachments.forEach(att => {
            if (att.type && att.type.startsWith('image/')) {
              const originUrl = `${IMG_DOMAIN}/file/attachments/${att.uid}/${att.filename}`;
              imgHtml += createSafeImg(originUrl);
            }
          });
          imgHtml += '</div>';
        }

        html += `
          <div class="memos-item">
            <div class="avatar-wrap">
              <img src="https://com.z2m.store/img/butterfly-icon.png" alt="头像" data-no-lazy="1" loading="eager">
            </div>
            <div class="memos-content-wrap">
              <div class="user-header">
                <span class="username">深漂小鱼</span>
                <span class="time">${fmtTime(item.createTime)}</span>
              </div>
              <div class="memos-content">${text}</div>
              ${imgHtml}
            </div>
          </div>
        `;
      });
      wrap.innerHTML = html;


      // 兜底修复占位图替换
      setInterval(() => {
        document.querySelectorAll('.img-grid img').forEach(img => {
          const origin = img.dataset.origin;
          if (origin && img.src.includes("loading2.gif")) {
            img.src = origin;
          }
        });
      }, 300);

    } catch (e) {
      wrap.innerHTML = `<div class="loading-tips">加载异常：${e.message}</div>`;
      console.error(e);
    }
  }

  // 【关键2】兼容 PJAX / 普通刷新，延迟执行
  function startInit() {
    setTimeout(renderMemos, 400);
  }

  // 页面首次加载 + PJAX 跳转都执行
  startInit();
  document.addEventListener('pjax:end', startInit);
}




</script>