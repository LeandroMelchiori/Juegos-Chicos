(function(){
  "use strict";
  var $=function(s){return document.querySelector(s);};

  // localStorage a prueba de balas (file://, modo privado, etc.)
  var mem={};
  function safeGet(k){try{return localStorage.getItem(k);}catch(e){return mem[k]||null;}}
  function safeSet(k,v){try{localStorage.setItem(k,v);}catch(e){mem[k]=String(v);}}

  var STORAGE_KEY="mateArcadeDataV2";
  var DEFAULT_OPS=["add","sub","mul","div","pow","root","mlt","dvs","mcd","mcm"];
  function blankProgress(){
    return {best:0,total:0,correct:0,sessions:0,practiceSessions:0,reviewSessions:0,bestCombo:0,byOp:{},studyByOp:{},unlocked:[],
      preferences:{mode:"arcade",answerMode:"mixed",rounds:10,sound:true,vibration:true,contrast:false,motion:false,largeText:false,calm:false},
      ops:DEFAULT_OPS.slice(),
      diffByOp:{add:"normal",sub:"normal",mul:"normal",div:"normal",pow:"normal",root:"normal",mlt:"normal",dvs:"normal",mcd:"normal",mcm:"normal"}};
  }
  function loadStore(){
    var raw=safeGet(STORAGE_KEY),data;
    try{data=raw?JSON.parse(raw):null;}catch(e){data=null;}
    if(!data||!data.profiles) data={version:4,active:"Jugador",profiles:{Jugador:blankProgress()}};
    data.version=4;
    if(!data.profiles[data.active]) data.active=Object.keys(data.profiles)[0]||"Jugador";
    if(!data.profiles[data.active]) data.profiles[data.active]=blankProgress();
    return data;
  }
  var store=loadStore();
  function activeProfile(){
    var p=store.profiles[store.active];
    if(!p||typeof p!=="object"){p=blankProgress();store.profiles[store.active]=p;}
    var fresh=blankProgress(),k;
    for(k in fresh) if(p[k]===undefined) p[k]=fresh[k];
    if(!Array.isArray(p.ops))p.ops=fresh.ops.slice();
    p.ops=p.ops.filter(function(op){return DEFAULT_OPS.indexOf(op)!==-1;});
    if(!p.ops.length)p.ops=fresh.ops.slice();
    if(!Array.isArray(p.unlocked))p.unlocked=[];
    if(!p.byOp||typeof p.byOp!=="object")p.byOp={};
    if(!p.studyByOp||typeof p.studyByOp!=="object")p.studyByOp={};
    if(!p.diffByOp||typeof p.diffByOp!=="object")p.diffByOp=fresh.diffByOp;
    if(!p.preferences||typeof p.preferences!=="object")p.preferences=fresh.preferences;
    ["best","total","correct","sessions","practiceSessions","reviewSessions","bestCombo"].forEach(function(key){
      p[key]=Math.max(0,Number(p[key])||0);
    });
    for(k in fresh.preferences) if(p.preferences[k]===undefined) p.preferences[k]=fresh.preferences[k];
    for(k in fresh.diffByOp) if(p.diffByOp[k]===undefined) p.diffByOp[k]=fresh.diffByOp[k];
    if([5,10,15,20].indexOf(Number(p.preferences.rounds))===-1)p.preferences.rounds=10;
    DEFAULT_OPS.forEach(function(op){
      if(["easy","normal","hard"].indexOf(p.diffByOp[op])===-1)p.diffByOp[op]="normal";
      if(p.byOp[op]){
        p.byOp[op].ok=Math.max(0,Number(p.byOp[op].ok)||0);
        p.byOp[op].fail=Math.max(0,Number(p.byOp[op].fail)||0);
        if(!Array.isArray(p.byOp[op].recent))p.byOp[op].recent=[];
        p.byOp[op].recent=p.byOp[op].recent.slice(-12).filter(function(a){return a&&typeof a==="object";});
        if(!p.byOp[op].errors||typeof p.byOp[op].errors!=="object")p.byOp[op].errors={};
      }
      if(p.studyByOp[op]){
        p.studyByOp[op].ok=Math.max(0,Number(p.studyByOp[op].ok)||0);
        p.studyByOp[op].fail=Math.max(0,Number(p.studyByOp[op].fail)||0);
        p.studyByOp[op].completed=Math.max(0,Number(p.studyByOp[op].completed)||0);
      }
    });
    return p;
  }
  function saveStore(){safeSet(STORAGE_KEY,JSON.stringify(store));}

  var profile=activeProfile();
  var state={ops:["add","sub","mul","div","pow","root","mlt","dvs","mcd","mcm"],
    diffByOp:profile.diffByOp,
    mode:profile.preferences.mode||"arcade",answerMode:profile.preferences.answerMode||"mixed",
    curDiff:"normal",stats:{},
    score:0,lives:3,combo:0,bestCombo:0,
    correct:0,answered:0,targetRounds:10,level:1,answer:0,timer:null,timeLeft:0,timeTotal:0,
    locked:false,usedHint:false,cur:null,inputKind:"choice",lastValue:null,paused:false,completed:false,
    learnReturn:"menu",toolsReturn:"menu",studyFromError:false,currentStudyOp:"add",studyTab:"understand",retryQueue:[],retryContext:null,
    lastFocus:null};

  var OPNAME={add:"Suma",sub:"Resta",mul:"Multiplicación",div:"División",pow:"Potencia",root:"Raíz",mlt:"Múltiplos",dvs:"Divisores",mcd:"Máx. común divisor",mcm:"Mín. común múltiplo"};
  var OPSYM ={add:"+",sub:"−",mul:"×",div:"÷",pow:"xⁿ",root:"√",mlt:"M",dvs:"D",mcd:"MCD",mcm:"MCM"};
  var OPORDER=["add","sub","mul","div","pow","root","mlt","dvs","mcd","mcm"];
  var ACHIEVEMENTS=[
    {id:"first",icon:"🌟",name:"Primer paso",desc:"Resolver una cuenta"},
    {id:"first10",icon:"🎯",name:"En carrera",desc:"Alcanzar 10 aciertos"},
    {id:"fifty",icon:"🚀",name:"Despegue",desc:"Alcanzar 50 aciertos"},
    {id:"hundred",icon:"🏆",name:"Centena",desc:"Alcanzar 100 aciertos"},
    {id:"combo5",icon:"⚡",name:"Racha 5",desc:"Lograr un combo de 5"},
    {id:"combo10",icon:"🔥",name:"Imparable",desc:"Lograr un combo de 10"},
    {id:"explorer",icon:"🧭",name:"Explorador",desc:"Practicar todos los temas"},
    {id:"perfect",icon:"💎",name:"Sesión perfecta",desc:"Completar una sesión sin errores"},
    {id:"practice5",icon:"📚",name:"Sin apuro",desc:"Completar 5 prácticas"},
    {id:"review5",icon:"🧠",name:"A reforzar",desc:"Completar 5 repasos"}
  ];

  var DIFF={
    easy:  {time:14,addMax:20, subMax:25, mulMax:10, powBase:9, powExps:[2],rootMax:100,factorMax:6,commonMax:4},
    normal:{time:11,addMax:100,subMax:80, mulMax:12, powBase:12,powExps:[2,2,3],rootMax:225,factorMax:9,commonMax:6},
    hard:  {time:8, addMax:500,subMax:400,mulMax:15, powBase:15,powExps:[2,3,3,4],rootMax:625,factorMax:14,commonMax:8}
  };

  // ---- sonido ----
  var soundOn=true,ac=null;
  function beep(freq,dur,type,vol){
    if(!soundOn)return;
    type=type||"sine"; vol=vol||.12;
    try{
      ac=ac||new (window.AudioContext||window.webkitAudioContext)();
      var o=ac.createOscillator(),g=ac.createGain();
      o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(vol,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);
      o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+dur);
    }catch(e){}
  }
  function sndGood(){beep(660,.08,"triangle");setTimeout(function(){beep(990,.12,"triangle");},70);}
  function sndBad(){beep(160,.25,"sawtooth",.1);}
  function sndLvl(){beep(523,.1);setTimeout(function(){beep(659,.1);},90);setTimeout(function(){beep(784,.16);},180);}
  function vibrate(p){try{if(activeProfile().preferences.vibration&&navigator.vibrate)navigator.vibrate(p);}catch(e){}}

  // ---- utilidades ----
  function ri(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
  function bump(op,key){
    if(!state.stats[op]) state.stats[op]={ok:0,fail:0};
    state.stats[op][key]++;
  }
  function recentAccuracy(s){
    var recent=(s&&s.recent)||[];
    if(!recent.length)return null;
    var weight=0,score=0;
    recent.forEach(function(a,i){var w=i+1;weight+=w;if(a.ok)score+=w;});
    return score/weight;
  }
  function evidenceFor(op){
    var s=activeProfile().byOp[op]||{ok:0,fail:0,recent:[]},total=s.ok+s.fail;
    var recent=recentAccuracy(s),historic=total?s.ok/total:.5;
    var accuracy=recent===null?historic:recent*.72+historic*.28;
    var difficulty=(s.recent||[]).slice(-6).reduce(function(sum,a){
      return sum+({easy:1,normal:2,hard:3}[a.difficulty]||1);
    },0)/Math.max(1,Math.min(6,(s.recent||[]).length));
    var confidence=Math.min(1,total/10)*Math.min(1,Math.max(.45,difficulty/2));
    return {total:total,accuracy:accuracy,confidence:confidence,lastAt:Number(s.lastAttemptAt)||0};
  }
  function masteryStatus(op){
    var e=evidenceFor(op);
    if(e.total<3)return {label:"Recién empezás",level:0};
    if(e.accuracy<.68)return {label:"Conviene practicar",level:1};
    if(e.confidence<.58||e.accuracy<.84)return {label:"Vas avanzando",level:2};
    return {label:"Lo tenés bastante claro",level:3};
  }
  function recordAttempt(op,ok,errorType){
    var p=activeProfile();
    if(!p.byOp[op])p.byOp[op]={ok:0,fail:0,recent:[],errors:{}};
    var s=p.byOp[op];
    if(!Array.isArray(s.recent))s.recent=[];
    if(!s.errors||typeof s.errors!=="object")s.errors={};
    s[ok?"ok":"fail"]++;
    s.recent.push({ok:!!ok,difficulty:state.curDiff||"normal",errorType:errorType||"",at:Date.now()});
    s.recent=s.recent.slice(-12);
    s.lastAttemptAt=Date.now();
    if(!ok&&errorType)s.errors[errorType]=(Number(s.errors[errorType])||0)+1;
    p.total++; if(ok)p.correct++;
    saveStore();
  }
  function chooseOp(){
    if(state.mode!=="review")return pick(state.ops);
    state.retryContext=null;
    for(var q=0;q<state.retryQueue.length;q++){
      if(state.retryQueue[q].due<=state.answered&&state.ops.indexOf(state.retryQueue[q].op)!==-1){
        state.retryContext=state.retryQueue.splice(q,1)[0];
        return state.retryContext.op;
      }
    }
    var p=activeProfile(),weighted=[];
    state.ops.forEach(function(op){
      var e=evidenceFor(op);
      var stale=e.lastAt?Math.min(3,(Date.now()-e.lastAt)/86400000/7):2;
      var weakness=Math.max(1,Math.round((1-e.accuracy)*8+(1-e.confidence)*4+stale));
      for(var i=0;i<weakness;i++)weighted.push(op);
    });
    return pick(weighted);
  }
  function queueRetry(op,errorType){
    if(state.mode!=="review")return;
    var exists=state.retryQueue.some(function(item){return item.op===op&&item.errorType===errorType;});
    if(!exists)state.retryQueue.push({op:op,errorType:errorType||"general",difficulty:state.curDiff,due:state.answered+2+ri(0,1)});
  }
  function adaptiveDifficulty(op){
    if(state.mode!=="review")return state.diffByOp[op]||"normal";
    if(state.retryContext)return state.retryContext.difficulty||"easy";
    var e=evidenceFor(op);
    if(e.total<4||e.accuracy<.68)return "easy";
    if(e.confidence<.62||e.accuracy<.88)return "normal";
    return "hard";
  }
  function shuffle(arr){
    for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
    return arr;
  }
  function gcd(x,y){x=Math.abs(x);y=Math.abs(y);while(y){var t=y;y=x%y;x=t;}return x;}
  function divisors(n){var r=[];for(var i=1;i<=n;i++)if(n%i===0)r.push(i);return r;}
  function multsUpTo(x,lim){var r=[],k=1;while(x*k<=lim){r.push(x*k);k++;}return r;}
  function fmtList(arr,maxn){
    if(arr.length<=maxn) return arr.join(", ");
    return arr.slice(0,maxn-1).join(", ")+", …, "+arr[arr.length-1];
  }

  // ---- generación de problemas con explicación ----
  function makeProblem(){
    var op=chooseOp();
    state.curDiff=adaptiveDifficulty(op);
    var lvl=state.curDiff;
    var d=DIFF[lvl];
    var boost=1+(state.level-1)*0.12;
    var a,b,ans,text,hint,solve,base,exp,expand,distractors;

    if(op==="add"){
      a=ri(2,Math.round(d.addMax*boost)); b=ri(2,Math.round(d.addMax*boost));
      ans=a+b; text=a+" + "+b;
      distractors=[ans-1,ans+1,ans+10];
      hint="Sumá primero las decenas y después las unidades.";
      solve="Sumar es juntar cantidades.<br><b>"+a+" + "+b+"</b> = <span class='res'>"+ans+"</span>";
    }else if(op==="sub"){
      a=ri(5,Math.round(d.subMax*boost)); b=ri(1,a);
      ans=a-b; text=a+" − "+b;
      distractors=[ans-1,ans+1,a+b];
      hint="¿Cuánto le falta a "+b+" para llegar a "+a+"?";
      solve="Restar es quitar.<br><b>"+a+" − "+b+"</b> = <span class='res'>"+ans+"</span><br>Comprobalo: "+ans+" + "+b+" = "+a+" ✓";
    }else if(op==="mul"){
      a=ri(2,d.mulMax); b=ri(2,Math.round(d.mulMax*(lvl==="hard"?boost:1)));
      ans=a*b; text=a+" × "+b;
      distractors=[a*(b-1),a*(b+1),a+b];
      hint="Es sumar "+b+" un total de "+a+" veces.";
      solve="Pensá en "+a+" grupos de "+b+".<br><b>"+a+" × "+b+"</b> = <span class='res'>"+ans+"</span>";
    }else if(op==="div"){
      var divMax=lvl==="hard"?Math.round(d.mulMax*boost):d.mulMax;
      b=ri(2,divMax); ans=ri(2,divMax); a=b*ans; text=a+" ÷ "+b;
      distractors=[ans-1,ans+1,b];
      hint="¿Qué número multiplicado por "+b+" te da "+a+"?";
      solve="Dividir es repartir en partes iguales.<br><b>"+a+" ÷ "+b+"</b> = <span class='res'>"+ans+"</span> porque "+ans+" × "+b+" = "+a;
    }else if(op==="pow"){
      exp=pick(d.powExps);
      var powCap=exp===4?5:exp===3?Math.min(8,d.powBase):d.powBase;
      base=ri(2,powCap);
      ans=Math.pow(base,exp); text=base+"<sup>"+exp+"</sup>";
      distractors=[base*exp,Math.pow(base,Math.max(1,exp-1)),ans+base];
      var parts=[]; for(var i=0;i<exp;i++)parts.push(base); expand=parts.join(" × ");
      hint="Multiplicá "+base+" por sí mismo "+exp+" veces.";
      solve="Una potencia es multiplicar la base por sí misma.<br><b>"+base+"<sup>"+exp+"</sup></b> = "+expand+" = <span class='res'>"+ans+"</span>";
    }else if(op==="root"){
      var rootLimit=Math.min(1600,Math.round(d.rootMax*(lvl==="hard"?boost:1)));
      var r=ri(2,Math.floor(Math.sqrt(rootLimit))); a=r*r; ans=r; text="√"+a;
      distractors=[Math.round(a/2),ans-1,ans+1];
      hint="¿Qué número, multiplicado por sí mismo, da "+a+"?";
      solve="La raíz cuadrada busca qué número al cuadrado da "+a+".<br><b>√"+a+"</b> = <span class='res'>"+ans+"</span> porque "+ans+" × "+ans+" = "+a;
    }else if(op==="mlt"){
      var hiB=d.factorMax;
      var nb = ri(2,hiB), k = ri(2,lvl==="hard"?14:9);
      ans = nb*k;
      var maxM = ans+nb+6, distM=[], g1=0;
      while(distM.length<3 && g1++<200){
        var cm=ri(nb+1,maxM);
        if(cm%nb!==0 && cm!==ans && distM.indexOf(cm)===-1) distM.push(cm);
      }
      state.answer=ans;
      return {text:"¿Cuál es múltiplo de <b>"+nb+"</b>?", ans:ans, op:op, equals:false,
        options:shuffle([ans].concat(distM)),
        meta:{a:nb,b:k},
        hint:"Pensá en la tabla del "+nb+": ¿cuál de los números aparece ahí?",
        solve:"Un múltiplo sale de multiplicar "+nb+" por otro número.<br><b>"+ans+"</b> es múltiplo de "+nb+" porque "+nb+" × "+k+" = <span class='res'>"+ans+"</span>."};
    }else if(op==="dvs"){ // divisores
      var hiF=d.factorMax;
      var N, divs, tries=0;
      do{
        N = ri(2,hiF)*ri(2,hiF);
        divs=[]; for(var dd=2; dd<N; dd++) if(N%dd===0) divs.push(dd);
        tries++;
      }while(divs.length===0 && tries<30);
      if(divs.length===0){ N=12; divs=[2,3,4,6]; }
      ans = pick(divs);
      var maxD=Math.max(N,14), distD=[], g2=0;
      while(distD.length<3 && g2++<300){
        var cd=ri(2,maxD);
        if(N%cd!==0 && cd!==ans && distD.indexOf(cd)===-1) distD.push(cd);
      }
      state.answer=ans;
      return {text:"¿Cuál es divisor de <b>"+N+"</b>?", ans:ans, op:op, equals:false,
        options:shuffle([ans].concat(distD)),
        meta:{a:N,b:ans},
        hint:"Probá dividir "+N+" por cada opción. La correcta no deja resto.",
        solve:"Un divisor entra justo, sin que sobre nada.<br><b>"+ans+"</b> es divisor de "+N+" porque "+N+" ÷ "+ans+" = <span class='res'>"+(N/ans)+"</span> y no sobra nada."};
    }else if(op==="mcd"){
      var gloD=d.commonMax;
      var A,B,an,t3=0;
      do{
        var gg=ri(2,gloD), m1=ri(2,gloD+1), n1=ri(2,gloD+1);
        A=gg*m1; B=gg*n1; an=gcd(A,B); t3++;
      }while((A===B || an<2) && t3<40);
      if(A===B||an<2){A=12;B=18;an=6;}
      ans=an;
      var comunes=divisors(A).filter(function(x){return B%x===0;});
      var poolD=comunes.filter(function(x){return x!==ans;});
      poolD.push(A); poolD.push(B); poolD.push(A*B/an);
      var distMcd=[], seenD={}; seenD[ans]=1; poolD=shuffle(poolD);
      for(var pi=0; pi<poolD.length && distMcd.length<3; pi++){
        var v=poolD[pi]; if(v>0 && !seenD[v]){ seenD[v]=1; distMcd.push(v); }
      }
      var gd=0;
      while(distMcd.length<3 && gd++<200){ var rc=ans+ri(1,6)*(Math.random()<.5?1:-1); if(rc>0 && !seenD[rc]){seenD[rc]=1;distMcd.push(rc);} }
      state.answer=ans;
      return {text:"¿Cuál es el <b>MCD</b> de "+A+" y "+B+"?", ans:ans, op:op, equals:false,
        options:shuffle([ans].concat(distMcd)),
        meta:{a:A,b:B},
        hint:"Anotá los divisores de "+A+" y de "+B+", y buscá el mayor que esté en las dos listas.",
        solve:"El MCD es el mayor divisor que comparten.<br>Divisores de "+A+": "+fmtList(divisors(A),8)+"<br>Divisores de "+B+": "+fmtList(divisors(B),8)+"<br>El mayor en común es <span class='res'>"+ans+"</span>."};
    }else{ // mcm
      var gloM=d.commonMax;
      var A2,B2,L,t4=0;
      do{
        var g2b=ri(2,gloM), m2=ri(2,gloM+1), n2=ri(2,gloM+1);
        A2=g2b*m2; B2=g2b*n2; L=A2*B2/gcd(A2,B2); t4++;
      }while((A2===B2) && t4<40);
      if(A2===B2){A2=4;B2=6;L=12;}
      ans=L;
      var poolM=[ans*2, ans*3, A2, B2, gcd(A2,B2), A2*B2];
      var distMcm=[], seenM={}; seenM[ans]=1; poolM=shuffle(poolM);
      for(var pj=0; pj<poolM.length && distMcm.length<3; pj++){
        var w=poolM[pj]; if(w>0 && w!==ans && !seenM[w]){ seenM[w]=1; distMcm.push(w); }
      }
      var gm=0;
      while(distMcm.length<3 && gm++<200){ var rw=ans+ri(1,8)*(Math.random()<.5?1:-1); if(rw>0 && rw!==ans && !seenM[rw]){seenM[rw]=1;distMcm.push(rw);} }
      state.answer=ans;
      return {text:"¿Cuál es el <b>MCM</b> de "+A2+" y "+B2+"?", ans:ans, op:op, equals:false,
        options:shuffle([ans].concat(distMcm)),
        meta:{a:A2,b:B2},
        hint:"Anotá los múltiplos de "+A2+" y de "+B2+", y buscá el menor que aparezca en las dos.",
        solve:"El MCM es el menor múltiplo que comparten.<br>Múltiplos de "+A2+": "+fmtList(multsUpTo(A2,ans),7)+"<br>Múltiplos de "+B2+": "+fmtList(multsUpTo(B2,ans),7)+"<br>El primero en común es <span class='res'>"+ans+"</span>."};
    }
    var equals;
    if(state.mode!=="arcade"&&Math.random()<.3){
      var result=ans;
      if(op==="add"){
        ans=b;text=a+" + <span class='q'>?</span> = "+result;equals=false;
        hint="Pensá qué número falta para ir de "+a+" a "+result+".";
        solve="Buscamos el sumando que falta: "+result+" − "+a+" = <span class='res'>"+ans+"</span>.";
        distractors=[ans-1,ans+1,result+a];
      }else if(op==="sub"){
        ans=b;text=a+" − <span class='q'>?</span> = "+result;equals=false;
        hint="Restale el resultado al número inicial.";
        solve="Buscamos cuánto se quitó: "+a+" − "+result+" = <span class='res'>"+ans+"</span>.";
        distractors=[ans-1,ans+1,a+result];
      }else if(op==="mul"){
        ans=b;text=a+" × <span class='q'>?</span> = "+result;equals=false;
        hint="Dividí el resultado por "+a+".";
        solve="Buscamos el factor que falta: "+result+" ÷ "+a+" = <span class='res'>"+ans+"</span>.";
        distractors=[ans-1,ans+1,result-a];
      }else if(op==="div"){
        ans=b;text=a+" ÷ <span class='q'>?</span> = "+result;equals=false;
        hint="Dividí "+a+" por el resultado "+result+".";
        solve="Buscamos el divisor: "+a+" ÷ "+result+" = <span class='res'>"+ans+"</span>.";
        distractors=[ans-1,ans+1,result];
      }
    }
    state.answer=ans;
    if(op==="pow"){a=base;b=exp;}
    if(op==="root"){a=a;b=2;}
    return {text:text,ans:ans,hint:hint,solve:solve,op:op,distractors:distractors,equals:equals,meta:{a:a,b:b}};
  }

  var CONCEPTS={
    add:{q:"En 47 + 38, primero 7 + 8 da 15. ¿Qué hago?",choices:["Escribo 5 y llevo 1","Escribo 15 completo abajo","Resto 1 a las decenas"],correct:0,
      h:"En la columna solo puede quedar una cifra.",s:"Se escribe el 5 en unidades y se lleva 1 a las decenas."},
    sub:{q:"En 62 − 28, no puedo hacer 2 − 8. ¿Cuál es el primer paso?",choices:["Pedir prestado una decena","Cambiar el orden de la cuenta","Sumar 2 + 8"],correct:0,
      h:"La columna de unidades necesita recibir diez.",s:"Se pide prestada una decena: el 2 pasa a 12 y el 6 baja a 5."},
    mul:{q:"¿Qué significa 4 × 6?",choices:["Sumar 6 cuatro veces","Sumar 4 y 6","Multiplicar 4 por sí mismo"],correct:0,
      h:"Pensá en cuatro grupos iguales.",s:"4 × 6 representa cuatro grupos de 6: 6 + 6 + 6 + 6."},
    div:{q:"¿Cómo puedo comprobar 56 ÷ 8 = 7?",choices:["Haciendo 7 × 8","Haciendo 56 + 8","Haciendo 8 − 7"],correct:0,
      h:"Usá una multiplicación para revisar.",s:"Multiplicamos la respuesta por 8: 7 × 8 = 56."},
    pow:{q:"¿Qué indica el 3 en 2³?",choices:["Repetir el 2 tres veces como factor","Multiplicar 2 × 3","Sumar 3 al 2"],correct:0,
      h:"El número pequeño es el exponente.",s:"2³ significa 2 × 2 × 2."},
    root:{q:"¿Qué pregunta ayuda a resolver √81?",choices:["¿Qué número por sí mismo da 81?","¿Cuál es la mitad de 81?","¿Cuánto es 81 ÷ 2?"],correct:0,
      h:"Buscá un número que, multiplicado por sí mismo, dé 81.",s:"La respuesta es 9 porque 9 × 9 = 81."},
    mlt:{q:"¿Cuál es el primer paso para buscar múltiplos de 6?",choices:["Multiplicar 6 por 1, 2, 3…","Dividir 6 por todos los números","Restar 6 repetidamente"],correct:0,
      h:"Los múltiplos forman la tabla del número.",s:"Calculamos 6×1, 6×2, 6×3…: 6, 12, 18…"},
    dvs:{q:"¿Cómo sé si 4 es divisor de 20?",choices:["20 ÷ 4 da exacto","4 es menor que 20","20 termina en cero"],correct:0,
      h:"Un divisor divide justo: no sobra nada.",s:"20 ÷ 4 = 5 y no sobra nada; por eso 4 es divisor."},
    mcd:{q:"Para calcular un MCD con listas, ¿qué hago primero?",choices:["Listo los divisores","Listo los múltiplos","Sumo los números"],correct:0,
      h:"La D de MCD recuerda qué listas mirar.",s:"Primero listamos divisores; luego buscamos los comunes y elegimos el mayor."},
    mcm:{q:"Para calcular un MCM con listas, ¿qué hago primero?",choices:["Listo los múltiplos","Listo los divisores","Resto los números"],correct:0,
      h:"La M de MCM recuerda qué listas mirar.",s:"Primero listamos múltiplos; luego buscamos el primero que aparece en ambas listas."}
  };

  function prepareProblem(problem){
    if(state.mode!=="arcade"&&Math.random()<.12){
      var concept=CONCEPTS[problem.op];
      return {text:concept.q,ans:concept.correct,op:problem.op,equals:false,
        options:shuffle(concept.choices.map(function(label,index){return {value:index,label:label};})),
        hint:concept.h,solve:concept.s,conceptChoices:concept.choices};
    }
    if(state.mode!=="arcade"&&problem.equals!==false&&!problem.options&&problem.meta&&Math.random()<.18){
      var m=problem.meta,story;
      if(problem.op==="add")story="Tenías <b>"+m.a+"</b> figuritas y conseguiste <b>"+m.b+"</b> más. ¿Cuántas tenés ahora?";
      if(problem.op==="sub")story="Había <b>"+m.a+"</b> cartas y se usaron <b>"+m.b+"</b>. ¿Cuántas quedaron?";
      if(problem.op==="mul")story="Hay <b>"+m.a+"</b> cajas con <b>"+m.b+"</b> lápices cada una. ¿Cuántos lápices hay?";
      if(problem.op==="div")story="Se reparten <b>"+m.a+"</b> fichas entre <b>"+m.b+"</b> chicos por igual. ¿Cuántas recibe cada uno?";
      if(story){
        problem.text=story;problem.equals=false;
        problem.hint="Identificá qué operación representa la situación. "+problem.hint;
        return problem;
      }
    }
    if(state.mode==="arcade"||problem.options||problem.equals===false||Math.random()>=.22)return problem;
    if(["add","sub","mul","div","pow","root"].indexOf(problem.op)===-1)return problem;
    var original=problem.ans;
    var showCorrect=Math.random()<.5;
    var falseValues=(problem.distractors||makeOptions(original).filter(function(v){return v!==original;}));
    var shown=showCorrect?original:pick(falseValues);
    var verdict=showCorrect?1:0;
    return {
      text:problem.text+" = <b>"+shown+"</b><br><small>¿Verdadero o falso?</small>",
      ans:verdict,op:problem.op,equals:false,
      options:[{value:1,label:"Verdadero"},{value:0,label:"Falso"}],
      hint:"Resolvé la cuenta primero y compará tu resultado con "+shown+".",
      solve:problem.solve+"<br>La afirmación era <span class='res'>"+(showCorrect?"verdadera":"falsa")+"</span>."
    };
  }

  function makeOptions(ans,preferred){
    var set=[ans],guard=0;
    (preferred||[]).forEach(function(v){
      v=Math.round(v);
      if(v>=0&&v!==ans&&set.indexOf(v)===-1&&set.length<4)set.push(v);
    });
    while(set.length<4 && guard++<60){
      var spread=Math.max(2,Math.round(Math.abs(ans)*0.2)+ri(1,5));
      var cand=ans+ri(-spread,spread);
      if(cand===ans) cand+=ri(1,3);
      if(cand<0 && ans>=0) cand=Math.abs(cand)+1;
      if(set.indexOf(cand)===-1) set.push(cand);
    }
    for(var i=set.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=set[i];set[i]=set[j];set[j]=t;}
    return set;
  }

  // ---- render ----
  function renderLives(){
    var h="";for(var i=0;i<3;i++)h+="<span class='"+(i<state.lives?"":"lost")+"'>❤️</span>";
    $("#lives").innerHTML=h;
    $("#lives").setAttribute("aria-label",state.lives+" vidas");
  }
  function comboMult(){return Math.min(1+state.combo*0.1,3);}
  function renderCombo(){
    $("#comboFill").style.width=(Math.min(state.combo,10)/10*100)+"%";
    var t=$("#comboTxt");
    if(state.combo>=2){t.textContent="x"+comboMult().toFixed(1);t.classList.add("show");}
    else t.classList.remove("show");
  }

  function newRound(){
    state.locked=false; state.usedHint=false;
    hideTeach();
    $("#hintBtn").disabled=false;
    state.lastValue=null;
    var p=prepareProblem(makeProblem()); state.cur=p; state.answer=p.ans;
    var eq=$("#equation");
    if(p.equals===false){ eq.classList.add("ask"); eq.innerHTML=p.text; }
    else{ eq.classList.remove("ask"); eq.innerHTML=p.text+" = <span class='q'>?</span>"; }
    $("#levelTag").textContent="NIVEL "+state.level;
    var canWrite=!p.options;
    state.inputKind=canWrite&&(state.answerMode==="write"||
      (state.answerMode==="mixed"&&Math.random()<(state.mode==="arcade"?.25:.5)))?"write":"choice";
    var box=$("#options"),form=$("#typeAnswer"); box.innerHTML="";
    if(state.inputKind==="write"){
      box.style.display="none"; form.classList.add("show");
      $("#answerInput").value=""; $("#answerInput").disabled=false;
      setTimeout(function(){$("#answerInput").focus();},50);
    }else{
      box.style.display="grid"; form.classList.remove("show");
      var opts=p.options?p.options:makeOptions(p.ans,p.distractors);
      opts.forEach(function(v){
        var b=document.createElement("button");
        var value=typeof v==="object"?v.value:v;
        b.className="opt"; b.textContent=typeof v==="object"?v.label:v;
        b.dataset.value=value;
        b.onclick=function(){answer(value,b);};
        box.appendChild(b);
      });
    }
    $("#roundProgress").textContent=state.mode==="arcade"?"":("Pregunta "+(state.answered+1)+" de "+state.targetRounds);
    $("#announcer").textContent="Nueva pregunta de "+OPNAME[p.op];
    startTimer();
  }

  function startTimer(){
    clearInterval(state.timer);
    if(state.mode!=="arcade"){
      $("#timerBar").style.display="none";
      state.timeLeft=0; state.timeTotal=0;
      return;
    }
    $("#timerBar").style.display="block";
    state.timeTotal=DIFF[state.curDiff].time;
    state.timeLeft=state.timeTotal;
    $("#timerFill").style.width="100%";
    runTimer();
  }
  function runTimer(){
    clearInterval(state.timer);
    var fill=$("#timerFill"); fill.classList.remove("low");
    state.timer=setInterval(function(){
      state.timeLeft-=0.1;
      var pct=Math.max(0,state.timeLeft/state.timeTotal*100);
      fill.style.width=pct+"%";
      $("#timerBar").setAttribute("aria-valuenow",Math.round(pct));
      if(pct<30)fill.classList.add("low");
      if(state.timeLeft<=0){clearInterval(state.timer);timeout();}
    },100);
  }

  function wrongTip(op){
    var tips={
      add:"Revisá primero las unidades y después las decenas.",
      sub:"Comprobá la resta sumando tu resultado con el número que quitaste.",
      mul:"Buscá la tabla de uno de los dos números o descomponé la cuenta.",
      div:"Multiplicá tu respuesta por el número que divide: debería darte el total inicial.",
      pow:"El exponente indica cuántas veces se repite la base; no se multiplica por ella.",
      root:"La raíz busca un número que, multiplicado por sí mismo, dé el valor de adentro.",
      mlt:"Un múltiplo tiene que aparecer en la tabla del número indicado.",
      dvs:"Un divisor tiene que dividir justo, sin que sobre nada.",
      mcd:"MCD: mirá divisores comunes y elegí el mayor.",
      mcm:"MCM: mirá múltiplos comunes y elegí el menor."
    };
    return tips[op];
  }
  function diagnoseMistake(problem,value){
    var m=problem.meta||{},a=Number(m.a),b=Number(m.b),type="general",message=wrongTip(problem.op);
    if(problem.conceptChoices){
      type="concepto";
      message="Elegiste “"+problem.conceptChoices[value]+"”. "+problem.solve.replace(/<[^>]+>/g," ");
    }else if(problem.op==="add"&&Number.isFinite(a)&&Number.isFinite(b)){
      if(value===Math.abs(a-b)){type="operacion-confundida";message="Parece que restaste en lugar de sumar. La consigna pide juntar "+a+" y "+b+".";}
      else if(value===problem.ans-1||value===problem.ans+1){type="calculo-cercano";message="Estuviste muy cerca. Revisá unidades y llevadas antes de confirmar.";}
    }else if(problem.op==="sub"&&Number.isFinite(a)&&Number.isFinite(b)){
      if(value===a+b){type="operacion-confundida";message="Sumaste los números. En una resta hay que quitar "+b+" de "+a+".";}
      else if(value===Math.abs(b-a)){type="orden";message="En la resta importa el orden: empezamos en "+a+" y quitamos "+b+".";}
    }else if(problem.op==="mul"&&Number.isFinite(a)&&Number.isFinite(b)){
      if(value===a+b){type="suma-en-vez-de-producto";message="Sumaste los dos números una sola vez. "+a+" × "+b+" significa "+a+" grupos de "+b+".";}
      else if(value===a*(b-1)||value===a*(b+1)){type="tabla-vecina";message="Usaste una fila vecina de la tabla. Volvé a contar exactamente "+b+" grupos.";}
    }else if(problem.op==="div"&&Number.isFinite(a)&&Number.isFinite(b)){
      if(value===b){type="repite-divisor";message="Repetiste el número por el que dividís. Buscamos cuántas veces entra "+b+" en "+a+".";}
      else if(value===problem.ans-1||value===problem.ans+1){type="resultado-cercano";message="Probá tu respuesta multiplicándola por "+b+": tiene que dar exactamente "+a+".";}
    }else if(problem.op==="pow"&&Number.isFinite(a)&&Number.isFinite(b)){
      if(value===a*b){type="base-por-exponente";message="Multiplicaste base por exponente. El exponente indica cuántas veces repetir la base como factor.";}
    }else if(problem.op==="root"&&Number.isFinite(a)){
      if(value===Math.round(a/2)){type="mitad-en-vez-de-raiz";message="Calculaste la mitad. La raíz busca un número que, multiplicado por sí mismo, dé "+a+".";}
    }else if(problem.op==="mcd"){type="mcd-mcm";message="Para MCD mirá divisores comunes y elegí el mayor, no un múltiplo.";}
    else if(problem.op==="mcm"){type="mcm-mcd";message="Para MCM mirá múltiplos comunes y elegí el primero, no el mayor divisor.";}
    else if(problem.op==="mlt"){type="multiplo";message="Comprobá si el número aparece al multiplicar la base por 1, 2, 3…";}
    else if(problem.op==="dvs"){type="divisor";message="Dividí el número de la consigna por tu opción: si queda resto, no es divisor.";}
    return {type:type,message:message};
  }
  function unlockAchievements(){
    var p=activeProfile(),earned=[];
    function unlock(id,label,condition){
      if(condition&&p.unlocked.indexOf(id)===-1){p.unlocked.push(id);earned.push(label);}
    }
    unlock("first","Primer paso",p.correct>=1);
    unlock("first10","10 aciertos",p.correct>=10);
    unlock("fifty","50 aciertos",p.correct>=50);
    unlock("combo5","Combo x5",state.bestCombo>=5);
    unlock("combo10","Combo x10",state.bestCombo>=10);
    unlock("hundred","100 aciertos",p.correct>=100);
    unlock("explorer","Todos los temas",OPORDER.every(function(op){
      var s=p.byOp[op];return s&&(s.ok+s.fail)>0;
    }));
    unlock("perfect","Sesión perfecta",state.completed&&state.answered>0&&state.correct===state.answered);
    unlock("practice5","5 prácticas",p.practiceSessions>=5);
    unlock("review5","5 repasos",p.reviewSessions>=5);
    if(earned.length){saveStore();setTimeout(function(){showFlash("🏅 "+earned[0]);},120);}
  }
  function finishOrNext(){
    if(state.mode==="arcade"&&state.lives<=0){gameOver();return;}
    if(state.mode!=="arcade"&&state.answered>=state.targetRounds){gameOver();return;}
    newRound();
  }
  function answerLabel(){
    var opts=state.cur&&state.cur.options;
    if(opts){
      for(var i=0;i<opts.length;i++)if(typeof opts[i]==="object"&&Number(opts[i].value)===state.answer)return opts[i].label;
    }
    return state.answer;
  }
  function answer(val,btn){
    if(state.locked)return;
    if(typeof val==="string"&&val.trim()===""){
      $("#announcer").textContent="Escribí una respuesta antes de continuar";
      $("#answerInput").focus();
      return;
    }
    val=Number(val);
    if(!Number.isFinite(val))return;
    state.locked=true; clearInterval(state.timer);
    state.lastValue=val; state.answered++;
    $("#hintBtn").disabled=true;
    $("#answerInput").disabled=true;
    var all=document.querySelectorAll(".opt");
    all.forEach(function(o){o.classList.add("disabled");});
    if(val===state.answer){
      if(btn)btn.classList.add("correct");
      var gained;
      if(state.usedHint){ gained=8; } // con pista: puntos base, sin bonus ni combo
      else{
        gained=Math.round((10+(state.mode==="arcade"?Math.max(0,Math.ceil(state.timeLeft))*2:5))*comboMult());
        state.combo++; state.bestCombo=Math.max(state.bestCombo,state.combo);
      }
      state.score+=gained; state.correct++;
      bump(state.cur.op,"ok");
      recordAttempt(state.cur.op,true,"");
      $("#score").textContent=state.score;
      sndGood(); vibrate(30); renderCombo();
      $("#announcer").textContent="Respuesta correcta";
      unlockAchievements();
      if(state.correct%5===0){state.level++;sndLvl();showFlash("¡NIVEL "+state.level+"!");}
      setTimeout(finishOrNext,650);
    }else{
      if(btn)btn.classList.add("wrong");
      all.forEach(function(o){if(Number(o.dataset.value)===state.answer)o.classList.add("correct");});
      bump(state.cur.op,"fail");
      var diagnosis=diagnoseMistake(state.cur,val);
      state.cur.diagnosis=diagnosis;
      recordAttempt(state.cur.op,false,diagnosis.type);
      queueRetry(state.cur.op,diagnosis.type);
      sndBad(); vibrate([0,40,30,60]);
      if(state.mode==="arcade")state.lives--;
      state.combo=0; renderLives(); renderCombo();
      $("#announcer").textContent="Respuesta incorrecta. La respuesta era "+answerLabel();
      showTeach("solve");
    }
  }

  function timeout(){
    if(state.locked)return;
    state.locked=true; state.answered++; state.lastValue=null; $("#hintBtn").disabled=true;
    document.querySelectorAll(".opt").forEach(function(o){
      o.classList.add("disabled");
      if(Number(o.dataset.value)===state.answer)o.classList.add("correct");
    });
    sndBad(); vibrate([0,40,30,60]);
    bump(state.cur.op,"fail");
    state.cur.diagnosis={type:"sin-tiempo",message:"El tiempo terminó antes de responder. En Repaso volverá una cuenta parecida sin apuro."};
    recordAttempt(state.cur.op,false,"sin-tiempo");
    queueRetry(state.cur.op,"sin-tiempo");
    state.lives--; state.combo=0; renderLives(); renderCombo();
    $("#announcer").textContent="Se terminó el tiempo. La respuesta era "+answerLabel();
    showTeach("solve");
  }

  // ---- tarjeta educativa ----
  function showTeach(mode){
    var t=$("#teach");
    t.classList.remove("is-hint","is-solve");
    if(mode==="hint"){
      clearInterval(state.timer); // pausa el reloj mientras lee la pista
      t.classList.add("is-hint");
      $("#teachTitle").textContent="💡 PISTA";
      $("#teachBody").innerHTML=state.cur.hint;
      $("#teachBtn").textContent="Seguir jugando ▶";
    }else{
      t.classList.add("is-solve");
      $("#teachTitle").textContent="ASÍ SE RESUELVE";
      $("#teachBody").innerHTML=state.cur.solve+"<div class='mistake'>"+(state.cur.diagnosis?state.cur.diagnosis.message:wrongTip(state.cur.op))+"</div>";
      $("#teachBtn").textContent="Entendí, seguir ▶";
    }
    t.dataset.mode=mode;
    t.classList.add("show");
  }
  function hideTeach(){$("#teach").classList.remove("show");}

  $("#teachBtn").onclick=function(){
    var mode=$("#teach").dataset.mode;
    hideTeach();
    if(mode==="hint"){
      if(state.mode==="arcade")runTimer();
    }else{setTimeout(finishOrNext,150);}
  };
  $("#studyErrorBtn").onclick=function(){
    clearInterval(state.timer);hideTeach();
    state.learnReturn="game";state.studyFromError=true;
    openStudyTopic(state.cur.op);
  };

  $("#hintBtn").onclick=function(){
    if(state.locked || state.usedHint)return;
    state.usedHint=true;
    $("#hintBtn").disabled=true;
    showTeach("hint");
  };

  function showFlash(txt){
    var f=$("#flash"); $("#flashTxt").textContent=txt;
    f.classList.remove("show"); void f.offsetWidth; f.classList.add("show");
    setTimeout(function(){f.classList.remove("show");},900);
  }

  function show(id){
    var s=document.querySelectorAll(".screen");
    for(var i=0;i<s.length;i++){s[i].classList.remove("active");s[i].setAttribute("aria-hidden","true");}
    $("#"+id).classList.add("active");$("#"+id).setAttribute("aria-hidden","false");
    var focusByScreen={menu:"#playBtn",customize:"#customizeBack",end:"#againBtn",learn:"#learnBack",tools:"#toolsBack",progress:"#progressBack"};
    if(focusByScreen[id])setTimeout(function(){$(focusByScreen[id]).focus();},30);
  }

  function startGame(){
    if(state.ops.length===0){
      var g=$("#ops"); g.classList.remove("warn"); void g.offsetWidth; g.classList.add("warn");
      beep(180,.18,"sawtooth",.1);
      return;
    }
    state.score=0;state.lives=3;state.combo=0;state.bestCombo=0;
    state.correct=0;state.answered=0;state.level=1;state.locked=false;state.usedHint=false;state.completed=false;state.paused=false;
    state.retryQueue=[];
    state.stats={};
    $("#answerInput").disabled=false;
    $("#score").textContent="0"; renderLives(); renderCombo(); hideTeach();
    $("#lives").style.visibility=state.mode==="arcade"?"visible":"hidden";
    $("#gameModeTag").textContent=state.mode==="arcade"?"ARCADE":state.mode==="practice"?"PRÁCTICA":"REPASO PERSONALIZADO";
    show("game"); newRound();
  }

  function gameOver(){
    if(state.completed)return;
    state.completed=true;
    clearInterval(state.timer); hideTeach();
    var p=activeProfile(),best=p.best||0;
    p.sessions++;
    if(state.mode==="practice")p.practiceSessions++;
    if(state.mode==="review")p.reviewSessions++;
    p.bestCombo=Math.max(p.bestCombo||0,state.bestCombo);
    var isRecord=state.mode==="arcade"&&state.score>best;
    if(isRecord)p.best=state.score;
    saveStore();
    unlockAchievements();
    $("#endTitle").textContent=state.mode==="arcade"?"¡Buena partida!":"¡Sesión completada!";
    $("#finalScore").textContent=state.score;
    $("#finalCorrect").textContent=state.correct;
    $("#finalBest").textContent="x"+state.bestCombo;
    $("#finalLevel").textContent=state.level;
    var rl=$("#recordLine");
    if(isRecord){rl.textContent="🏆 ¡NUEVO RÉCORD!";rl.classList.add("new-record");}
    else if(state.mode==="arcade"){rl.textContent="Récord de "+store.active+": "+Math.max(best,state.score);rl.classList.remove("new-record");}
    else{rl.textContent="Respuestas bien: "+Math.round(state.correct/Math.max(1,state.answered)*100)+"%";rl.classList.remove("new-record");}
    renderSummary();
    show("end");
  }

  function renderSummary(){
    var box=$("#summary"); box.innerHTML="";
    var played=OPORDER.filter(function(op){var s=state.stats[op];return s&&(s.ok+s.fail)>0;});
    if(played.length===0){ return; }
    // operación más floja: más fallos; desempate por menor % de acierto
    var worst=null,worstFail=-1,worstPct=101;
    played.forEach(function(op){
      var s=state.stats[op],tot=s.ok+s.fail,pct=Math.round(s.ok/tot*100);
      if(s.fail>worstFail || (s.fail===worstFail && pct<worstPct)){
        worst=op; worstFail=s.fail; worstPct=pct;
      }
    });
    var w=document.createElement("div"); w.className="weak";
    if(worstFail===0){ w.classList.add("good"); w.innerHTML="🎯 ¡Todas bien! Podés probar un nivel más difícil."; }
    else{ w.innerHTML="Te conviene practicar un poco más: <b>"+OPNAME[worst]+"</b>"; }
    box.appendChild(w);

    played.forEach(function(op){
      var s=state.stats[op],tot=s.ok+s.fail,pct=Math.round(s.ok/tot*100);
      var row=document.createElement("div"); row.className="sumRow";
      row.innerHTML="<div class='lab'><span class='s'>"+OPSYM[op]+"</span>"+OPNAME[op]+"</div>"+
        "<div class='sumTrack'><div class='f' style='width:"+pct+"%'></div></div>"+
        "<div class='pct'>"+s.ok+"/"+tot+"</div>";
      box.appendChild(row);
    });
  }

  function renderProgress(){
    var p=activeProfile();
    $("#progressName").textContent=store.active;
    $("#progressAccuracy").textContent=(p.total?Math.round(p.correct/p.total*100):0)+"%";
    $("#progressTotal").textContent=p.total;
    $("#progressBest").textContent=p.best||0;
    var weakest=null,weakNeed=-1;
    var mastery=$("#masteryList");mastery.innerHTML="";
    OPORDER.forEach(function(op){
      var s=p.byOp[op]||{ok:0,fail:0},total=s.ok+s.fail,evidence=evidenceFor(op),pct=Math.round(evidence.accuracy*100);
      var status=masteryStatus(op),need=(1-evidence.accuracy)+(1-evidence.confidence);
      var lesson=p.studyByOp[op]||{ok:0,fail:0,completed:0},lessonTotal=lesson.ok+lesson.fail;
      var lessonPct=lessonTotal?Math.round(lesson.ok/lessonTotal*100):0;
      if(need>weakNeed){weakNeed=need;weakest=op;}
      var row=document.createElement("div");row.className="mastery-row";
      row.dataset.op=op;row.setAttribute("role","button");row.setAttribute("tabindex","0");
      row.setAttribute("aria-label","Estudiar "+OPNAME[op]+". Cómo venís: "+status.label);
      row.innerHTML="<div class='mastery-top'><span>"+OPSYM[op]+" · "+OPNAME[op]+"</span><span>"+status.label+(lessonTotal?" · Estudio "+lessonPct+"%":"")+"</span></div>"+
        "<div class='mastery-track' role='progressbar' aria-label='Avance en el tema' aria-valuemin='0' aria-valuemax='3' aria-valuenow='"+status.level+"'><div class='mastery-fill' style='width:"+(status.level/3*100)+"%'></div></div>";
      mastery.appendChild(row);
    });
    $("#progressMessage").textContent=weakest?
      "En tu próximo Repaso aparecerá más seguido "+OPNAME[weakest]+".":
      "Jugá una sesión para descubrir qué temas te conviene practicar.";
    var achievements=$("#achievementList");achievements.innerHTML="";
    ACHIEVEMENTS.forEach(function(a){
      var got=p.unlocked.indexOf(a.id)!==-1;
      var card=document.createElement("div");card.className="achievement"+(got?" got":"");
      card.innerHTML="<b>"+a.icon+" "+a.name+"</b><span>"+a.desc+(got?" · conseguido":"")+"</span>";
      achievements.appendChild(card);
    });
  }

  // ---- guía de estudio ----
  var STUDY=window.MateArcadeContent.STUDY;
  var LESSONS=window.MateArcadeContent.LESSONS;

  function studyStatus(op){
    var s=activeProfile().studyByOp[op];
    if(!s||!(s.ok+s.fail))return "Sin empezar";
    var pct=Math.round(s.ok/(s.ok+s.fail)*100);
    return (s.completed?"Hecha · ":"")+pct+"% bien";
  }
  function updateStudyRecommendation(){
    var p=activeProfile(),bestOp=null,bestNeed=-1;
    OPORDER.forEach(function(op){
      var game=p.byOp[op]||{ok:0,fail:0},e=evidenceFor(op);
      var study=p.studyByOp[op]||{ok:0,fail:0,completed:0},st=study.ok+study.fail;
      var gameNeed=(1-e.accuracy)+(1-e.confidence)*.7;
      var studyNeed=st?1-study.ok/st:.3;
      var need=gameNeed+studyNeed+(study.completed?0:.18);
      if(need>bestNeed){bestNeed=need;bestOp=op;}
    });
    var box=$("#studyRecommendation");box.textContent="";
    box.appendChild(document.createTextNode("🧭 Para seguir practicando, "));
    var who=document.createElement("b");who.textContent=store.active;box.appendChild(who);
    box.appendChild(document.createTextNode(", te sugerimos empezar por "));
    var topic=document.createElement("b");topic.textContent=OPNAME[bestOp];box.appendChild(topic);
    box.appendChild(document.createTextNode(". Es el tema que más te conviene practicar ahora."));
  }
  function quizMarkup(op,index){
    var lesson=LESSONS[op],quiz=lesson.quiz[index];
    return "<div class='quiz-progress'>Desafío corto · "+(index+1)+" de "+lesson.quiz.length+"</div>"+
      "<div class='quiz-question'>"+quiz.q+"</div>"+
      "<div class='quiz-options'>"+quiz.o.map(function(option,i){
        return "<button class='quiz-option' type='button' data-quiz-answer='"+i+"'>"+option+"</button>";
      }).join("")+"</div>"+
      "<div class='quiz-feedback' aria-live='polite'></div>"+
      "<button class='quiz-next' type='button' data-quiz-next='"+(index+1)+"'>"+(index+1<lesson.quiz.length?"Siguiente pregunta ▶":"Ver resultado ▶")+"</button>";
  }
  function renderStudy(){
    var box=$("#studyList"),indexBox=$("#studyIndex"),topicSelect=$("#studyTopicSelect");
    box.innerHTML="";indexBox.innerHTML="";topicSelect.innerHTML="";
    STUDY.forEach(function(it,index){
      var op=OPORDER[index],lesson=LESSONS[op];
      var option=document.createElement("option");option.value=op;option.textContent=(index+1)+" · "+it.name;topicSelect.appendChild(option);
      var indexBtn=document.createElement("button");
      indexBtn.className="study-index-btn";indexBtn.type="button";indexBtn.dataset.studyOp=op;
      indexBtn.style.setProperty("--c",it.c);
      indexBtn.innerHTML="<span class='ix-sym'>"+it.s+"</span><span>"+it.name+"</span><span class='ix-number'>"+(index+1)+"</span>";
      indexBox.appendChild(indexBtn);
      var d=document.createElement("div");
      d.className="study-item"; d.style.setProperty("--c",it.c);
      d.dataset.op=op;d.dataset.quizCorrect="0";
      var symCls = it.s.length>=3 ? "sym t" : "sym";
      var panelId="studyPanel"+index;
      d.innerHTML=
        "<div class='study-head'><span class='"+symCls+"'>"+it.s+"</span><span class='nm'>"+it.name+"</span><span class='lesson-score'>"+studyStatus(op)+"</span>"+
          "<span class='lesson-kicker'>"+lesson.grade+" · Lección "+(index+1)+" de "+OPORDER.length+"</span></div>"+
        "<div class='lesson-tabs' role='tablist' aria-label='Partes de la lección'>"+
          "<button class='lesson-tab active' id='tab-"+op+"-understand' type='button' role='tab' data-lesson-tab='understand' aria-controls='panel-"+op+"-understand' aria-selected='true' tabindex='0'>Entender</button>"+
          "<button class='lesson-tab' id='tab-"+op+"-solve' type='button' role='tab' data-lesson-tab='solve' aria-controls='panel-"+op+"-solve' aria-selected='false' tabindex='-1'>Resolver</button>"+
          "<button class='lesson-tab' id='tab-"+op+"-practice' type='button' role='tab' data-lesson-tab='practice' aria-controls='panel-"+op+"-practice' aria-selected='false' tabindex='-1'>Practicar</button>"+
        "</div>"+
        "<div class='study-body' id='"+panelId+"' role='region'>"+
          "<div class='lesson-panel active' id='panel-"+op+"-understand' role='tabpanel' aria-labelledby='tab-"+op+"-understand' data-lesson-panel='understand'>"+
            "<div class='ssec'><div class='lesson-goal'><span class='icon'>🎯</span><div><b>QUÉ VAS A APRENDER</b><p>"+lesson.goal+"</p></div></div></div>"+
            "<div class='ssec context-section'><div class='slab'>Dónde aparece</div><div class='context-card'><span class='context-icon'>"+lesson.context.icon+"</span><div><b>"+lesson.context.title+"</b><p>"+lesson.context.text+"</p><div class='context-math'>"+lesson.context.math+"</div></div></div></div>"+
            "<div class='ssec'><div class='slab'>Antes de empezar</div><div class='prior'>"+lesson.prior.map(function(x){return "<span>"+x+"</span>";}).join("")+"</div></div>"+
            "<div class='ssec'><div class='slab'>¿Qué es?</div><p>"+it.q+"</p></div>"+
            "<div class='ssec visual-section'><div class='slab'>Miralo en acción</div><div class='visual-model'>"+lesson.visual+"</div></div>"+
          "</div>"+
          "<div class='lesson-panel' id='panel-"+op+"-solve' role='tabpanel' aria-labelledby='tab-"+op+"-solve' data-lesson-panel='solve' hidden>"+
            "<div class='ssec'><div class='slab'>Paso a paso</div><div class='lesson-steps'>"+lesson.steps.map(function(step,i){return "<div class='lesson-step'><span class='n'>"+(i+1)+"</span><span>"+step+"</span></div>";}).join("")+"</div></div>"+
            "<div class='ssec'><div class='slab'>Ejemplo resuelto</div><div class='sex'>"+it.e+"</div></div>"+
            "<div class='ssec compare-section'><div class='slab warn'>Radar de errores</div><div class='reason-compare'><div class='reason-bad'><span>✕ Así no</span><b>"+lesson.compare.bad+"</b><p>"+lesson.compare.badNote+"</p></div><div class='reason-good'><span>✓ Mejor pensalo así</span><b>"+lesson.compare.good+"</b><p>"+lesson.compare.goodNote+"</p></div></div></div>"+
            "<div class='ssec'><div class='slab tip'>⚡ Cálculo mental</div><p>"+lesson.mental+"</p></div>"+
            "<div class='ssec'><div class='slab warn'>⚠ Ojo con…</div><p>"+it.w+"</p></div>"+
            "<div class='ssec'><div class='slab'>Recordá estas ideas</div><div class='remember'>"+lesson.remember.map(function(x){return "<div>"+x+"</div>";}).join("")+"</div></div>"+
          "</div>"+
          "<div class='lesson-panel' id='panel-"+op+"-practice' role='tabpanel' aria-labelledby='tab-"+op+"-practice' data-lesson-panel='practice' hidden>"+
            "<div class='ssec'><div class='lesson-quiz' data-quiz-index='0'>"+quizMarkup(op,0)+"</div></div>"+
          "</div>"+
        "</div>";
      box.appendChild(d);
    });
    selectStudyTopic(state.currentStudyOp||"add",false);
  }
  function selectStudyTab(item,tabName){
    state.studyTab=tabName;
    item.querySelectorAll(".lesson-tab").forEach(function(btn){
      var active=btn.dataset.lessonTab===tabName;btn.classList.toggle("active",active);btn.setAttribute("aria-selected",active?"true":"false");btn.tabIndex=active?0:-1;
    });
    item.querySelectorAll(".lesson-panel").forEach(function(panel){var active=panel.dataset.lessonPanel===tabName;panel.classList.toggle("active",active);panel.hidden=!active;});
  }
  function selectStudyTopic(op,scroll){
    var index=OPORDER.indexOf(op);if(index<0){op="add";index=0;}
    state.currentStudyOp=op;
    document.querySelectorAll(".study-item").forEach(function(item){item.classList.toggle("current",item.dataset.op===op);});
    var activeIndexBtn=null;
    document.querySelectorAll(".study-index-btn").forEach(function(btn){
      var active=btn.dataset.studyOp===op;btn.classList.toggle("active",active);if(active)activeIndexBtn=btn;
    });
    $("#lessonPosition").textContent=(index+1)+" de "+OPORDER.length;
    $("#studyTopicSelect").value=op;
    $("#prevLessonBtn").disabled=index===0;$("#nextLessonBtn").disabled=index===OPORDER.length-1;
    var current=document.querySelector(".study-item[data-op='"+op+"']");
    if(current)selectStudyTab(current,state.studyTab||"understand");
    if(activeIndexBtn&&scroll)activeIndexBtn.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
    if(scroll)$("#learn").scrollTop=0;
  }
  $("#studyIndex").addEventListener("click",function(e){
    var btn=e.target.closest(".study-index-btn");if(!btn)return;
    state.studyTab="understand";selectStudyTopic(btn.dataset.studyOp,true);beep(440,.04);
  });
  $("#studyTopicSelect").onchange=function(){
    state.studyTab="understand";selectStudyTopic(this.value,true);beep(440,.04);
  };
  $("#studyList").addEventListener("click",function(e){
    var tab=e.target.closest(".lesson-tab");if(!tab)return;
    selectStudyTab(tab.closest(".study-item"),tab.dataset.lessonTab);
  });
  $("#studyList").addEventListener("keydown",function(e){
    var tab=e.target.closest(".lesson-tab");if(!tab||["ArrowLeft","ArrowRight","Home","End"].indexOf(e.key)===-1)return;
    e.preventDefault();
    var tabs=Array.from(tab.closest(".lesson-tabs").querySelectorAll(".lesson-tab")),index=tabs.indexOf(tab);
    if(e.key==="Home")index=0;else if(e.key==="End")index=tabs.length-1;
    else index=(index+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
    selectStudyTab(tab.closest(".study-item"),tabs[index].dataset.lessonTab);tabs[index].focus();
  });
  function updateStudyScore(item){
    item.querySelector(".lesson-score").textContent=studyStatus(item.dataset.op);
  }
  $("#studyList").addEventListener("click",function(e){
    var answerBtn=e.target.closest(".quiz-option");
    var nextBtn=e.target.closest(".quiz-next");
    if(!answerBtn&&!nextBtn)return;
    var item=e.target.closest(".study-item"),op=item.dataset.op,lesson=LESSONS[op];
    var quizBox=e.target.closest(".lesson-quiz");
    if(answerBtn){
      if(answerBtn.disabled)return;
      var index=Number(quizBox.dataset.quizIndex||0),quiz=lesson.quiz[index];
      var chosen=Number(answerBtn.dataset.quizAnswer),correct=chosen===quiz.a;
      quizBox.querySelectorAll(".quiz-option").forEach(function(btn){
        btn.disabled=true;
        if(Number(btn.dataset.quizAnswer)===quiz.a)btn.classList.add("correct");
      });
      if(!correct)answerBtn.classList.add("wrong");
      var progress=activeProfile().studyByOp[op]||(activeProfile().studyByOp[op]={ok:0,fail:0,completed:0});
      progress[correct?"ok":"fail"]++;
      if(correct)item.dataset.quizCorrect=String(Number(item.dataset.quizCorrect||0)+1);
      quizBox.querySelector(".quiz-feedback").innerHTML=(correct?"✅ <b>¡Bien!</b> ":"💡 ")+quiz.e;
      quizBox.querySelector(".quiz-next").classList.add("show");
      updateStudyScore(item);saveStore();
      beep(correct?660:240,.07,correct?"triangle":"sawtooth");
      $("#announcer").textContent=correct?"Respuesta correcta":quiz.e;
      return;
    }
    if(nextBtn.dataset.quizNext==="0"){
      quizBox.dataset.quizIndex="0";quizBox.innerHTML=quizMarkup(op,0);item.dataset.quizCorrect="0";
      quizBox.querySelector(".quiz-option").focus();
      return;
    }
    var next=Number(nextBtn.dataset.quizNext);
    if(next<lesson.quiz.length){
      quizBox.dataset.quizIndex=String(next);
      quizBox.innerHTML=quizMarkup(op,next);
      quizBox.querySelector(".quiz-option").focus();
      return;
    }
    var score=Number(item.dataset.quizCorrect||0),total=lesson.quiz.length;
    var record=activeProfile().studyByOp[op]||(activeProfile().studyByOp[op]={ok:0,fail:0,completed:0});
    record.completed++;
    saveStore();updateStudyScore(item);updateStudyRecommendation();
    quizBox.innerHTML="<div class='quiz-progress'>Desafío terminado</div>"+
      "<div class='quiz-question "+(score===total?"lesson-mastered":"")+"'>"+(score===total?
        "🌟 ¡Las dos salieron bien!":"Acertaste "+score+" de "+total+". Mirá el ejemplo una vez más y volvé a probar.")+"</div>"+
      "<button class='quiz-next show' type='button' data-quiz-next='0'>Volver a intentar ↻</button>";
    item.dataset.quizCorrect="0";
    $("#announcer").textContent="Desafío completado: "+score+" de "+total;
  });
  $("#prevLessonBtn").onclick=function(){var i=OPORDER.indexOf(state.currentStudyOp);if(i>0){state.studyTab="understand";selectStudyTopic(OPORDER[i-1],true);}};
  $("#nextLessonBtn").onclick=function(){var i=OPORDER.indexOf(state.currentStudyOp);if(i<OPORDER.length-1){state.studyTab="understand";selectStudyTopic(OPORDER[i+1],true);}};
  $("#printStudyBtn").onclick=function(){renderTimesTable(0);window.print();};
  $("#studyBtn").onclick=function(){state.learnReturn="menu";state.studyFromError=false;updateStudyRecommendation();show("learn");$("#learn").scrollTop=0;beep(560,.06);};
  $("#learnToolsBtn").onclick=function(){state.toolsReturn="learn";renderTimesTable(0);show("tools");};
  $("#learnBack").onclick=function(){
    var destination=state.learnReturn||"menu";show(destination);
    if(destination==="game"&&state.studyFromError){state.studyFromError=false;showTeach("solve");}
  };
  function openStudyTopic(op){
    updateStudyRecommendation();
    state.studyTab="understand";show("learn");selectStudyTopic(op,true);
  }
  function openStudyFromProgress(target){
    var row=target.closest(".mastery-row");if(!row)return;
    state.learnReturn="progress";state.studyFromError=false;
    openStudyTopic(row.dataset.op);
  }
  $("#masteryList").addEventListener("click",function(e){openStudyFromProgress(e.target);});
  $("#masteryList").addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" "){e.preventDefault();openStudyFromProgress(e.target);}
  });

  // ---- herramientas ----
  function renderTimesTable(selected){
    selected=Number(selected)||0;
    var picks=$("#tablePicks"),table=$("#timesTable"),html="<thead><tr><th scope='col'>×</th>";
    picks.innerHTML="";
    for(var p=1;p<=10;p++){
      var pickBtn=document.createElement("button");
      pickBtn.className="table-pick"+(p===selected?" active":"");pickBtn.type="button";
      pickBtn.dataset.tableNumber=p;pickBtn.textContent="×"+p;picks.appendChild(pickBtn);
      html+="<th scope='col' class='"+(p===selected?"col-highlight":"")+"' data-col='"+p+"'>"+p+"</th>";
    }
    html+="</tr></thead><tbody>";
    for(var r=1;r<=10;r++){
      html+="<tr data-row='"+r+"' class='"+(r===selected?"highlight":"")+"'><th scope='row'>"+r+"</th>";
      for(var c=1;c<=10;c++)html+="<td class='"+(c===selected?"col-highlight":"")+"' data-col='"+c+"'>"+(r*c)+"</td>";
      html+="</tr>";
    }
    table.innerHTML=html+"</tbody>";
  }
  $("#tablePicks").addEventListener("click",function(e){
    var btn=e.target.closest(".table-pick");if(btn)renderTimesTable(btn.dataset.tableNumber);
  });
  $("#timesTable").addEventListener("click",function(e){
    var row=e.target.closest("tr[data-row]");if(row)renderTimesTable(row.dataset.row);
  });

  // ---- menú ----
  function renderLevelList(){
    var list=$("#levelList"); list.innerHTML="";
    if(state.ops.length===0){
      list.innerHTML="<div class='lvlRow' style='justify-content:center;color:var(--muted);font-size:12px'>Elegí al menos una operación arriba</div>";
      return;
    }
    OPORDER.forEach(function(op){
      if(state.ops.indexOf(op)===-1) return;
      var cur=state.diffByOp[op]||"normal";
      var row=document.createElement("div"); row.className="lvlRow"; row.dataset.op=op;
      var picks=[["easy","F"],["normal","N"],["hard","D"]].map(function(p){
        var active=cur===p[0];
        return "<button class='lvlBtn' data-lvl='"+p[0]+"' data-active='"+(active?"1":"0")+"' aria-pressed='"+active+
          "' aria-label='"+OPNAME[op]+": "+(p[0]==="easy"?"fácil":p[0]==="normal"?"normal":"difícil")+"'>"+p[1]+"</button>";
      }).join("");
      row.innerHTML="<div class='nm2'><span class='s'>"+OPSYM[op]+"</span>"+OPNAME[op]+"</div>"+
        "<div class='lvlPick'>"+picks+"</div>";
      list.appendChild(row);
    });
  }
  function syncOps(){
    var sel=[];
    document.querySelectorAll(".op").forEach(function(o){
      o.setAttribute("aria-pressed",o.dataset.active==="1"?"true":"false");
      if(o.dataset.active==="1") sel.push(o.dataset.op);
    });
    state.ops=sel;
    activeProfile().ops=sel.slice();
    saveStore();
    renderLevelList();
  }
  $("#ops").addEventListener("click",function(e){
    var b=e.target.closest(".op"); if(!b)return;
    b.dataset.active = b.dataset.active==="1" ? "0" : "1";
    syncOps(); beep(440,.05);
  });
  $("#quick").addEventListener("click",function(e){
    var b=e.target.closest(".chip"); if(!b)return;
    var on = b.dataset.sel==="all" ? "1" : "0";
    document.querySelectorAll(".op").forEach(function(o){o.dataset.active=on;});
    syncOps(); beep(on==="1"?660:300,.06);
  });
  $("#allDiff").addEventListener("click",function(e){
    var b=e.target.closest(".chip"); if(!b)return;
    var lvl=b.dataset.all;
    OPORDER.forEach(function(op){state.diffByOp[op]=lvl;});
    activeProfile().diffByOp=state.diffByOp; saveStore();
    renderLevelList(); beep(520,.06);
  });
  $("#levelList").addEventListener("click",function(e){
    var b=e.target.closest(".lvlBtn"); if(!b)return;
    var row=b.closest(".lvlRow"), op=row.dataset.op, lvl=b.dataset.lvl;
    state.diffByOp[op]=lvl;
    activeProfile().diffByOp=state.diffByOp; saveStore();
    row.querySelectorAll(".lvlBtn").forEach(function(x){
      var on=x===b;x.dataset.active=on?"1":"0";x.setAttribute("aria-pressed",on?"true":"false");
    });
    beep(440,.05);
  });
  $("#customizeBtn").onclick=function(){show("customize");$("#customize").scrollTop=0;};
  $("#customizeBack").onclick=function(){show("menu");};
  $("#customizePlayBtn").onclick=startGame;
  $("#toolsBtn").onclick=function(){state.toolsReturn="menu";renderTimesTable(0);show("tools");$("#tools").scrollTop=0;};
  $("#toolsBack").onclick=function(){show(state.toolsReturn||"menu");};
  function renderProfiles(){
    var select=$("#profileSelect"); select.innerHTML="";
    Object.keys(store.profiles).sort().forEach(function(name){
      var o=document.createElement("option");o.value=name;o.textContent=name;
      if(name===store.active)o.selected=true;
      select.appendChild(o);
    });
  }
  function applyPreferences(){
    var p=activeProfile();
    state.mode=p.preferences.mode||"arcade";
    state.answerMode=p.preferences.answerMode||"mixed";
    state.targetRounds=Number(p.preferences.rounds)||10;
    soundOn=p.preferences.sound!==false;
    $("#answerMode").value=state.answerMode;
    $("#roundSetting").value=String(state.targetRounds);
    $("#vibrationSetting").checked=!!p.preferences.vibration;
    $("#contrastSetting").checked=!!p.preferences.contrast;
    $("#motionSetting").checked=!!p.preferences.motion;
    $("#textSetting").checked=!!p.preferences.largeText;
    $("#calmSetting").checked=!!p.preferences.calm;
    $("#soundBtn").textContent=soundOn?"🔊":"🔇";
    $("#soundBtn").setAttribute("aria-label",soundOn?"Desactivar sonido":"Activar sonido");
    document.body.classList.toggle("high-contrast",!!p.preferences.contrast);
    document.body.classList.toggle("reduce-motion",!!p.preferences.motion);
    document.body.classList.toggle("large-text",!!p.preferences.largeText);
    document.body.classList.toggle("calm-mode",!!p.preferences.calm);
    document.querySelectorAll(".mode").forEach(function(b){
      var on=b.dataset.mode===state.mode;b.dataset.active=on?"1":"0";b.setAttribute("aria-pressed",on?"true":"false");
    });
  }
  function applyProfile(name){
    if(!store.profiles[name])return;
    store.active=name;profile=activeProfile();
    state.diffByOp=profile.diffByOp;
    document.querySelectorAll(".op").forEach(function(o){
      o.dataset.active=profile.ops.indexOf(o.dataset.op)!==-1?"1":"0";
    });
    applyPreferences();renderProfiles();syncOps();renderStudy();saveStore();
    $("#profileProgress").textContent=profile.total?
      name+" · "+profile.correct+" respuestas bien de "+profile.total+" · "+Math.round(profile.correct/profile.total*100)+"%":
      name+" · todavía no hay partidas guardadas";
  }
  $("#profileSelect").onchange=function(){applyProfile(this.value);};
  function cleanProfileName(value){
    return String(value||"").replace(/[<>&"'`]/g,"").replace(/[\u0000-\u001f\u007f]/g,"").trim().replace(/\s+/g," ").slice(0,18);
  }
  function openProfileDialog(){
    state.lastFocus=document.activeElement;
    $("#profileNameInput").value=store.active;
    $("#profileDialog").classList.add("show");$("#profileDialog").setAttribute("aria-hidden","false");
    setTimeout(function(){$("#profileNameInput").focus();$("#profileNameInput").select();},30);
  }
  function closeProfileDialog(){$("#profileDialog").classList.remove("show");$("#profileDialog").setAttribute("aria-hidden","true");(state.lastFocus||$("#manageProfileBtn")).focus();}
  $("#manageProfileBtn").onclick=openProfileDialog;
  $("#closeProfileBtn").onclick=closeProfileDialog;
  $("#createProfileBtn").onclick=function(){
    var name=cleanProfileName($("#profileNameInput").value);
    if(!name){$("#announcer").textContent="Escribí un nombre para el perfil";return;}
    if(store.profiles[name]){$("#announcer").textContent="Ese perfil ya existe";return;}
    store.profiles[name]=blankProgress();applyProfile(name);closeProfileDialog();
  };
  $("#renameProfileBtn").onclick=function(){
    var old=store.active,name=cleanProfileName($("#profileNameInput").value);
    if(!name||name===old)return;
    if(store.profiles[name]){$("#announcer").textContent="Ese perfil ya existe";return;}
    store.profiles[name]=store.profiles[old];delete store.profiles[old];applyProfile(name);closeProfileDialog();
  };
  $("#deleteProfileBtn").onclick=function(){
    var names=Object.keys(store.profiles);
    if(names.length<=1){$("#announcer").textContent="Tiene que quedar al menos un perfil";return;}
    if(!confirm("¿Eliminar el perfil "+store.active+" y todo su progreso?"))return;
    delete store.profiles[store.active];applyProfile(Object.keys(store.profiles)[0]);closeProfileDialog();
  };
  $("#modes").addEventListener("click",function(e){
    var b=e.target.closest(".mode");if(!b)return;
    state.mode=b.dataset.mode;
    activeProfile().preferences.mode=state.mode;saveStore();applyPreferences();beep(520,.05);
  });
  $("#answerMode").onchange=function(){
    state.answerMode=this.value;activeProfile().preferences.answerMode=this.value;saveStore();
  };
  $("#roundSetting").onchange=function(){
    state.targetRounds=Number(this.value)||10;activeProfile().preferences.rounds=state.targetRounds;saveStore();
  };
  $("#vibrationSetting").onchange=function(){activeProfile().preferences.vibration=this.checked;saveStore();};
  $("#contrastSetting").onchange=function(){
    activeProfile().preferences.contrast=this.checked;document.body.classList.toggle("high-contrast",this.checked);saveStore();
  };
  $("#motionSetting").onchange=function(){
    activeProfile().preferences.motion=this.checked;document.body.classList.toggle("reduce-motion",this.checked);saveStore();
  };
  $("#textSetting").onchange=function(){
    activeProfile().preferences.largeText=this.checked;document.body.classList.toggle("large-text",this.checked);saveStore();
  };
  $("#calmSetting").onchange=function(){
    activeProfile().preferences.calm=this.checked;document.body.classList.toggle("calm-mode",this.checked);saveStore();
  };
  $("#progressBtn").onclick=function(){renderProgress();show("progress");$("#progress").scrollTop=0;};
  $("#progressBack").onclick=function(){show("menu");};
  $("#exportBtn").onclick=function(){
    var blob=new Blob([JSON.stringify(store,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="mate-arcade-progreso.json";a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  };
  function finiteCount(value,max){return Math.min(max,Math.max(0,Math.floor(Number(value)||0)));}
  function sanitizeImportedStore(incoming){
    if(!incoming||typeof incoming!=="object"||!incoming.profiles||typeof incoming.profiles!=="object")return null;
    var names=Object.keys(incoming.profiles).slice(0,12),profiles={};
    names.forEach(function(rawName){
      var name=cleanProfileName(rawName),source=incoming.profiles[rawName];
      if(!name||profiles[name]||!source||typeof source!=="object")return;
      var p=blankProgress();
      ["best","total","correct","sessions","practiceSessions","reviewSessions","bestCombo"].forEach(function(key){
        p[key]=finiteCount(source[key],1000000);
      });
      p.correct=Math.min(p.correct,p.total);
      p.ops=Array.isArray(source.ops)?source.ops.filter(function(op,i,a){return DEFAULT_OPS.indexOf(op)!==-1&&a.indexOf(op)===i;}):p.ops;
      if(!p.ops.length)p.ops=DEFAULT_OPS.slice();
      p.unlocked=Array.isArray(source.unlocked)?source.unlocked.filter(function(id){
        return ACHIEVEMENTS.some(function(a){return a.id===id;});
      }):[];
      var prefs=source.preferences&&typeof source.preferences==="object"?source.preferences:{};
      p.preferences.mode=(["arcade","practice","review"].indexOf(prefs.mode)!==-1)?prefs.mode:"arcade";
      p.preferences.answerMode=(["mixed","choice","write"].indexOf(prefs.answerMode)!==-1)?prefs.answerMode:"mixed";
      p.preferences.rounds=([5,10,15,20].indexOf(Number(prefs.rounds))!==-1)?Number(prefs.rounds):10;
      ["sound","vibration","contrast","motion","largeText","calm"].forEach(function(key){p.preferences[key]=prefs[key]!==false;});
      ["contrast","motion","largeText","calm"].forEach(function(key){p.preferences[key]=prefs[key]===true;});
      DEFAULT_OPS.forEach(function(op){
        var diff=source.diffByOp&&source.diffByOp[op];p.diffByOp[op]=["easy","normal","hard"].indexOf(diff)!==-1?diff:"normal";
        var raw=source.byOp&&source.byOp[op];
        if(raw&&typeof raw==="object"){
          var ok=finiteCount(raw.ok,1000000),fail=finiteCount(raw.fail,1000000);
          p.byOp[op]={ok:ok,fail:fail,errors:{},lastAttemptAt:finiteCount(raw.lastAttemptAt,4102444800000),recent:[]};
          if(raw.errors&&typeof raw.errors==="object")Object.keys(raw.errors).slice(0,20).forEach(function(type){
            p.byOp[op].errors[String(type).slice(0,40)]=finiteCount(raw.errors[type],100000);
          });
          if(Array.isArray(raw.recent))p.byOp[op].recent=raw.recent.slice(-12).map(function(a){
            return {ok:a&&a.ok===true,difficulty:["easy","normal","hard"].indexOf(a&&a.difficulty)!==-1?a.difficulty:"normal",
              errorType:String(a&&a.errorType||"").slice(0,40),at:finiteCount(a&&a.at,4102444800000)};
          });
        }
        var study=source.studyByOp&&source.studyByOp[op];
        if(study&&typeof study==="object")p.studyByOp[op]={ok:finiteCount(study.ok,1000000),fail:finiteCount(study.fail,1000000),completed:finiteCount(study.completed,100000)};
      });
      profiles[name]=p;
    });
    var profileNames=Object.keys(profiles);if(!profileNames.length)return null;
    var active=cleanProfileName(incoming.active);if(!profiles[active])active=profileNames[0];
    return {version:4,active:active,profiles:profiles};
  }
  $("#importInput").onchange=function(){
    var file=this.files&&this.files[0];if(!file)return;
    if(file.size>1000000){$("#announcer").textContent="El archivo es demasiado grande";this.value="";return;}
    var reader=new FileReader();
    reader.onload=function(){
      var incoming;
      try{incoming=JSON.parse(reader.result);}catch(e){$("#announcer").textContent="El archivo no es un progreso válido";return;}
      incoming=sanitizeImportedStore(incoming);
      if(!incoming){$("#announcer").textContent="El archivo no contiene perfiles válidos";return;}
      store=incoming;
      saveStore();renderProfiles();applyProfile(store.active);renderProgress();
      $("#announcer").textContent="Progreso importado";
    };
    reader.readAsText(file);this.value="";
  };
  $("#typeAnswer").onsubmit=function(e){
    e.preventDefault();answer($("#answerInput").value,null);
  };
  function closePause(){$("#pauseOverlay").classList.remove("show");$("#pauseOverlay").setAttribute("aria-hidden","true");state.paused=false;(state.lastFocus||$("#pauseBtn")).focus();}
  function pauseGame(){
    if(state.paused||state.completed)return;
    state.lastFocus=document.activeElement;state.paused=true;clearInterval(state.timer);$("#pauseOverlay").classList.add("show");$("#pauseOverlay").setAttribute("aria-hidden","false");$("#resumeBtn").focus();
  }
  function resumeGame(){
    closePause();
    if(state.mode==="arcade"&&!state.locked&&!$("#teach").classList.contains("show"))runTimer();
  }
  $("#pauseBtn").onclick=pauseGame;
  $("#resumeBtn").onclick=resumeGame;
  $("#pauseMenuBtn").onclick=function(){closePause();hideTeach();applyProfile(store.active);show("menu");};
  $("#quitBtn").onclick=function(){clearInterval(state.timer);closePause();hideTeach();applyProfile(store.active);show("menu");};
  $("#playBtn").onclick=startGame;
  $("#againBtn").onclick=startGame;
  $("#menuBtn").onclick=function(){applyProfile(store.active);show("menu");};
  $("#soundBtn").onclick=function(){
    soundOn=!soundOn;
    activeProfile().preferences.sound=soundOn;saveStore();
    $("#soundBtn").textContent=soundOn?"🔊":"🔇";
    $("#soundBtn").setAttribute("aria-label",soundOn?"Desactivar sonido":"Activar sonido");
    if(soundOn)beep(660,.08);
  };
  document.addEventListener("visibilitychange",function(){
    if(document.hidden&&$("#game").classList.contains("active")&&!state.paused&&!state.completed)pauseGame();
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
      if($("#profileDialog").classList.contains("show"))closeProfileDialog();
      else if($("#pauseOverlay").classList.contains("show"))resumeGame();
      else if($("#game").classList.contains("active"))pauseGame();
    }
    var dialog=$("#profileDialog").classList.contains("show")?$("#profileDialog"):$("#pauseOverlay").classList.contains("show")?$("#pauseOverlay"):null;
    if(dialog&&e.key==="Tab"){
      var focusable=Array.from(dialog.querySelectorAll("button,input,select,[tabindex]:not([tabindex='-1'])")).filter(function(el){return !el.disabled;});
      if(!focusable.length)return;
      var first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });

  var legacyBest=Number(safeGet("mateArcadeBest")||0);
  if(legacyBest>activeProfile().best){activeProfile().best=legacyBest;saveStore();}
  renderProfiles();
  applyProfile(store.active);
})();
