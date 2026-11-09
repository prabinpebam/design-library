/** Pictures drawn for the chat app's view data (no photographs or third-party assets): simple landscapes as SVG data addresses. */
export const drawn = (sky: [string, string], sun: string, hills: [string, string, string], sunY: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="640" height="480" fill="url(#s)"/><circle cx="440" cy="${sunY}" r="52" fill="${sun}"/><path d="M0 320 C120 250 230 270 330 300 S520 250 640 290 V480 H0z" fill="${hills[0]}"/><path d="M0 370 C150 320 270 345 390 372 S560 340 640 360 V480 H0z" fill="${hills[1]}"/><path d="M0 425 C170 395 330 410 640 405 V480 H0z" fill="${hills[2]}"/></svg>`,
  )}`;

