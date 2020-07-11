!function(e,t,n,o,r){var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i="function"==typeof a.parcelRequire&&a.parcelRequire,s="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function d(n,o){if(!t[n]){if(!e[n]){var r="function"==typeof parcelRequire&&parcelRequire;if(!o&&r)return r(n,!0);if(i)return i(n,!0);if(s&&"string"==typeof n)return s(n);var a=new Error("Cannot find module '"+n+"'");throw a.code="MODULE_NOT_FOUND",a}u.resolve=function(t){return e[n][1][t]||t},u.cache={};var l=t[n]=new d.Module(n);e[n][0].call(l.exports,u,l,l.exports,this)}return t[n].exports;function u(e){return d(u.resolve(e))}}d.isParcelRequire=!0,d.Module=function(e){this.id=e,this.bundle=d,this.exports={}},d.modules=e,d.cache=t,d.parent=i,d.register=function(t,n){e[t]=[function(e,t){t.exports=n},{}]},a.parcelRequire=d;for(var l=0;l<n.length;l++)d(n[l]);var u=d("7eFUP");"object"==typeof exports&&"undefined"!=typeof module?module.exports=u:"function"==typeof define&&define.amd&&define((function(){return u}))}({"7eFUP":[function(e,t,n){"use strict";var o,r=(o=e("p5"))&&o.__esModule?o:{default:o},a=e("./sketch");new r.default(e=>{let t;e.setup=()=>{t=(0,a.setup)(e),t.p5=e},e.draw=()=>{(0,a.updateState)(t),(0,a.draw)(e,t)}},document.getElementById("p5canvas"))},{p5:"62Beh","./sketch":"PE2VI"}],PE2VI:[function(e,t,n){"use strict";var o,r;Object.defineProperty(n,"__esModule",{value:!0}),n.setup=function(e){const t=e.createCanvas(a,i).elt;t.style.width="100%",t.style.height="100%";let n=20,o=r.INTRO,s=1;if(localStorage.getItem("x"))n=300,o=r.DOWNPOUR,s=4;else{const e=document.getElementById("text");e.innerText="It is raining...",e.className="text fade-in"}const d=Array(n).fill({}).map(e=>({x:Math.random()*a,y:Math.random()*i,v:s,selected:!1,splattering:999}));return{p5:e,rain:d,mode:o}},n.updateState=function(e){let t=1;switch(e.mode){case r.INTRO:break;case r.SELECT:t=.1;break;case r.STORY:t=0;break;case r.DOWNPOUR:}for(const n of e.rain)if(999===n.splattering){n.y+=n.v*t;const e=.01*(.5-Math.random());n.v=Math.min(n.v+(.01+e)*t,5),(n.y>i-80&&Math.random()<.6||n.y>i-20)&&(n.splattering=10)}else n.splattering-=1*t;if(e.rain=e.rain.filter(e=>e.splattering>0),e.mode!==r.DOWNPOUR)Math.random()<.2*t&&e.rain.push({x:Math.random()*a,y:10*Math.random(),v:1,selected:!1,splattering:999});else for(let t=0;t<2;t++)e.rain.push({x:Math.random()*a,y:10*Math.random(),v:4,selected:!1,splattering:999});if(180===e.p5.frameCount){document.getElementById("text").className="text fade-out"}if(e.p5.frameCount>300&&e.mode===r.INTRO){e.mode=r.SELECT;const t=document.getElementById("text");t.innerText="Choose your rain drop",t.className="text fade-in",e.p5.mouseClicked=()=>{const n=e.p5.mouseX,o=e.p5.mouseY,a=e.rain.find(e=>Math.abs(n-e.x)<8&&Math.abs(o-e.y)<8);return a&&(a.selected=!0,e.mode=r.STORY,t.className="text fade-out",setTimeout(()=>{t.innerText="This is your rain drop.",t.className="text fade-in"},1e3),setTimeout(()=>{t.className="text fade-out"},4e3),setTimeout(()=>{t.innerText="Please keep an eye on it, and take good care of it.",t.className="text fade-in"},5e3),setTimeout(()=>{t.className="text fade-out"},8e3),setTimeout(()=>{t.innerText="You won't be getting another one.",t.className="text fade-in"},9e3),setTimeout(()=>{t.className="text fade-out"},12e3),setTimeout(()=>{e.mode=r.DOWNPOUR,localStorage.setItem("x","1")},13e3)),!1}}},n.draw=function(e,t){e.background(64,64,64);let n=!1;const o=t.mode===r.SELECT;for(const a of t.rain)if(999===a.splattering){e.strokeWeight(2),e.stroke(180,180,230),e.point(a.x,a.y);const i=Math.round(2.5*a.v);for(let t=0;t<i;t++)e.stroke(180+10*(t+1),180+10*(t+1),230+5*(t+1)),e.point(a.x,a.y-t);a.selected&&t.mode!==r.DOWNPOUR?(e.strokeWeight(2),e.stroke("#FF0000"),e.noFill(),e.circle(a.x,a.y-i/2,24)):o&&Math.abs(e.mouseX-a.x)<8&&Math.abs(e.mouseY-a.y)<8&&(e.strokeWeight(1),e.stroke("#FF8888"),e.noFill(),e.circle(a.x,a.y-i/2,24),n=!0)}else{e.strokeWeight(1),e.stroke(180,180,230);const t=[{dx:-.7,dy:.7},{dx:0,dy:1},{dx:.7,dy:.7}];for(const n of t){const{dx:t,dy:o}=n;e.point(a.x+t*(10-a.splattering),a.y-o*(10-a.splattering))}}n&&o?e.cursor("pointer"):e.cursor("default");return t},((o=e("p5"))&&o.__esModule?o:{default:o}).default.disableFriendlyErrors=!0,function(e){e[e.INTRO=1]="INTRO",e[e.SELECT=2]="SELECT",e[e.STORY=3]="STORY",e[e.DOWNPOUR=4]="DOWNPOUR"}(r||(r={}));let a=window.innerWidth,i=window.innerHeight-4;(a>1024||i>1024)&&(a>i?(i*=1024/a,a=1024):(a*=1024/i,i=1024))},{p5:"62Beh"}]},{},["7eFUP"]);
//# sourceMappingURL=index.62aa53a1.js.map
