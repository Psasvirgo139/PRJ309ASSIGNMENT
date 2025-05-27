// ============================
// scroll - main bundle JS
// ============================
// tiny helper
const $ = (sel, par = document) => par.querySelector(sel);
const $$ = (sel, par = document) => par.querySelectorAll(sel);
const LS = {
  get: (k, def = null) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};
const debounce = (fn, d = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), d); };
};

// ----------------------------
// 1. Demo data
// ----------------------------
const stories = [
  { title: 'Thần Thoại Bắc Âu', author: 'Rick Riordan', desc: 'Cuộc phiêu lưu huyền thoại…', cover: 'https://i.imgur.com/bwAGJto.jpg', tags: ['Hành động','Thần thoại'], status: 'Hoàn thành', rating: 4.8 },
  { title: 'Ma Đạo Tổ Sư', author: 'Mặc Hương Đồng Khứu', desc: 'Một thế giới ma pháp…', cover: 'https://i.imgur.com/ps3z4I6.jpg', tags: ['Đam mỹ','Kỳ ảo'], status: 'Đang ra', rating: 4.7 },
  { title: 'One Piece', author: 'Eiichiro Oda', desc: 'Hành trình vua hải tặc…', cover: 'https://i.imgur.com/6Wjt3AI.jpg', tags: ['Shounen','Phiêu lưu'], status: 'Đang ra', rating: 4.9 },
  { title: 'Hệ Thống Tu Tiên', author: 'Tiêu Dao', desc: 'Thanh niên xuyên không…', cover: 'https://i.imgur.com/7gkTd7U.jpg', tags: ['Tiên hiệp','Xuyên không'], status: 'Đang ra', rating: 4.5 },
  { title: 'Người Ở Bên Kia', author: 'Trần Thanh', desc: 'Mối tình đan xen bi kịch…', cover: 'https://i.imgur.com/DMk5C6Z.jpg', tags: ['Ngôn tình','Bi kịch'], status: 'Hoàn thành', rating: 4.3 }
];

const updates = [
  { title: 'Những Cô Gái Thú Nhân', cover: 'https://i.imgur.com/D1rkV8F.png', chapters: [{name:'Chap 92', time:'22h'} ,{name:'Chap 91',time:'22h'},{name:'Chap 90',time:'22h'}] },
  { title: 'Vị Vua Mạnh Nhất', cover: 'https://i.imgur.com/MFkD0pX.png', chapters: [{name:'Chap 127', time:'2d'},{name:'Chap 126',time:'2d'}] },
  { title: 'Phạm Nhân Bé Con', cover: 'https://i.imgur.com/yfWccFA.png', chapters: [{name:'Chap 60',time:'6d'}] },
  { title: 'Phế Vật Dòng Bá Tước', cover: 'https://i.imgur.com/1wNjP7j.png', chapters: [{name:'Chap 151',time:'1w'}] }
];

// user state
let currentUser = LS.get('scroll_user');
let favorites = LS.get('scroll_fav', []);

// ----------------------------
// 2. Theme toggle
// ----------------------------
(function initTheme(){
  const saved = LS.get('scroll_theme');
  const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved==='dark' : prefers;
  document.documentElement.dataset.theme = isDark?'dark':'';
  $('#themeIcon').textContent = isDark?'☀️':'🌙';
})();
$('#toggleTheme').addEventListener('click',()=>{
  const dark = document.documentElement.dataset.theme==='dark';
  document.documentElement.dataset.theme = dark?'':'dark';
  $('#themeIcon').textContent = dark?'🌙':'☀️';
  LS.set('scroll_theme', dark?'light':'dark');
});

// ----------------------------
// 3. Render helpers
// ----------------------------
const storyCard = (s, i)=>`<div class="story-card"><img class="story-thumb" src="${s.cover}" alt="${s.title}"><div class="story-content"><a class="story-title" href="#">${s.title}</a><div class="story-desc">${s.desc}</div><div class="story-tags">${s.tags.map(t=>`<span class="story-tag">${t}</span>`).join('')}</div><div class="story-info"><span>${s.status}</span><span>⭐ ${s.rating}</span></div><div class="story-actions"><button class="read-btn">Đọc</button><button class="fav-btn ${favorites.includes(s.title)?'active':''}" data-idx="${i}">${favorites.includes(s.title)?'♥':'♡'} Yêu thích</button></div></div></div>`;

const updateCard = u=>`<div class="update-card"><img class="update-thumb" src="${u.cover}" alt="${u.title}"><div class="update-content"><a class="update-title" href="#">${u.title}</a><div class="update-chapters">${u.chapters.map(c=>`<div class="update-chapter"><strong>${c.name}</strong><time>${c.time}</time></div>`).join('')}</div></div></div>`;

function renderFeatured(){
  $('#storiesGrid').innerHTML = stories.map(storyCard).join('');
  $$('.fav-btn').forEach(btn=>btn.addEventListener('click',toggleFav));
}
function renderUpdates(){
  $('#updateGrid').innerHTML = updates.map(updateCard).join('');
}
function toggleFav(e){
  const idx = +e.currentTarget.dataset.idx;
  const title = stories[idx].title;
  if(favorites.includes(title)) favorites = favorites.filter(t=>t!==title);
  else favorites.push(title);
  LS.set('scroll_fav', favorites);
  renderFeatured();
}

// ----------------------------
// 4. Search suggest
// ----------------------------
const suggestList = $('#suggestList');
$('#searchInput').addEventListener('input', debounce(e=>{
  const kw = e.target.value.trim().toLowerCase();
  if(!kw){ suggestList.classList.remove('show'); return; }
  const found = stories.filter(s=>s.title.toLowerCase().includes(kw)||s.author.toLowerCase().includes(kw));
  suggestList.innerHTML = found.length?found.slice(0,6).map(s=>`<li>${s.title} – <em>${s.author}</em></li>`).join(''):`<li>Không tìm thấy…</li>`;
  suggestList.classList.add('show');
},120));
$('#searchInput').addEventListener('keydown',e=>{
  if(e.key==='Enter'){ e.preventDefault(); suggestList.classList.remove('show'); }
});
suggestList.addEventListener('click',e=>{
  if(e.target.tagName==='LI'){ $('#searchInput').value = e.target.innerText.split('–')[0].trim(); suggestList.classList.remove('show'); }
});

// hide suggest on blur
$('#searchInput').addEventListener('blur',()=>setTimeout(()=>suggestList.classList.remove('show'),150));

// ----------------------------
// 5. Account dropdown & modal
// ----------------------------
$('#accountBtn').addEventListener('click',e=>{
  e.stopPropagation();
  $('#accountMenu').classList.toggle('show');
  $('#accountBtn').setAttribute('aria-expanded', $('#accountMenu').classList.contains('show'));
});
document.body.addEventListener('click',e=>{
  if(!$('#accountDropdown').contains(e.target)) $('#accountMenu').classList.remove('show');
});

// quick modal using <dialog>
const dlg = /** @type {HTMLDialogElement} */($('#modalAuth'));
function openAuth(isReg=false){
  dlg.querySelector('#modalTitle').textContent = isReg?'Đăng ký':'Đăng nhập';
  dlg.showModal();
}
$('#loginBtn').onclick = ()=>openAuth(false);
$('#registerBtn').onclick = ()=>openAuth(true);
$('#closeModal').onclick = ()=>dlg.close();

dlg.addEventListener('close',()=>$('#accountMenu').classList.remove('show'));

// ----------------------------
// 6. Mobile nav toggle
// ----------------------------
$('#hamburgerBtn').addEventListener('click',()=>$('#mainNav').classList.toggle('show-mobile'));
window.addEventListener('resize',()=>$('#mainNav').classList.remove('show-mobile'));

// ----------------------------
// 7. Init
// ----------------------------
renderFeatured();
renderUpdates();
