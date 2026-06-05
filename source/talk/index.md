---
title: 说说
date: 2025-01-01 12:00:00
layout: page
sidebar: false
comment: false
---
<div id="twikoo-shuoshuo-wrap">
  <div id="shuoshuo-top"></div>
  <div id="shuoshuo-list"></div>
  <div id="shuoshuo-page" style="text-align:center;margin:30px 0;"></div>
</div>

<style>
:root {
  --shuoshuo-card-bg: var(--card-bg);
  --shuoshuo-border: var(--border-color);
  --shuoshuo-text: var(--text-color);
  --shuoshuo-secondary: var(--color-secondary);
  --shuoshuo-top-color: #f56c6c;
  --shuoshuo-btn-bg: #42b983;
}
#twikoo-shuoshuo-wrap {
  margin: 2rem auto;
  max-width: 900px;
}
#shuoshuo-top {margin-bottom: 24px;}
.shuoshuo-card {
  background: var(--shuoshuo-card-bg);
  border: 1px solid var(--shuoshuo-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  transition: 0.3s ease;
  position: relative;
}
.shuoshuo-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
#shuoshuo-list .shuoshuo-card:nth-child(3n+2) {transform: translateY(8px);}
#shuoshuo-list .shuoshuo-card:nth-child(3n) {transform: translateY(-8px);}

.shuoshuo-top-tag {
  color: var(--shuoshuo-top-color);
  font-size:12px;
  border:1px solid var(--shuoshuo-top-color);
  padding:2px 8px;
  border-radius: 99px;
  margin-right:8px;
}
.shuoshuo-date {
  font-size:13px;
  color: var(--shuoshuo-secondary);
  margin-bottom:12px;
  display:flex;
  align-items:center;
  justify-content: space-between;
}
.shuoshuo-body {
  color: var(--shuoshuo-text);
  line-height:1.7;
}
.shuoshuo-body img {
  max-width:100%;
  border-radius:12px;
  margin:6px 0;
  cursor: pointer;
}
.del-tips{
  font-size:12px;
  color:var(--shuoshuo-top-color);
  opacity:0;
  transition:0.2s;
}
.shuoshuo-card:hover .del-tips{opacity:1;}
.page-btn{
  padding:6px 14px;
  margin:0 4px;
  border:1px solid var(--shuoshuo-border);
  border-radius:6px;
  background:var(--shuoshuo-card-bg);
  cursor:pointer;
}
.page-btn.active{
  background:var(--shuoshuo-btn-bg);
  color:#fff;
  border-color:var(--shuoshuo-btn-bg);
}
#img-lightbox{
  position:fixed;
  top:0;left:0;right:0;bottom:0;
  background:rgba(0,0,0,0.85);
  z-index:9999;
  display:none;
  align-items:center;
  justify-content:center;
  padding:20px;
}
#img-lightbox img{
  max-width:95%;
  max-height:95vh;
  border-radius:8px;
}
#tcomment{display:none !important;}
</style>
<div id="img-lightbox" onclick="closeLight()">
  <img id="light-img">
</div>

<script>
const apiUrl = "https://twikoo.z2m.store/api/getComments";
const pagePath = "/talk/";
const authorName = "小鱼";
const topKey = "#置顶#";
const pageSize = 8;
let nowPage = 1;
let topList = [];
let normalList = [];

function openLight(src){
  document.getElementById('light-img').src = src
  document.getElementById('img-lightbox').style.display = 'flex'
}
function closeLight(){
  document.getElementById('img-lightbox').style.display = 'none'
}

function formatDate(time){
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function replaceImgClick(htmlStr){
  return htmlStr.replace(/<img([^>]+)src="([^"]+)"/g,'<img$1src="$2" onclick="openLight(\'$2\')"')
}

async function getAllShuoshuo(){
  try{
    const res = await fetch(`${apiUrl}?path=${encodeURIComponent(pagePath)}&page=1&pageSize=999`);
    const json = await res.json();
    const data = json.data || [];
    topList = [];
    normalList = [];
    data.forEach(item=>{
      //放开全部评论，不筛选昵称
      let cnt = item.content.trim();
      if(cnt.startsWith(topKey)){
        item.content = cnt.replace(topKey,'');
        topList.push(item);
      }else{
        normalList.push(item);
      }
    })
    topList.sort((a,b)=>new Date(b.created)-new Date(a.created))
    normalList.sort((a,b)=>new Date(b.created)-new Date(a.created))
    renderPage(nowPage)
  }catch(err){
    console.log("拉取失败：",err)
  }
}

function renderPage(p){
  nowPage = p
  let topHtml = ''
  topList.forEach(item=>{
    let d = formatDate(item.created)
    topHtml += `
      <div class="shuoshuo-card">
        <div class="shuoshuo-date">
          <span class="shuoshuo-top-tag">置顶</span>${d}
          <span class="del-tips">👉前往Twikoo后台删除</span>
        </div>
        <div class="shuoshuo-body">${replaceImgClick(item.content)}</div>
      </div>
    `
  })
  document.getElementById('shuoshuo-top').innerHTML = topHtml

  const start = (p-1)*pageSize
  const end = p*pageSize
  const pageData = normalList.slice(start,end)
  let listHtml = ''
  if(pageData.length === 0){
    listHtml = '<div style="text-align:center;padding:30px;color:var(--color-secondary);">暂无说说</div>'
  }else{
    pageData.forEach(item=>{
      let d = formatDate(item.created)
      listHtml += `
        <div class="shuoshuo-card">
          <div class="shuoshuo-date">
            📅 ${d}
            <span class="del-tips">👉前往Twikoo后台删除</span>
          </div>
          <div class="shuoshuo-body">${replaceImgClick(item.content)}</div>
        </div>
      `
    })
  }
  document.getElementById('shuoshuo-list').innerHTML = listHtml

  let totalPage = Math.ceil(normalList.length/pageSize)
  let pageHtml = ''
  if(totalPage>1){
    for(let i=1;i<=totalPage;i++){
      pageHtml += `<button class="page-btn ${i===nowPage?'active':''}" onclick="renderPage(${i})">${i}</button>`
    }
  }
  document.getElementById('shuoshuo-page').innerHTML = pageHtml
}

setTimeout(getAllShuoshuo,1800)
</script>