const $=s=>document.querySelector(s),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const cv=n=>getComputedStyle(document.documentElement).getPropertyValue('--'+n).trim();
const pad=n=>String(n).padStart(2,'0'),fd=d=>pad(d.getDate())+'/'+pad(d.getMonth()+1),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const nf=(v,d)=>v.toLocaleString('vi-VN',{maximumFractionDigits:d});
const N=200,END=new Date();END.setHours(0,0,0,0);
const dates=[...Array(N)].map((_,i)=>{const d=new Date(END);d.setDate(END.getDate()-(N-1-i));return d});
const R=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const MT={};
const mk=(k,l,u,kd,dec,seed,b,a,tr=0,wk=1,mx=1e9)=>{const r=R(seed);MT[k]={l,u,k:kd,dec,v:dates.map((d,i)=>Math.min(mx,Math.max(0,(b*(1+tr*i/N)+a*(r()*2-1))*(d.getDay()%6==0?wk:1))))}};
mk('lt','Việc hoàn thành','việc','sum',0,1,6,3,.2,.5);
mk('lh','Giờ LEDG','giờ','sum',1,2,4,1.6,0,.4);
mk('lq','Chất lượng','%','avg',0,3,82,10,.08,1,100);
mk('lb','Việc tồn','việc','avg',0,4,9,4,-.2);
mk('br','Doanh thu','tr đ','sum',1,5,9,5,.5,.7);
mk('bc','Chi phí','tr đ','sum',1,6,4.5,2,.2,.7);
mk('bo','Đơn hàng','đơn','sum',0,7,14,6,.4,.6);
mk('bh','Giờ Business','giờ','sum',1,8,2,1,0,.5);
mk('em','Phút học','phút','sum',0,9,48,25,.3,1.2);
mk('ew','Từ mới','từ','sum',0,10,12,8,.2);
mk('es','Điểm luyện tập','/100','avg',0,11,62,8,.35,1,100);
mk('pp','Trang đã dựng','trang','sum',0,12,2.2,1.6,.3,.5);
mk('pc','Tỉ lệ chuyển đổi','%','avg',1,13,2.6,.8,.25);
mk('pr','Doanh thu PageFly','tr đ','sum',1,14,3.5,2.2,.5,.8);
mk('ph','Giờ PageFly','giờ','sum',1,15,2.2,1,0,.4);
mk('ps','Giấc ngủ','giờ','avg',1,16,6.8,1,0,1.1,10);
mk('pw','Vận động','phút','sum',0,17,32,26,.1,1.3);
mk('pm','Tâm trạng','/10','avg',1,18,7,1.5,.05,1,10);
mk('hb','Thói quen đạt','%','avg',0,19,72,22,.1,1,100);
mk('fi','Thu nhập','tr đ','sum',1,20,12,9,.3,.8);
mk('fe','Chi tiêu','tr đ','sum',1,21,6,3.5,.1,1.2);
const dv=(k,l,u,kd,dec,f)=>MT[k]={l,u,k:kd,dec,v:dates.map((_,i)=>f(i))};
dv('eh','Giờ English','giờ','sum',1,i=>MT.em.v[i]/60);
dv('bp','Lợi nhuận','tr đ','sum',1,i=>MT.br.v[i]-MT.bc.v[i]);
dv('sv','Tiết kiệm','tr đ','sum',1,i=>MT.fi.v[i]-MT.fe.v[i]);
dv('at','Việc đã xong','việc','sum',0,i=>MT.lt.v[i]+MT.pp.v[i]);
dv('ah','Giờ làm việc','giờ','sum',1,i=>MT.lh.v[i]+MT.bh.v[i]+MT.eh.v[i]+MT.ph.v[i]);
dv('sc','Điểm hoàn thành','/100','avg',0,i=>(MT.lq.v[i]+MT.hb.v[i])/2);
MT.sr={l:'Tỉ lệ tiết kiệm',u:'%',k:'ratio',n:'sv',d:'fi',dec:0};
['lb','bc','fe'].forEach(k=>MT[k].inv=1);
const MO=[],WK=[];
dates.forEach((d,i)=>{const k=d.getFullYear()*12+d.getMonth();let m=MO[MO.length-1];if(!m||m.k!=k)MO.push(m={k,s:i,l:'Tháng '+(d.getMonth()+1)+'/'+d.getFullYear()});m.e=i;if(d.getDay()==1){const j=Math.min(i+6,N-1);WK.push({s:i,e:j,l:fd(d)+' – '+fd(dates[j])})}});
MO.reverse();WK.reverse();
const F={m:'30',mo:0,wk:0,a:iso(dates[N-14]),b:iso(dates[N-1])};
function rng(){const m=F.m;if(+m)return[N-+m,N-1];if(m=='mo')return[MO[F.mo].s,MO[F.mo].e];if(m=='wk')return[WK[F.wk].s,WK[F.wk].e];const ix=v=>Math.min(N-1,Math.max(0,Math.round((new Date(v+'T00:00')-dates[0])/864e5)));const s=ix(F.a),e=ix(F.b);return s>e?[e,s]:[s,e]}
function val(k,s,e){const m=MT[k];if(m.k=='ratio')return val(m.n,s,e)/Math.max(.001,val(m.d,s,e))*100;let t=0;for(let i=s;i<=e;i++)t+=m.v[i];return m.k=='sum'?t:t/(e-s+1)}
const I={cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',stats:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',ledg:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',biz:'<path d="M3 8h18v12H3zM9 8V5h6v3M3 13h18"/>',eng:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',pf:'<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',per:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',fin:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9a3 3 0 00-5 1c0 3 5 1.5 5 4a3 3 0 01-5 1M12 6v12"/>',acc:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'};
const H4=['lh','bh','eh','ph'];
const PG={
stats:{n:'Thống kê',d:'Toàn cảnh tiến độ của bạn trên mọi mảng',k:['at','ah','fi','sc'],c:[{t:'bar',h:'Giờ làm theo mảng',d:H4,st:1,s:2},{t:'dn',h:'Phân bổ thời gian',d:H4},{t:'line',h:'Điểm hoàn thành mỗi ngày',d:['sc'],tg:75,s:2},{t:'wd',h:'Ngày làm hiệu quả nhất',d:['at']},{t:'heat',h:'Nhịp làm việc 26 tuần gần nhất',s:3}]},
cal:{n:'Calendar',d:'Lên lịch công việc, học tập và cá nhân'},ledg:{n:'LEDG',d:'Tiến độ công việc LEDG mỗi ngày',k:['lt','lh','lq','lb'],c:[{t:'bar',h:'Việc hoàn thành mỗi ngày',d:['lt'],s:2},{t:'dn',h:'Chất lượng đầu ra',pct:'lq'},{t:'line',h:'Giờ làm',d:['lh'],s:2},{t:'wd',h:'Năng suất theo thứ',d:['lt']}]},
biz:{n:'Business',d:'Doanh thu, chi phí và đơn hàng',k:['br','bc','bp','bo'],c:[{t:'line',h:'Doanh thu và chi phí',d:['br','bc'],s:2},{t:'dn',h:'Cơ cấu chi phí',d:['bc'],sh:[['Quảng cáo',.42],['Nhân sự',.28],['Công cụ',.12],['Vận hành',.18]]},{t:'bar',h:'Lợi nhuận mỗi ngày',d:['bp'],s:2},{t:'wd',h:'Đơn hàng theo thứ',d:['bo']}]},
eng:{n:'English',d:'Thời gian học, từ vựng và điểm luyện tập',k:['em','ew','es'],c:[{t:'bar',h:'Phút học mỗi ngày',d:['em'],s:2},{t:'rd',h:'Cân bằng kỹ năng',d:['es'],r:[['Nghe',58],['Nói',46],['Đọc',70],['Viết',52],['Từ vựng',64]]},{t:'line',h:'Từ vựng mới',d:['ew'],s:2},{t:'line',h:'Điểm luyện tập',d:['es'],tg:80}]},
pf:{n:'PageFly',d:'Trang đã dựng, chuyển đổi và doanh thu',k:['pp','pc','pr','ph'],c:[{t:'bar',h:'Trang đã dựng',d:['pp'],s:2},{t:'dn',h:'Nguồn truy cập',d:['pr'],sh:[['Facebook',.38],['Google',.31],['Trực tiếp',.18],['Email',.13]]},{t:'line',h:'Tỉ lệ chuyển đổi',d:['pc'],s:2},{t:'line',h:'Doanh thu',d:['pr']}]},
per:{n:'Cá nhân',d:'Giấc ngủ, vận động, tâm trạng và thói quen',k:['ps','pw','pm','hb'],c:[{t:'line',h:'Giấc ngủ',d:['ps'],tg:7.5,s:2},{t:'dn',h:'Thói quen đạt',pct:'hb'},{t:'bar',h:'Vận động',d:['pw'],s:2},{t:'rd',h:'Cân bằng cuộc sống',d:['hb'],r:[['Sức khoẻ',70],['Học tập',62],['Công việc',78],['Tài chính',66],['Tinh thần',72]]}]},
fin:{n:'Tài chính',d:'Thu nhập, chi tiêu và mức tiết kiệm',k:['fi','fe','sv','sr'],c:[{t:'line',h:'Thu nhập và chi tiêu',d:['fi','fe'],s:2},{t:'dn',h:'Chi tiêu theo nhóm',d:['fe'],sh:[['Ăn uống',.32],['Nhà ở',.26],['Di chuyển',.12],['Học tập',.14],['Giải trí',.09],['Khác',.07]]},{t:'bar',h:'Tiết kiệm mỗi ngày',d:['sv'],s:2},{t:'wd',h:'Chi tiêu theo thứ',d:['fe']}]},
acc:{n:'Tài khoản',d:'Số dư các tài khoản và kết nối dữ liệu'}};
const ACC=[['Techcombank','Ngân hàng',128.4],['Vietcombank','Ngân hàng',64.2],['MoMo','Ví điện tử',8.7],['Tiền mặt','Tiền mặt',3.1],['Quỹ dự phòng','Tiết kiệm',210]];
const P=['gold','teal','rose','sl'];let cur='stats',CH=[];
function spark(p){const mn=Math.min(...p),mx=Math.max(...p),r=mx-mn||1,n=p.length-1||1;return`<svg class="sp" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${p.map((v,i)=>(i/n*100).toFixed(1)+','+(26-(v-mn)/r*22).toFixed(1)).join(' ')}" fill="none" stroke="var(--gold)" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
function kpi(k,s,e){const m=MT[k],v=val(k,s,e),len=e-s+1,ps=s-len;let dl='<span class="dl mt">—</span>';
if(ps>=0){const pv=val(k,ps,s-1),c=pv?(v-pv)/Math.abs(pv)*100:0,up=c>=0;dl=`<span class="dl ${(m.inv?!up:up)?'ok':'bad'}">${up?'▲':'▼'} ${nf(Math.abs(c),1)}%</span>`}
const g=len>45?7:1,pts=[];for(let i=s;i<=e;i+=g)pts.push(val(k,i,Math.min(i+g-1,e)));
return`<div class="card"><div class="lb">${m.l}</div><div class="vl"><b data-v="${v}" data-d="${m.dec}">0</b><i>${m.u}</i></div><div class="ft">${dl}<span class="mt">so với kỳ trước</span></div>${spark(pts)}</div>`}
function cu(){document.querySelectorAll('[data-v]').forEach(el=>{const v=+el.dataset.v,d=+el.dataset.d,t0=performance.now();const f=t=>{const p=RM?1:Math.min(1,(t-t0)/800);el.textContent=nf(v*(1-Math.pow(1-p,3)),d);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}
function heat(s,e){const base=N-182,off=(dates[base].getDay()+6)%7,mx=Math.max(...MT.at.v.slice(base));let h='';for(let j=0;j<off;j++)h+='<i class="e"></i>';
for(let i=base;i<N;i++)h+=`<i title="${fd(dates[i])}: ${nf(MT.at.v[i],0)} việc" class="${i>=s&&i<=e?'in':''}" style="--p:${Math.round(8+MT.at.v[i]/mx*82)}%"></i>`;return h}
const grad=(x,c)=>{const a=x.chart.chartArea;if(!a)return c+'22';const g=x.chart.ctx.createLinearGradient(0,a.top,0,a.bottom);g.addColorStop(0,c+'44');g.addColorStop(1,c+'00');return g};
function chart(id,c,s,e){
const g=(e-s+1)>45?7:1,B=[];for(let i=s;i<=e;i+=g)B.push([i,Math.min(i+g-1,e)]);
const col=n=>cv(P[n%P.length]),ser=k=>B.map(b=>+val(k,b[0],b[1]).toFixed(2));
let type=c.t,data,opt={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:c.d&&c.d.length>1}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:8}},y:{grid:{color:cv('line')},border:{display:false},beginAtZero:c.t!='line'}}};
if(c.t=='bar'||c.t=='line'){
data={labels:B.map(b=>fd(dates[b[0]])),datasets:c.d.map((k,j)=>c.t=='bar'?{label:MT[k].l,data:ser(k),backgroundColor:col(j),borderRadius:6,maxBarThickness:28,stack:'a'}:{label:MT[k].l,data:ser(k),borderColor:col(j),backgroundColor:j?'transparent':x=>grad(x,col(0)),fill:j?false:'origin',tension:.38,pointRadius:0,pointHoverRadius:5,borderWidth:2.4})};
if(c.tg)data.datasets.push({label:'Mục tiêu',data:B.map(()=>c.tg),borderColor:cv('sl'),borderDash:[5,5],borderWidth:1.4,pointRadius:0,fill:false,type:'line'});
if(c.st){opt.scales.x.stacked=true;opt.scales.y.stacked=true}else if(c.t=='bar')data.datasets.forEach(d=>d.stack=undefined);
opt.plugins.legend.display=data.datasets.length>1;opt.plugins.legend.position='bottom'}
else if(c.t=='dn'){type='doughnut';let L,D;
if(c.pct){const a=val(c.pct,s,e);L=['Đạt','Chưa đạt'];D=[a,100-a]}
else if(c.sh){const t=val(c.d[0],s,e);L=c.sh.map(x=>x[0]);D=c.sh.map(x=>t*x[1])}
else{L=c.d.map(k=>MT[k].l);D=c.d.map(k=>val(k,s,e))}
data={labels:L,datasets:[{data:D,backgroundColor:L.map((_,i)=>col(i)),borderColor:cv('card'),borderWidth:3,hoverOffset:6}]};
opt={responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{position:'bottom'}}}}
else if(c.t=='wd'){type='bar';const sm=Array(7).fill(0),ct=Array(7).fill(0);for(let i=s;i<=e;i++){const w=(dates[i].getDay()+6)%7;sm[w]+=MT[c.d[0]].v[i];ct[w]++}
data={labels:['T2','T3','T4','T5','T6','T7','CN'],datasets:[{label:'Trung bình',data:sm.map((v,i)=>ct[i]?+(v/ct[i]).toFixed(2):0),backgroundColor:sm.map((_,i)=>i>4?cv('sl'):cv('gold')),borderRadius:6,maxBarThickness:30}]}}
else if(c.t=='rd'){type='radar';const a=val(c.d[0],s,e)-val(c.d[0],0,N-1);
data={labels:c.r.map(x=>x[0]),datasets:[{label:'Điểm',data:c.r.map((x,i)=>Math.max(10,Math.min(98,x[1]+a*(i%2?.5:.8)))),borderColor:cv('gold'),backgroundColor:cv('gold')+'33',borderWidth:2,pointBackgroundColor:cv('gold')}]};
opt={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{display:false},grid:{color:cv('line')},angleLines:{color:cv('line')},pointLabels:{font:{size:12}}}}}}
return new Chart(document.getElementById(id),{type,data,options:opt})}
const TY=[['LEDG','gold'],['Business','teal'],['English','rose'],['PageFly','sl'],['Cá nhân','ink']];
const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const CAL={d:new Date(END.getFullYear(),END.getMonth(),1),sel:iso(END),ev:null};
try{CAL.ev=JSON.parse(localStorage.getItem('ls-ev')||'null')}catch(x){}
if(!CAL.ev||!CAL.ev.length)CAL.ev=[{id:1,t:'Họp tuần LEDG',d:iso(END),tm:'09:00',ty:0,r:'w'},{id:2,t:'Học English 45 phút',d:iso(END),tm:'20:00',ty:2,r:'d'},{id:3,t:'Chốt doanh thu tháng',d:iso(END),tm:'17:30',ty:1,r:'m'}];
const sv=()=>{try{localStorage.setItem('ls-ev',JSON.stringify(CAL.ev))}catch(x){}};
function evOn(s){const d=new Date(s+'T00:00');return CAL.ev.filter(v=>{const b=new Date(v.d+'T00:00');if(d<b)return false;if(v.r=='d')return true;if(v.r=='w')return Math.round((d-b)/864e5)%7==0;if(v.r=='m')return d.getDate()==b.getDate();return v.d==s}).sort((a,b)=>a.tm>b.tm?1:-1)}
function calHtml(){const y=CAL.d.getFullYear(),m=CAL.d.getMonth(),off=(new Date(y,m,1).getDay()+6)%7,dim=new Date(y,m+1,0).getDate(),td=iso(END),tc=v=>cv(TY[v.ty][1]);let c='';
for(let i=0;i<off;i++)c+='<div class="cd e"></div>';
for(let d=1;d<=dim;d++){const s=y+'-'+pad(m+1)+'-'+pad(d),ev=evOn(s);c+=`<button class="cd${s==td?' td':''}${s==CAL.sel?' sl':''}" data-day="${s}"><b>${d}</b>${ev.slice(0,3).map(v=>`<span class="ch" style="--c:${tc(v)}">${v.tm} ${esc(v.t)}</span>`).join('')}${ev.length>3?`<small>+${ev.length-3} lịch</small>`:''}</button>`}
const sel=evOn(CAL.sel),sd=new Date(CAL.sel+'T00:00'),RP={n:'Một lần',d:'Hàng ngày',w:'Hàng tuần',m:'Hàng tháng'};
return`<div class="cal"><div class="card"><div class="cn"><h3>Tháng ${m+1}/${y}</h3><div class="seg"><button data-nav="-1" aria-label="Tháng trước">‹</button><button data-nav="0">Hôm nay</button><button data-nav="1" aria-label="Tháng sau">›</button></div></div><div class="cw">${['T2','T3','T4','T5','T6','T7','CN'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cg">${c}</div></div>
<div class="card"><h3>${sd.toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long'})}</h3>${sel.length?sel.map(v=>`<div class="row r2"><div><b>${esc(v.t)}</b><span>${v.tm} · ${TY[v.ty][0]} · ${RP[v.r]}</span></div><button class="x" data-del="${v.id}">Xoá</button></div>`).join(''):'<p class="nt">Chưa có lịch. Thêm lịch đầu tiên cho ngày này.</p>'}
<div class="fm"><input type="text" id="ct" placeholder="Tên lịch" maxlength="80"><input type="time" id="cm" value="09:00"><select id="cy">${TY.map((t,i)=>`<option value="${i}">${t[0]}</option>`).join('')}</select><select id="cr">${Object.entries(RP).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button class="bt" data-add="1">Thêm lịch</button></div></div></div>`}
$('#main').addEventListener('click',ev=>{const t=ev.target.closest('[data-day],[data-nav],[data-del],[data-add]');if(!t||cur!='cal')return;
if(t.dataset.day)CAL.sel=t.dataset.day;
else if(t.dataset.nav!=null){const n=+t.dataset.nav;CAL.d=n?new Date(CAL.d.getFullYear(),CAL.d.getMonth()+n,1):new Date(END.getFullYear(),END.getMonth(),1);if(!n)CAL.sel=iso(END)}
else if(t.dataset.del){CAL.ev=CAL.ev.filter(v=>v.id!=t.dataset.del);sv()}
else{const T=$('#ct').value.trim();if(!T){$('#ct').focus();return}CAL.ev.push({id:Date.now(),t:T,d:CAL.sel,tm:$('#cm').value||'09:00',ty:+$('#cy').value,r:$('#cr').value});sv()}
render()});
function render(){
CH.forEach(c=>c.destroy());CH=[];
const p=PG[cur],[s,e]=rng(),D=Chart.defaults,hr=new Date().getHours();
D.font.family='Manrope,sans-serif';D.color=cv('mut');D.animation=RM?false:{duration:900,easing:'easeOutQuart'};
Object.assign(D.plugins.tooltip,{backgroundColor:cv('card'),titleColor:cv('ink'),bodyColor:cv('mut'),borderColor:cv('line'),borderWidth:1,padding:12,boxPadding:5,cornerRadius:10});
D.plugins.legend.labels.usePointStyle=true;
const title=cur=='stats'?(hr<11?'Chào buổi sáng':hr<18?'Chào buổi chiều':'Chào buổi tối'):p.n;
let h=`<header><h1>${title}</h1><p>${p.d}</p></header>`;
if(cur=='cal'){h+=calHtml()}else if(cur=='acc'){const tot=ACC.reduce((a,x)=>a+x[2],0);
h+=`<div class="g" style="margin-top:26px"><div class="card s2"><h3>Số dư các tài khoản</h3><div class="tot"><b data-v="${tot}" data-d="1">0</b><i>tr đ</i></div>${ACC.map(a=>`<div class="row"><div><b>${a[0]}</b><span>${a[1]}</span></div><div class="bar"><u style="width:${a[2]/tot*100}%"></u></div><em>${nf(a[2],1)} tr</em></div>`).join('')}</div>
<div class="card"><h3>Kết nối Google Sheet</h3>${['LEDG','Business','English','PageFly','Cá nhân','Tài chính'].map(n=>`<div class="row r2"><div><b>${n}</b><span>Tab “${n}”</span></div><span class="pill">Dữ liệu mẫu</span></div>`).join('')}<p class="nt">Mỗi mảng đọc từ một tab riêng. Hiện đang hiển thị dữ liệu mẫu.</p></div></div>`}
else{
const seg=[['7','7 ngày'],['30','30 ngày'],['90','90 ngày'],['wk','Tuần'],['mo','Tháng'],['rg','Tuỳ chọn']],len=e-s+1;
const ex=F.m=='wk'?`<select data-f="wk" aria-label="Chọn tuần">${WK.map((w,i)=>`<option value="${i}" ${i==F.wk?'selected':''}>${w.l}</option>`).join('')}</select>`:F.m=='mo'?`<select data-f="mo" aria-label="Chọn tháng">${MO.map((w,i)=>`<option value="${i}" ${i==F.mo?'selected':''}>${w.l}</option>`).join('')}</select>`:F.m=='rg'?`<input type="date" data-f="a" value="${F.a}" min="${iso(dates[0])}" max="${iso(dates[N-1])}"><input type="date" data-f="b" value="${F.b}" min="${iso(dates[0])}" max="${iso(dates[N-1])}">`:'';
h+=`<div class="fb"><div class="seg">${seg.map(([m,l])=>`<button data-m="${m}" class="${F.m==m?'on':''}">${l}</button>`).join('')}</div>${ex}<span class="rt">${fd(dates[s])} – ${fd(dates[e])}/${dates[e].getFullYear()} · ${len} ngày${len>45?' · gộp theo tuần':''}</span></div>`;
h+=`<div class="k">${p.k.map(k=>kpi(k,s,e)).join('')}</div><div class="g">${p.c.map((c,i)=>`<div class="card ${c.s==2?'s2':c.s==3?'s3':''}"><h3>${c.h}</h3>${c.t=='heat'?`<div class="hm">${heat(s,e)}</div>`:`<div class="cv"><canvas id="c${i}"></canvas></div>`}</div>`).join('')}</div>`}
$('#main').innerHTML=h;cu();
if(cur!='acc'&&cur!='cal')p.c.forEach((c,i)=>{if(c.t!='heat')CH.push(chart('c'+i,c,s,e))})}
$('#nav').innerHTML=Object.keys(PG).map(k=>`<button class="nv ${k==cur?'on':''}" data-p="${k}" title="${PG[k].n}"><svg viewBox="0 0 24 24">${I[k]}</svg><span>${PG[k].n}</span></button>`).join('');
$('#nav').onclick=ev=>{const b=ev.target.closest('[data-p]');if(!b)return;cur=b.dataset.p;document.querySelectorAll('.nv').forEach(n=>n.classList.toggle('on',n==b));scrollTo(0,0);render()};
$('#main').onclick=ev=>{const b=ev.target.closest('[data-m]');if(b){F.m=b.dataset.m;render()}};
$('#main').onchange=ev=>{const f=ev.target.dataset.f;if(!f||!ev.target.value)return;F[f]=f=='a'||f=='b'?ev.target.value:+ev.target.value;render()};
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>render());else render();
