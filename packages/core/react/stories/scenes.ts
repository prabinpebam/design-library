/** Example slides for the Carousel stories: simple landscapes drawn for these examples (no photographs or third-party assets). */
const scene = (sky: [string, string], sun: string, hills: [string, string, string], sunY: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="640" height="360" fill="url(#s)"/><circle cx="470" cy="${sunY}" r="46" fill="${sun}"/><path d="M0 250 C120 190 220 210 330 240 S520 200 640 230 V360 H0z" fill="${hills[0]}"/><path d="M0 290 C140 250 260 270 380 295 S560 270 640 285 V360 H0z" fill="${hills[1]}"/><path d="M0 330 C160 305 330 320 640 315 V360 H0z" fill="${hills[2]}"/></svg>`,
  )}`;

export const scenes = [
  { src: scene(['#9ad0f5', '#e8f4fb'], '#ffd166', ['#7fb77e', '#5a9a5b', '#3f7a46'], 90), alt: 'Rolling green hills under a pale blue sky and a yellow sun.', label: 'Morning hills', caption: 'Morning over the hills, before anyone is up.' },
  { src: scene(['#f6a679', '#fde2c4'], '#fff1c1', ['#c98b6b', '#a86a52', '#7d4b3c'], 170), alt: 'Copper hills under an orange sky with a low sun.', label: 'Desert evening', caption: 'The desert in the last hour of light.' },
  { src: scene(['#2b2d5c', '#5b5f9e'], '#f2f2f2', ['#3e4a7a', '#2f3866', '#1f2550'], 80), alt: 'Dark blue hills under a night sky with a white moon.', label: 'Night ridge', caption: 'The ridge at night, by moonlight.' },
  { src: scene(['#c7e9e4', '#f2fbf9'], '#ffe9a8', ['#8cc9be', '#5fa99c', '#3d8577'], 120), alt: 'Teal hills under a mint sky and a soft sun.', label: 'Lagoon', caption: 'Low tide at the lagoon.' },
  { src: scene(['#d9c2f0', '#f6eefc'], '#ffd6e8', ['#a98bc9', '#8a6bb0', '#6a4f92'], 110), alt: 'Violet hills under a lilac sky and a pink sun.', label: 'Lavender fields', caption: 'The lavender fields in July.' },
  { src: scene(['#b9d7ea', '#eef5fa'], '#ffffff', ['#e7eef3', '#c9d6df', '#a9b9c5'], 100), alt: 'Snow-covered hills under a cold blue sky and a white sun.', label: 'First snow', caption: 'The first snow on the hills.' },
  { src: scene(['#f7d794', '#fbeed0'], '#ff9f43', ['#e0a458', '#c4823a', '#9b6129'], 140), alt: 'Golden hills under a warm sky and an orange sun.', label: 'Harvest', caption: 'Harvest time in the valley.' },
];
