export const decodeHtml = (html: string): string =>  {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const addStyle = (id: string, style: string): void => {
  let styleNode = document.getElementById(id);
  if(!styleNode) {
    styleNode = document.createElement("style");
    styleNode.setAttribute("type", "text/css");
    styleNode.setAttribute("id", id);
    document.getElementsByTagName("head")[0].appendChild(styleNode);
  }
  styleNode.innerHTML = style;
};

export const addExternalStyle = (id: string, url: string): void => {
  const css = `@import url("${url}");`;
  addStyle(id, css);
};

export const throttle = (fn: () => any): () => void => {
  let ticking = false;
  return (): void => {
    if(!ticking) {
      window.requestAnimationFrame(() => {
        fn();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// const throttle = (fn: () => any, interval: number) => {
//   let lastCall: number;
//   let timeoutId: number;
//   return function () {
//     const now = new Date().getTime();
//     if (lastCall && now < lastCall + interval) {
//       // if we are inside the interval we wait
//       window.clearTimeout(timeoutId);
//       timeoutId = window.setTimeout(function () {
//         lastCall = now;
//         fn();
//       }, interval - (now - lastCall));
//     } else {
//       lastCall = now;
//       fn();
//     }
//   };
// };

