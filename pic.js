const fs = require('fs');
const path = require('path');

const albumRoot = path.join(__dirname, 'source/album');
const allowExt = ['.jpg','.jpeg','.png','.webp','.gif'];
const ignoreFile = ['index.md','cover.jpg','desc.txt'];

// 读取分类配置：标题、描述
function getCatInfo(catDir) {
  const descPath = path.join(catDir, 'desc.txt');
  let title = '';
  let desc = '';
  try {
    const txt = fs.readFileSync(descPath, 'utf8').trim();
    const lines = txt.split('\n').filter(line => line.trim());
    title = lines[0] || catDir;
    desc = lines[1] || '查看图集';
  } catch (e) {
    // 没有desc.txt就用文件夹名
    title = path.basename(catDir);
    desc = '查看图集';
  }
  return {title, desc};
}

function getCategories() {
  const list = fs.readdirSync(albumRoot);
  let cats = [];
  for(let name of list){
    const fullPath = path.join(albumRoot, name);
    if(!fs.statSync(fullPath).isDirectory()) continue;
    cats.push(name);
  }
  return cats;
}

function getImages(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return allowExt.includes(ext) && !ignoreFile.includes(f);
    })
    .sort();
}

// 生成子页面 严格你要的格式
function buildCatPage(catName) {
  const catDir = path.join(albumRoot, catName);
  const imgs = getImages(catDir);
  const {title} = getCatInfo(catDir);

  let imgLines = imgs.map(img => 
`![](/album/${catName}/${img})`
  ).join('\n');

  const md = `---
title: ${title}
date: ${new Date().toISOString().split('T')[0]} 12:00:00
type: album
aside: true
comments: false
---

{% gallery true %}
${imgLines}
{% endgallery %}
`;

  const mdPath = path.join(catDir, 'index.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`✅ 生成相册：${title}`);
}

// 生成首页分组，自动带入自定义描述
function buildIndexPage(cats) {
  let groupLines = '';
  for(let cat of cats) {
    const catDir = path.join(albumRoot, cat);
    const imgs = getImages(catDir);
    const {title, desc} = getCatInfo(catDir);
    let coverUrl = imgs.length 
      ? `/album/${cat}/${imgs[0]}` 
      : `/album/cover.jpg`;

    groupLines += `{% galleryGroup '${title}' '${desc}' '/album/${cat}' ${coverUrl} %}\n`;
  }

  const indexMd = `---
title: 我的相册
date: ${new Date().toISOString().split('T')[0]} 12:00:00
aside: true
comments: false
---
<div class="gallery-group-main">
${groupLines}
</div>
`;

  const indexPath = path.join(albumRoot, 'index.md');
  fs.writeFileSync(indexPath, indexMd, 'utf8');
  console.log('\n✅ 相册首页生成完成');
}

function main(){
  const cats = getCategories();
  if(cats.length === 0){
    console.log('❌ 请在 source/album 下新建分类文件夹放图片');
    return;
  }
  cats.forEach(buildCatPage);
  buildIndexPage(cats);
}

main();