---
title: 说说
date: 2026-06-09 10:00:00
layout: page
comments: true
---
<style>
/* 全局基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* 容器居中 */
.memos-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
/* 聊天式卡片样式 */
.memos-item {
  display: flex;
  gap: 12px;
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
/* 头像容器 */
.avatar-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #eee;
}
.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: none !important;
}
/* 右侧内容区 */
.memos-content-wrap {
  flex: 1;
}
/* 用户名+时间栏 */
.user-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.username {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}
.time {
  font-size: 12px;
  color: var(--text-secondary);
}
/* 正文文本 */
.memos-content {
  line-height: 1.6;
  font-size: 15px;
  margin-bottom: 10px;
  word-break: break-word;
}
/* 图片网格 */
.img-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.img-grid img {
  width: 100% !important;
  height: auto !important;
  object-fit: contain !important;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  background: #f5f5f5;
  background-image: none !important;
}
.img-grid img:hover {
  transform: scale(1.02);
}
/* 大图预览弹窗 固定视口 */
.img-preview {
  display: none;
  position: fixed;
  max-height: 100vh;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 9999;
  overflow: auto;
  align-items: center;
  justify-content: center;
  
}
.preview-img-wrapper {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  padding: 20px;
}
.img-preview img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}
/* 加载/空状态提示 */
.loading-tips {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>

<div class="memos-container" id="memosList">
  <div class="loading-tips">加载中...</div>
</div>

<div class="img-preview" id="imgPreview">
  <div class="preview-img-wrapper">
    <img id="previewImg" alt="大图预览">
  </div>
</div>

<script>
// 【关键1】使用全局作用域判断，防止变量重复声明
if (!window.MemosInit) {
  // 全局常量，仅声明一次
  window.API = "https://ss.z2m.store/api/v1/memos?limit=20&sort=createTime&order=desc";
  window.DOMAIN = "https://ss.z2m.store";
  window.MemosInit = true; // 标记已初始化

  const wrap = document.getElementById("memosList");
  const imgPreview = document.getElementById("imgPreview");
  const previewImg = document.getElementById("previewImg");

  // 关闭预览
  imgPreview && imgPreview.addEventListener('click', (e) => {
    if (e.target === imgPreview) {
      imgPreview.style.display = 'none';
    }
  });
  document.addEventListener('keydown', e => e.key === 'Escape' && (imgPreview.style.display = 'none'));

  // 时间格式化
  function fmtTime(str) {
    const d = new Date(str);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}年${pad(d.getMonth()+1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
      const res = await fetch(window.API, { mode: "cors", cache: "no-cache" });
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
              const originUrl = `${window.DOMAIN}/file/attachments/${att.uid}/${att.filename}`;
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

      // 绑定点击预览
      document.querySelectorAll('.img-grid img').forEach(img => {
        img.onclick = () => {
          previewImg.src = img.dataset.origin;
          imgPreview.style.display = 'block';
        };
      });

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