---
title: 说说碎碎念
date: 2026-01-01 12:00:00
layout: page
aside: false
---
<div class="tab-btn-group">
  <button class="tab-btn active" data-type="grid">网格卡片</button>
  <button class="tab-btn" data-type="waterfall">瀑布流</button>
  <button class="sort-btn active" data-sort="desc">最新在前</button>
  <button class="sort-btn" data-sort="asc">最早在前</button>
</div>
<div id="twikoo-talk-wrap" class="talk-container grid-mode"></div>
<div class="load-more-box">
  <button id="loadMore">加载更多</button>
</div>

<!-- 图片预览遮罩DOM -->
<div id="img-preview">
  <img id="preview-img" src="" alt="">
</div>

<script>
// 配置项自行修改
const envId = "https://twikoo.z2m.store";
const masterName = "小鱼";
const pageSize = 12;
// 需要置顶的评论内容关键字(写你置顶说说的关键词，多条用逗号隔开)
const topKeyword = "置顶";
let page = 1;
let allTalk = [];
let renderType = 'grid';
let sortType = 'desc'; // desc最新在前，asc最早在前
</script>
<link rel="stylesheet" href="/css/talk-card.css">
<script src="/js/twikoo-talk.js"></script>