!function(e,t,n,r,a){var o="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},l="function"==typeof o.parcelRequire&&o.parcelRequire,s="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function u(n,r){if(!t[n]){if(!e[n]){var a="function"==typeof parcelRequire&&parcelRequire;if(!r&&a)return a(n,!0);if(l)return l(n,!0);if(s&&"string"==typeof n)return s(n);var o=new Error("Cannot find module '"+n+"'");throw o.code="MODULE_NOT_FOUND",o}c.resolve=function(t){return e[n][1][t]||t},c.cache={};var i=t[n]=new u.Module(n);e[n][0].call(i.exports,c,i,i.exports,this)}return t[n].exports;function c(e){return u(c.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=t,u.parent=l,u.register=function(t,n){e[t]=[function(e,t){t.exports=n},{}]},o.parcelRequire=u;for(var i=0;i<n.length;i++)u(n[i]);var c=u("7COC9");"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd&&define((function(){return c}))}({"7COC9":[function(e,t,n){"use strict";var r,a=u(e("react")),o=u(e("react-dom")),l=(r=e("classnames"))&&r.__esModule?r:{default:r};function s(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return s=function(){return e},e}function u(e){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var t=s();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if(Object.prototype.hasOwnProperty.call(e,a)){var o=r?Object.getOwnPropertyDescriptor(e,a):null;o&&(o.get||o.set)?Object.defineProperty(n,a,o):n[a]=e[a]}return n.default=e,t&&t.set(e,n),n}const i=e=>{const[t,n]=a.useState(!1),[r,o]=a.useState(!1),[s,u]=a.useState(""),i=a.useRef(null),{message:c,setMessage:f}=e,d=null!=c,[m]=a.useState((-4*Math.random()).toFixed(1)+"s"),[p]=a.useState((Math.random()+3.5).toFixed(1)+"s"),v=a.createElement("form",{onSubmit:e=>{e.preventDefault(),o(!1),u(""),f(s)}},a.createElement("input",{type:"text",value:s,onChange:e=>u(e.currentTarget.value),onBlur:()=>{o(!1),u(""),f(s)},placeholder:"Leave a message...",className:"composer",ref:i}));return a.createElement("div",{className:(0,l.default)("candle-frame",{lit:d}),onClick:()=>(e=>{t||null!=c||n(!0),(t||null==c)&&o(!0);const r=i.current;null!=r&&r.focus(),f(e?"":null)})(!d)},a.createElement("div",{className:(0,l.default)("candle",{unlit:!d}),style:{animationDelay:m,animationDuration:p}},a.createElement("div",{className:"flame"},a.createElement("div",{className:"shadows"}),a.createElement("div",{className:"orange",style:{animationDelay:m,animationDuration:p}}),a.createElement("div",{className:"blue"})),a.createElement("div",{className:"wick"}),a.createElement("div",{className:"wax"})),a.createElement("div",{className:(0,l.default)("message",{composing:r})},d&&c,a.createElement("div",{className:"composer-holder"},v)))},c=()=>{const[e,t]=a.useState(null),[n,r]=a.useState(!1),[o,l]=a.useState([]);if(a.useEffect(()=>{const e=new WebSocket("wss://experiments-do.ajaska.com:443/candles/");return e.onmessage=e=>{const t=JSON.parse(e.data);l(t)},e.onerror=e=>{console.log("websocket error",e),t(null),r(!0)},t(e),()=>{e.close()}},[]),null==e&&!n)return a.createElement("div",null,"Loading...");if(null==e)return a.createElement("div",null,"Error connecting to server");const s=[...Array(20).keys()].map(t=>a.createElement(i,{key:t,message:o[t],setMessage:n=>e.send(JSON.stringify({message:n,i:t}))}));return a.createElement("div",{className:"container"},s)};o.render(a.createElement(c,null),document.getElementById("react"))},{react:"9iBJD","react-dom":"Ux6qv",classnames:"5KZJx"}],"5KZJx":[function(e,t,n){
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
!function(){"use strict";var e={}.hasOwnProperty;function n(){for(var t=[],r=0;r<arguments.length;r++){var a=arguments[r];if(a){var o=typeof a;if("string"===o||"number"===o)t.push(a);else if(Array.isArray(a)&&a.length){var l=n.apply(null,a);l&&t.push(l)}else if("object"===o)for(var s in a)e.call(a,s)&&a[s]&&t.push(s)}}return t.join(" ")}void 0!==t&&t.exports?(n.default=n,t.exports=n):window.classNames=n}()},{}]},{},["7COC9"]);
//# sourceMappingURL=index.e0a7153d.js.map