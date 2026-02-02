export function $(sel){ return document.querySelector(sel); }
export function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c);
  return n;
}

export function toast(title, message){
  const root = document.getElementById("toast");
  if (!root) return;
  const item = el("div",{class:"item"},[
    el("strong",{},[document.createTextNode(title)]),
    el("small",{},[document.createTextNode(message)])
  ]);
  root.append(item);
  setTimeout(()=> item.remove(), 5200);
}

export function badge(text, ok=true){
  return `<span class="badge ${ok ? "ok" : "off"}">${text}</span>`;
}

export function openModal(html){
  const b = document.getElementById("modalBackdrop");
  if (!b) return;
  b.innerHTML = `<div class="modal">${html}</div>`;
  b.style.display = "flex";
}

export function closeModal(){
  const b = document.getElementById("modalBackdrop");
  if (!b) return;
  b.style.display = "none";
  b.innerHTML = "";
}
