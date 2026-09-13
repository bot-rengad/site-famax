// État global "scroll actif" partagé :
// - ScrollTools l'écrit (vrai pendant le scroll, faux ~140ms après l'arrêt)
// - le viewer 3D le lit pour geler son rendu pendant le scroll et laisser
//   tout le GPU au compositor (scroll au Hz natif, zéro concurrence).
let scrolling = false

export function setScrolling(v: boolean) {
  scrolling = v
}

export function isScrolling() {
  return scrolling
}
