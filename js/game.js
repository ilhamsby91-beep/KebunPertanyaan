const $=id=>document.getElementById(id);
const uiArt=(file,alt="",className="inline-art")=>`<img class="${className}" src="assets/ui/${file}" alt="${alt}" aria-hidden="${alt?"false":"true"}">`;
const SAVE_KEY="penjaga-kebun-v3";
const SUBJECT_ORDER=["mtk","bing","ips","ipa","bindo"];
const ROW_COUNT=5, PLANTS_PER_ROW=7, DAY_SECONDS=300, PERIOD_SECONDS=100;
const WATER_INTERVAL=30;
const DAILY_TARGET=250;
const CROPS=[
 {id:"padi",name:"Padi",image:"padi.png",price:2,harvest:25,unlock:1,growthSeconds:10,description:"Tanaman pangan utama."},
 {id:"pisang",name:"Pisang",image:"pisang.png",price:5,harvest:50,unlock:1,growthSeconds:15,description:"Buah manis yang mudah tumbuh."},
 {id:"jagung",name:"Jagung",image:"jagung.png",price:8,harvest:80,unlock:1,growthSeconds:20,description:"Tongkol jagung segar."},
 {id:"wortel",name:"Wortel",image:"wortel.png",price:10,harvest:110,unlock:1,growthSeconds:25,description:"Sayuran akar kaya warna."},
 {id:"stroberi",name:"Stroberi",image:"stroberi.png",price:15,harvest:160,unlock:1,growthSeconds:30,description:"Buah merah dari kebun."},
 {id:"anggur",name:"Anggur",image:"anggur.png",price:18,harvest:220,unlock:1,growthSeconds:35,description:"Buah manis bernilai tinggi."},
 {id:"durian",name:"Durian",image:"durian.png",price:20,harvest:300,unlock:1,growthSeconds:40,description:"Buah istimewa dengan hasil panen tinggi."}
];
const LEVELS=[
 {id:1,grade:4,name:"Awal Kedatangan",desc:"Mengenal awal masa penjajahan"},
 {id:2,grade:4,name:"Monopoli Perdagangan",desc:"Mengenal penguasaan perdagangan"},
 {id:3,grade:5,name:"Perlawanan Daerah",desc:"Mengenal perjuangan rakyat"},
 {id:4,grade:5,name:"Tanam Paksa",desc:"Memahami kebijakan kolonial"},
 {id:5,grade:6,name:"Kebangkitan Nasional",desc:"Mengenal tumbuhnya persatuan"},
 {id:6,grade:6,name:"Menuju Kemerdekaan",desc:"Menelusuri akhir masa penjajahan"}
];
const GROWTH_INTERVAL_MS=1000;
const COSTUMES=[
 {id:"default",name:"Petani Pemula",price:0,file:"default.png"},
 {id:"kostum-1",name:"Kostum 1",price:10,file:"kostum-1.png"},
 {id:"kostum-2",name:"Kostum 2",price:20,file:"kostum-2.png"},
 {id:"kostum-3",name:"Kostum 3",price:30,file:"kostum-3.png"}
];
const DAILY_MISSION_DEFS=[
 {id:"water",title:"Siram tanaman 5 kali",goal:5,reward:{coins:20,stars:0},icon:"water-drop.svg"},
 {id:"answer",title:"Jawab 5 pertanyaan",goal:5,reward:{coins:0,stars:2},icon:"book.svg"},
 {id:"harvest",title:"Panen 2 tanaman",goal:2,reward:{coins:30,stars:0},icon:"basket.svg"}
];
function localDateKey(){
 const d=new Date();
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function ensureDailyMissions(){
 const today=localDateKey();
 if(!save.dailyMissions||save.dailyMissions.date!==today){
  save.dailyMissions={date:today,progress:{water:0,answer:0,harvest:0},claimed:[]};
 }
 if(!save.dailyMissions.progress)save.dailyMissions.progress={water:0,answer:0,harvest:0};
 if(!Array.isArray(save.dailyMissions.claimed))save.dailyMissions.claimed=[];
}
function renderDailyMissions(){
 const host=$("daily-missions");if(!host)return;
 ensureDailyMissions();
 const m=save.dailyMissions;
 const completed=DAILY_MISSION_DEFS.filter(x=>m.progress[x.id]>=x.goal).length;
 $("daily-date-label").textContent="Selesaikan dan klaim hadiah";
 $("daily-completed-count").textContent=`${completed}/3 selesai`;
 host.innerHTML=DAILY_MISSION_DEFS.map(x=>{
  const count=Math.min(m.progress[x.id]||0,x.goal),done=count>=x.goal,claimed=m.claimed.includes(x.id);
  const reward=x.reward.coins?`${uiArt("coin.svg")} ${x.reward.coins} koin`:`${uiArt("star.svg")} ${x.reward.stars} poin`;
  const button=claimed?'<button class="daily-claim claimed" disabled>Sudah diklaim</button>':done?`<button class="daily-claim" data-claim-mission="${x.id}">Klaim hadiah</button>`:'<button class="daily-claim" disabled>Belum selesai</button>';
  return `<article class="daily-mission"><img class="daily-mission-icon" src="assets/ui/${x.icon}" alt=""><div class="daily-mission-info"><b>${x.title}</b><small>${count}/${x.goal} · Hadiah ${reward}</small><div class="daily-mission-bar"><i style="width:${count/x.goal*100}%"></i></div></div>${button}</article>`;
 }).join("");
}
function recordDailyMission(id,amount=1){
 ensureDailyMissions();
 const def=DAILY_MISSION_DEFS.find(x=>x.id===id);if(!def)return;
 save.dailyMissions.progress[id]=Math.min(def.goal,(save.dailyMissions.progress[id]||0)+amount);
 renderDailyMissions();
}
function claimDailyMission(id){
 ensureDailyMissions();
 const def=DAILY_MISSION_DEFS.find(x=>x.id===id),m=save.dailyMissions;
 if(!def||m.claimed.includes(id)||(m.progress[id]||0)<def.goal)return;
 m.claimed.push(id);save.coins+=def.reward.coins;save.stars+=def.reward.stars;
 persist();renderDailyMissions();
}
const PERIODS=[
 {name:"Pagi",key:"morning",icon:"sunrise.svg",tip:"Embun pagi menyegarkan kebun. Saatnya mulai merawat tanaman."},
 {name:"Siang",key:"noon",icon:"sun.svg",tip:"Matahari siang membantu tanaman tumbuh lebih cepat."},
 {name:"Malam",key:"night",icon:"moon.svg",tip:"Malam tiba. Tetap perhatikan tanaman sebelum hari berganti."}
];
let growthLoop=null,save=loadSave(),game=null,usedQuestions=new Set(),activeRow=null,activeQuestion=null;
function loadSave(){
 try{
  const d=Object.assign({unlocked:1,completed:[],coins:0,stars:0,ownedSeeds:["padi"],selectedSeed:"padi",fertilizer:0,premiumFertilizer:0,autoWater:0,ownedCostumes:["default"],selectedCostume:"default"},JSON.parse(localStorage.getItem(SAVE_KEY)||localStorage.getItem("penjaga-kebun-v2")||"{}"));
  ["completed","ownedSeeds","ownedCostumes"].forEach(k=>{if(!Array.isArray(d[k]))d[k]=[];});
  if(!d.ownedSeeds.includes("padi"))d.ownedSeeds.unshift("padi");
  if(!d.ownedCostumes.includes("default"))d.ownedCostumes.unshift("default");
  if(!d.dailyMissions)d.dailyMissions=null;
  d.fertilizer=Math.max(0,Number(d.fertilizer)||0);
  d.premiumFertilizer=Math.max(0,Number(d.premiumFertilizer)||0);
  d.autoWater=Math.max(0,Number(d.autoWater)||0);
  if(!CROPS.some(c=>c.id===d.selectedSeed)||!d.ownedSeeds.includes(d.selectedSeed))d.selectedSeed="padi";
  if(!COSTUMES.some(c=>c.id===d.selectedCostume)||!d.ownedCostumes.includes(d.selectedCostume))d.selectedCostume="default";
  return d;
 }catch{return {unlocked:1,completed:[],coins:0,stars:0,ownedSeeds:["padi"],selectedSeed:"padi",fertilizer:0,premiumFertilizer:0,autoWater:0,ownedCostumes:["default"],selectedCostume:"default"}}
}
function persist(){ensureDailyMissions();localStorage.setItem(SAVE_KEY,JSON.stringify(save));ensureDailyMissions();renderLevels();renderSeedShop();renderProfile();updateTop();renderDailyMissions();}
function updateTop(){
 $("coin-count").textContent=save.coins;$("star-count").textContent=save.stars;
 if($("shop-coins"))$("shop-coins").textContent=save.coins;
 if($("fertilizer-count"))$("fertilizer-count").textContent=save.fertilizer;
 if($("auto-water-count"))$("auto-water-count").textContent=save.autoWater;
 if($("premium-fertilizer-count"))$("premium-fertilizer-count").textContent=save.premiumFertilizer;
 if($("fertilizer-shop-count"))$("fertilizer-shop-count").textContent=save.fertilizer;
 if($("premium-fertilizer-shop-count"))$("premium-fertilizer-shop-count").textContent=save.premiumFertilizer;
 if($("auto-water-shop-count"))$("auto-water-shop-count").textContent=save.autoWater;
}
function renderSeedShop(){
 if(!$("seed-list"))return;
 $("seed-list").innerHTML=CROPS.map(c=>{
  const owned=save.ownedSeeds.includes(c.id),unlocked=save.unlocked>=c.unlock,selected=save.selectedSeed===c.id;
  const image=`assets/seeds/${c.id}.png`;
  const action=owned?"Pilih bibit":unlocked?`Beli · ${c.price} koin`:`Terbuka di Level ${c.unlock}`;
  return `<article class="seed-card ${selected?"selected":""} ${!unlocked?"locked":""}"><div class="seed-art"><img src="${image}" alt="${c.name}" onerror="this.src='assets/ui/seedling.png'"></div><div class="seed-card-body"><div class="seed-card-title"><b>${c.name}</b>${selected?'<span class="seed-tag">Dipilih</span>':owned?'<span class="seed-tag owned">Dimiliki</span>':''}</div><p>${c.description}</p><div class="seed-values"><span>${uiArt("seedling.png")} Harga ${c.price} koin</span><span>${uiArt("clock.svg")} Tumbuh ${c.growthSeconds} detik</span><strong>${uiArt("basket.svg")} Panen ${c.harvest} koin</strong></div><button class="seed-action ${owned?"choose":""}" data-seed="${c.id}" ${!unlocked?"disabled":""}>${action}</button></div></article>`;
 }).join("");
 $("selected-seed-name").textContent=(CROPS.find(c=>c.id===save.selectedSeed)||CROPS[0]).name+" · klik petak kosong";
}
function buyOrSelectSeed(id){
 const c=CROPS.find(x=>x.id===id);if(!c||save.unlocked<c.unlock)return;
 if(save.ownedSeeds.includes(id)){save.selectedSeed=id;persist();if(game){renderGarden();renderGameProgress();}return;}
 if(save.coins<c.price){alert("Koin belum cukup untuk membeli bibit ini.");return;}
 save.coins-=c.price;save.ownedSeeds.push(id);save.selectedSeed=id;persist();if(game){renderGarden();renderGameProgress();}
}
function renderLevels(){
 $("level-list").innerHTML=LEVELS.map(l=>{const done=save.completed.includes(l.id),open=l.id<=save.unlocked;return `<button class="level-card ${done?"done":open?"open":"locked"}" data-level="${l.id}" ${open?"":"disabled"}><span class="level-icon"><img src="assets/ui/${done?"trophy.svg":open?"seedling.png":"lock.svg"}" alt=""></span><b>Level ${l.id}</b><small>Kelas ${l.grade}</small><small>${done?"Selesai":open?l.name:"Selesaikan level sebelumnya"}</small></button>`;}).join("");
}
function newLevel(id){
 game={level:LEVELS.find(x=>x.id===id),day:1,dayElapsed:0,periodIndex:0,dayPoints:0,rows:Array.from({length:ROW_COUNT},(_,i)=>({id:i,cropId:null,planted:false,progress:0,waterElapsed:0,harvests:0,growthElapsed:0,needsWater:false})),harvests:0,coins:0,completed:false,rainActive:false,rainCooldown:35+Math.random()*40};
 usedQuestions=new Set();startDay();
}
function startDay(){
 game.dayElapsed=0;game.periodIndex=0;game.dayPoints=0;
 game.rows.forEach(r=>{if(r.planted&&r.progress<100){r.waterElapsed=WATER_INTERVAL;r.needsWater=true;}else{r.needsWater=false;}});
 updatePeriod();renderGarden();renderGameProgress();updateDayTimer();
 if(!growthLoop)growthLoop=setInterval(tickGame,1000);
}
function updatePeriod(){
 const period=PERIODS[game.periodIndex],scene=$("scene");
 scene.className=`scene time-${period.key} day-${game.day}`;
 scene.dataset.time=period.key;scene.dataset.day=String(game.day);scene.dataset.period=String(game.periodIndex);
 $("scene-sky-icon").src=`assets/ui/${period.icon}`;
 $("level-label").textContent=`BABAK ${game.level.id} · KELAS ${game.level.grade}`;
 $("session-label").textContent=`Hari ${game.day} · ${period.name}`;
 $("scene-tip").textContent=period.tip;
}
function updateDayTimer(){
 const left=Math.max(0,DAY_SECONDS-game.dayElapsed);
 $("day-timer-value").textContent=`${String(Math.floor(left/60)).padStart(2,"0")}:${String(left%60).padStart(2,"0")}`;
 $("day-progress").style.width=(left/DAY_SECONDS*100)+"%";
}
function renderGarden(){
 if(!game)return;
 $("rows").innerHTML=game.rows.map((r,i)=>{
  if(!r.planted){
   const plots=Array.from({length:PLANTS_PER_ROW},(_,p)=>`<button type="button" class="plant empty-plot" data-plant-row="${i}" data-plot="${p}" aria-label="Tanam bibit di baris ${i+1}, petak ${p+1}" title="Tanam di baris ${i+1}"><span class="sr-only">Pilih petak ini</span></button>`).join("");
   return `<div class="plant-row empty-row"><div class="row-name">Baris ${i+1}<small>Petak kosong · 7 petak tersedia</small><div class="row-meter"><i style="width:0%"></i></div><small class="growth-timer">Menunggu bibit ditanam</small></div><div class="plants" aria-label="Tujuh petak kosong">${plots}</div><div class="row-actions"><span class="empty-row-hint">Belum ditanami</span></div></div>`;
  }
  const crop=CROPS.find(c=>c.id===r.cropId)||CROPS[0];
  const stage=r.progress>=100?3:r.progress>=65?2:r.progress>=30?1:0;
  const assetKey=stage===0?"stage-1":stage===1?"stage-2":stage===2?"stage-3":"harvest";
  const img=`assets/plants/${crop.id}/${assetKey}.png`;
  const plants=Array.from({length:PLANTS_PER_ROW},()=>`<span class="plant"><img src="${img}" alt="${crop.name}" onerror="this.src='assets/plants/${crop.id}/art.png'"></span>`).join("");
  const ready=r.progress>=100,remainingWater=Math.max(0,WATER_INTERVAL-r.waterElapsed);
  const remainingGrowth=Math.max(0,Math.ceil(crop.growthSeconds-r.growthElapsed));
  const status=ready?"Siap dipanen sekarang!":r.needsWater?`Perlu disiram · tumbuh ${remainingGrowth} detik lagi`:`Siram lagi ${remainingWater} detik · tumbuh ${remainingGrowth} detik lagi`;
  let actions="";
  if(ready){actions=`<button class="harvest-btn" data-harvest="${i}">${uiArt("basket.svg")} Panen sekarang</button>`;}
  else{
   actions=`${r.needsWater?`<button class="water-btn" data-row="${i}">${uiArt("water-drop.svg")} Siram & jawab</button>`:`<button class="water-btn" disabled>${uiArt("clock.svg")} Menunggu air</button>`}
    ${save.autoWater>0&&r.needsWater?`<button class="auto-water-btn" data-auto="${i}">${uiArt("watering-can.svg")} Pakai penyiram (${save.autoWater})</button>`:""}
    ${save.fertilizer>0?`<button class="fertilizer-btn" data-fertilizer="${i}">${uiArt("fertilizer.svg")} Pupuk biasa (${save.fertilizer})</button>`:""}
    ${save.premiumFertilizer>0?`<button class="premium-fertilizer-btn" data-premium-fertilizer="${i}">${uiArt("fertilizer-premium.svg")} Pupuk premium (${save.premiumFertilizer})</button>`:""}`;
  }
  return `<div class="plant-row ${ready?"ready":""}"><div class="row-name">Baris ${i+1}<small>${crop.name} · ${Math.floor(r.progress)}% · ${r.harvests} panen</small><div class="row-meter"><i style="width:${r.progress}%"></i></div><small class="growth-timer">${status}</small></div><div class="plants" aria-label="Tujuh tanaman ${crop.name}">${plants}</div><div class="row-actions">${actions}</div></div>`;
 }).join("");
 const needsWater=game.rows.filter(r=>r.planted&&r.needsWater&&r.progress<100).length;
 const emptyRows=game.rows.filter(r=>!r.planted).length;
 $("session-progress").textContent=`${needsWater} baris membutuhkan air · ${emptyRows} baris kosong`;
}
function renderGameProgress(){
 if(!game)return;
 $("progress-label").textContent=`${game.harvests} panen`;
 $("level-progress").style.width=Math.min(100,game.harvests/5*100)+"%";
 $("game-coins").textContent=save.coins;
 renderDailyMissions();
}
function plantRow(index){
 if(!game)return;
 const row=game.rows[index];if(!row||row.planted)return;
 const crop=CROPS.find(c=>c.id===save.selectedSeed);
 if(!crop||!save.ownedSeeds.includes(crop.id)){alert("Pilih atau beli bibit terlebih dahulu.");return;}
 row.cropId=crop.id;row.planted=true;row.progress=0;row.growthElapsed=0;
 row.waterElapsed=WATER_INTERVAL;row.needsWater=true;
 renderGarden();renderSeedShop();persist();
}
function applyGrowth(row,percentage){
 if(!row?.planted||row.progress>=100)return;
 const crop=CROPS.find(c=>c.id===row.cropId)||CROPS[0];
 row.progress=Math.min(100,row.progress+percentage);
 row.growthElapsed=(row.progress/100)*crop.growthSeconds;
 if(row.progress>=100)row.needsWater=false;
}
function harvestRow(index){
 const row=game?.rows[index];if(!row||!row.planted||row.progress<100)return;
 const crop=CROPS.find(c=>c.id===row.cropId)||CROPS[0];
 row.harvests++;game.harvests++;recordDailyMission("harvest");
 save.coins+=crop.harvest;game.coins+=crop.harvest;
 row.cropId=null;row.planted=false;row.progress=0;row.growthElapsed=0;row.waterElapsed=0;row.needsWater=false;
 renderGarden();renderGameProgress();persist();
}
function chooseQuestion(row){
 const q=getQuestion(game.level.grade,SUBJECT_ORDER[Math.floor(Math.random()*SUBJECT_ORDER.length)],usedQuestions);
 activeRow=row;activeQuestion=q;
 const meta=SUBJECTS.find(s=>s.id===q.subject)||SUBJECTS.find(s=>s.id===SUBJECT_ORDER[0]);
 $("question-subject").textContent=meta.name.toUpperCase()+" · KELAS "+game.level.grade;
 $("question-title").textContent="Jawab pertanyaan untuk menyiram!";
 $("question-text").textContent=q.question;$("answer-feedback").textContent="";$("answer-feedback").className="feedback";
 $("question-continue").hidden=true;
 $("answer-list").innerHTML=q.options.map((o,i)=>`<button class="answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join("");
 $("question-modal").hidden=false;
}
function awardRandomReward(){
 const reward=Math.floor(Math.random()*3);
 if(reward===0){const amount=5+Math.floor(Math.random()*6);save.coins+=amount;game.coins+=amount;return `Bonus ${amount} koin`;}
 if(reward===1){save.fertilizer++;return "1 pupuk";}
 save.autoWater++;return "1 petak penyiraman otomatis";
}
function waterRow(index,byQuestion=false){
 const row=game?.rows[index];if(!row||!row.planted||!row.needsWater||row.progress>=100)return;
 row.needsWater=false;row.waterElapsed=0;recordDailyMission("water");applyGrowth(row,12);
 if(byQuestion){
  save.coins+=5;game.coins+=5;game.dayPoints+=15;
  const bonus=awardRandomReward();$("answer-feedback").innerHTML+=`<br><b>Hadiah: ${uiArt("coin.svg")} 5 koin + ${escapeHtml(bonus)}</b>`;
 }
 renderGarden();renderGameProgress();persist();
}
function answerQuestion(index){
 if(!activeQuestion||!game)return;
 const q=activeQuestion,correct=index===q.answer;
 recordDailyMission("answer");
 document.querySelectorAll(".answer").forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add("correct");else if(i===index)b.classList.add("incorrect");});
 const feedback=$("answer-feedback");
 feedback.className="feedback "+(correct?"good":"try");
 feedback.innerHTML=correct?`Jawaban benar! Tanaman mendapat pertumbuhan tambahan.<br><small>${escapeHtml(q.explanation||"Terus belajar dan rawat kebunmu!")}</small>`:`Belum tepat, tetapi tanaman tetap disiram.<br><small>${escapeHtml(q.explanation||"Terus belajar dan rawat kebunmu!")}</small>`;
 const row=game.rows[activeRow];
 waterRow(activeRow,true);
 if(correct){applyGrowth(row,15);save.stars+=1;game.dayPoints+=10;}
 else game.dayPoints+=5;
 renderGarden();renderGameProgress();persist();
 $("question-continue").hidden=false;$("question-continue").textContent="Kembali ke kebun";
}
function useAutoWater(index){
 const row=game?.rows[index];
 if(save.autoWater<=0||!row?.planted||!row.needsWater||row.progress>=100)return;
 save.autoWater--;waterRow(index,false);
}
function useFertilizer(index){
 const row=game?.rows[index];if(save.fertilizer<=0||!row?.planted||row.progress>=100)return;
 save.fertilizer--;applyGrowth(row,25);renderGarden();renderGameProgress();persist();
}
function usePremiumFertilizer(index){
 const row=game?.rows[index];if(save.premiumFertilizer<=0||!row?.planted||row.progress>=100)return;
 save.premiumFertilizer--;applyGrowth(row,50);renderGarden();renderGameProgress();persist();
}
function tickGame(){
 if(!game||$("screen-game").hidden||!$("question-modal").hidden)return;
 game.dayElapsed++;game.periodIndex=Math.min(2,Math.floor(game.dayElapsed/PERIOD_SECONDS));
 if(game.periodIndex!==Number($("scene").dataset.period||0)){$("scene").dataset.period=String(game.periodIndex);updatePeriod();}
 game.rows.forEach(row=>{
  if(!row.planted||row.progress>=100)return;
  if(row.needsWater)return;
  const crop=CROPS.find(c=>c.id===row.cropId)||CROPS[0];
  const speed=game.periodIndex===1?2:1;
  row.growthElapsed=Math.min(crop.growthSeconds,row.growthElapsed+speed);
  row.progress=Math.min(100,(row.growthElapsed/crop.growthSeconds)*100);
  if(row.progress>=100){row.needsWater=false;row.waterElapsed=0;}
  else{row.waterElapsed++;if(row.waterElapsed>=WATER_INTERVAL)row.needsWater=true;}
 });
 game.rainCooldown--;
 if(game.rainCooldown<=0&&!game.rainActive){
  game.rainActive=true;game.rainCooldown=55+Math.floor(Math.random()*65);
  game.rows.forEach(row=>{if(!row.planted||row.progress>=100)return;row.needsWater=false;row.waterElapsed=0;applyGrowth(row,8);});
  $("weather-notice").hidden=false;$("weather-notice").innerHTML=`${uiArt("rain.svg")} Hujan turun! Semua tanaman tersiram otomatis.`;
  setTimeout(()=>{if($("weather-notice"))$("weather-notice").hidden=true;},4500);game.rainActive=false;
 }
 renderGarden();renderGameProgress();if(game.dayElapsed%5===0)persist();updateDayTimer();
 if(game.dayElapsed>=DAY_SECONDS)endDay();
}
function endDay(){
 if(game.day===1){game.day=2;startDay();}
 else finishLevel();
}
function finishLevel(){
 const passed=game.harvests>=5,bonus=passed?100:30;
 save.coins+=bonus;game.coins+=bonus;
 if(!save.completed.includes(game.level.id))save.completed.push(game.level.id);
 save.unlocked=Math.max(save.unlocked,Math.min(6,game.level.id+1));save.stars+=passed?3:1;
 persist();
 $("result-image").src=passed?"assets/ui/trophy.svg":"assets/ui/seedling.png";$("result-title").textContent=passed?"Kebun berhasil dirawat!":"Dua hari di kebun selesai!";
 $("result-text").textContent=`Kamu menyelesaikan 2 hari pada babak ${game.level.id}. Total panen: ${game.harvests}.`;
 $("result-rewards").innerHTML=`${uiArt("coin.svg")} Bonus ${bonus} koin · ${uiArt("basket.svg")} ${game.harvests} panen · ${uiArt("star.svg")} ${save.stars} poin`;
 $("result-button").textContent=game.level.id<6?"Lanjut ke level berikutnya":"Kembali ke halaman utama";
 $("level-modal").hidden=false;
 $("result-button").onclick=()=>{$("level-modal").hidden=true;if(game.level.id<6)newLevel(game.level.id+1);else{game=null;showHomeScreen();}};
}
function renderProfile(){
 const current=COSTUMES.find(c=>c.id===save.selectedCostume)||COSTUMES[0];
 const img=$("profile-avatar"),modalImg=$("profile-modal-avatar");
 if(img){img.onerror=()=>{img.onerror=null;img.src="assets/profile-costumes/default.png";};img.src=`assets/profile-costumes/${current.file}`;}
 if(modalImg){modalImg.onerror=()=>{modalImg.onerror=null;modalImg.src="assets/profile-costumes/default.png";};modalImg.src=`assets/profile-costumes/${current.file}`;}
 if(!$("costume-list"))return;
 $("costume-list").innerHTML=COSTUMES.map(c=>{
  const owned=save.ownedCostumes.includes(c.id),selected=save.selectedCostume===c.id;
  return `<article class="costume-card"><div class="costume-preview"><img src="assets/profile-costumes/${c.file}" alt="${c.name}" onerror="this.src='assets/ui/seedling.png'"></div><b>${c.name}</b><small>${c.price===0?"Gratis":`${uiArt("star.svg")} ${c.price} poin`}</small><button class="btn ${selected?"light":"primary"} small" data-costume="${c.id}" ${selected?"disabled":""}>${selected?"Dipakai":owned?"Pakai": "Beli"}</button></article>`;
 }).join("");
 $("profile-points").textContent=save.stars;
}
function handleCostume(id){
 const c=COSTUMES.find(x=>x.id===id);if(!c)return;
 if(save.ownedCostumes.includes(id)){save.selectedCostume=id;persist();return;}
 if(save.stars<c.price){alert("Poin belum cukup untuk membeli kostum.");return;}
 save.stars-=c.price;save.ownedCostumes.push(id);save.selectedCostume=id;persist();
}
function startLevel(id){if(id>save.unlocked)return;$("screen-home").hidden=true;$("screen-game").hidden=false;newLevel(id);}
function showGameScreen(){$("screen-home").hidden=true;$("screen-game").hidden=false;if(game){renderGarden();renderGameProgress();}}
function showHomeScreen(){$("screen-game").hidden=true;$("screen-home").hidden=false;$("start-btn").textContent=game?"Lanjutkan kebun":"Mulai bermain";renderSeedShop();renderLevels();renderProfile();}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
$("start-btn").addEventListener("click",()=>game?showGameScreen():startLevel(save.unlocked));
$("seed-list").addEventListener("click",e=>{const b=e.target.closest("[data-seed]");if(b)buyOrSelectSeed(b.dataset.seed);});
$("level-list").addEventListener("click",e=>{const b=e.target.closest("[data-level]");if(b)startLevel(Number(b.dataset.level));});
$("rows").addEventListener("click",e=>{
 const plot=e.target.closest("[data-plant-row]"),h=e.target.closest("[data-harvest]"),b=e.target.closest("[data-row]"),a=e.target.closest("[data-auto]"),f=e.target.closest("[data-fertilizer]"),pf=e.target.closest("[data-premium-fertilizer]");
 if(plot){plantRow(Number(plot.dataset.plantRow));return;}
 if(h){harvestRow(Number(h.dataset.harvest));return;}
 if(a){useAutoWater(Number(a.dataset.auto));return;}
 if(f){useFertilizer(Number(f.dataset.fertilizer));return;}
 if(pf){usePremiumFertilizer(Number(pf.dataset.premiumFertilizer));return;}
 if(b){const i=Number(b.dataset.row);if(game.rows[i]?.needsWater)chooseQuestion(i);}
});
$("answer-list").addEventListener("click",e=>{const b=e.target.closest("[data-answer]");if(b)answerQuestion(Number(b.dataset.answer));});
$("question-continue").addEventListener("click",()=>{$("question-modal").hidden=true;activeQuestion=null;});
$("close-question").addEventListener("click",()=>{$("question-modal").hidden=true;});
$("home-btn").addEventListener("click",()=>{showHomeScreen();});
$("buy-fertilizer").addEventListener("click",()=>{if(save.coins<8){alert("Koin belum cukup.");return;}save.coins-=8;save.fertilizer++;persist();if(game){renderGarden();renderGameProgress();}});
$("buy-premium-fertilizer").addEventListener("click",()=>{if(save.coins<15){alert("Koin belum cukup.");return;}save.coins-=15;save.premiumFertilizer++;persist();if(game){renderGarden();renderGameProgress();}});
$("buy-auto-water").addEventListener("click",()=>{if(save.coins<15){alert("Koin belum cukup.");return;}save.coins-=15;save.autoWater++;persist();if(game){renderGarden();renderGameProgress();}});
$("costume-list").addEventListener("click",e=>{const b=e.target.closest("[data-costume]");if(b)handleCostume(b.dataset.costume);});
$("daily-missions").addEventListener("click",e=>{const b=e.target.closest("[data-claim-mission]");if(b)claimDailyMission(b.dataset.claimMission);});
$("open-profile").addEventListener("click",()=>{$("profile-modal").hidden=false;renderProfile();});
$("close-profile").addEventListener("click",()=>{$("profile-modal").hidden=true;});
renderLevels();renderSeedShop();renderProfile();updateTop();
