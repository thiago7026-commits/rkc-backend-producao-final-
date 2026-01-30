export function getRoute(){
  const hash = (location.hash || "#/dashboard").replace("#", "");
  return hash.startsWith("/") ? hash : `/${hash}`;
}
export function setRoute(path){
  location.hash = `#${path.startsWith("/") ? path : `/${path}`}`;
}
export function onRouteChange(fn){
  window.addEventListener("hashchange", fn);
}
