// ─────────────────────────────────────────────────────────────────────────────
//  YOUR PORTFOLIO CONTENT — edit this file.
//  Every text can be a plain string or an object { pt, en, ja }.
//  Entries marked `sample: true` are placeholders: replace or delete them.
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  name: 'Luis Augusto',
  nameJa: 'ルイス・アウグスト', // used when the site is in Japanese
  role: {
    pt: 'Desenvolvedor & criador de experiências interativas e jogos',
    en: 'Developer & Interactive Experience and Game Creator',
    ja: '開発者・インタラクティブ体験／ゲームクリエイター',
  },
  location: { pt: 'Brasil', en: 'Brazil', ja: 'ブラジル' },
  bio: {
    pt: [
      'Oi! Eu sou o Luis, um desenvolvedor brasileiro que cresceu entre vários jogos, inclusive os da Nintendo e adoro Miis!.',
      'Gosto de construir coisas muito interativas, como jogos! e sites descolados que dão vontade de clicar: interfaces caprichadas, animações fluidas e um pouco de 3D sempre que dá. Este portfólio é a prova — até o meu Mii veio junto.',
      'E além disso faço muito desenvolvimento de jogos, que é meu foco como desenvolvedor, adoro fazer jogos!.',
    ],
    en: [
      "Hi! I'm Luis, a Brazilian developer who grew up playing all kinds of games, including Nintendo games, and I absolutely love Miis!",
      "I love building interactive things, like games, and cool websites that make you want to click around: polished interfaces, smooth animations, and a bit of 3D whenever possible. This portfolio is proof of that — even my Mii came along!",
      "On top of that, game development is my main focus as a developer. I really love making games!",
    ],
    ja: [
      'こんにちは！ルイスです。ブラジル出身の開発者で、任天堂のゲームをはじめ、いろいろなゲームに囲まれて育ちました。Miisも大好きです！',
      'ゲームのようなインタラクティブな作品や、思わずクリックしたくなるクールなウェブサイトを作るのが好きです。細部までこだわったUI、滑らかなアニメーション、そしてできる限り取り入れる3D。このポートフォリオがその証拠です──僕のMiiも一緒にやって来ました！',
      'そして、開発者として一番力を入れているのはゲーム開発です。ゲームを作ることが本当に大好きです！',
    ],
  },
  // "Mii Card" fields (StreetPass style). Add, remove or edit freely.
  card: [
    { label: { pt: 'Hobby', en: 'Hobby', ja: 'しゅみ' }, value: { pt: 'Games, desenvolver Games, Desenhar e Modelar 3D', en: 'Gaming, Game Development, Drawing & 3D Modeling', ja: 'ゲーム、ゲーム開発、イラスト、3Dモデリング' } },
    { label: { pt: 'Console favorito', en: 'Favorite console', ja: 'すきなゲーム機' }, value: 'Nintendo 3DS' },
    { label: { pt: 'Jogos Favoritos:', en: 'Favorite Games:', ja: '好きなゲーム：' }, value: { pt: 'Final Fantasy e Monster Hunter', en: 'Final Fantasy & Monster Hunter', ja: 'ファイナルファンタジーとモンスターハンター' }, swatch: '#d92b2b' },
  ],
  greeting: { pt: 'Prazer em conhecer!', en: "Nice to meet you!", ja: 'はじめまして！' },
  spokenLanguages: [
    { label: { pt: 'Português', en: 'Portuguese', ja: 'ポルトガル語' }, level: { pt: 'Nativo', en: 'Native', ja: 'ネイティブ' } },
    { label: { pt: 'Inglês', en: 'English', ja: '英語' }, level: { pt: 'Avançado', en: 'Advanced', ja: '上級' } },
    { label: { pt: 'Japonês', en: 'Japanese', ja: '日本語' }, level: { pt: 'Estudando', en: 'Learning', ja: '勉強中' } },
  ],

  // TODO: put your public email here (left empty on purpose).
  email: 'luisaugustomarquescosta@gmail.com',
  // TODO: drop your résumé PDF in /public (e.g. public/cv.pdf) and set './cv.pdf'.
  cvUrl: '',
};

// Social / contact links shown as a 3DS-style friend list.
export const friends = [
  {
    id: 'github',
    label: 'GitHub',
    handle: '@LuisAugusto2005',
    url: 'https://github.com/LuisAugusto2005',
    color: '#24292f',
    code: '2005-0000-1337',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: { pt: 'Luis Augusto', en: 'Luis Augusto', ja: 'Luis Augusto' },
    url: '', // TODO: https://www.linkedin.com/in/your-profile
    color: '#0a66c2',
    code: '0000-0000-0000',
  },
  {
    id: 'email',
    label: 'E-mail',
    handle: { pt: 'Escreva uma carta acima', en: 'Write a letter above', ja: '上で手紙を書いてね' },
    url: '', // filled automatically from profile.email
    color: '#18a8e8',
    code: '1234-5678-9012',
  },
];

// Projects appear as game cases on a shelf.
// cover: two gradient colors + an emoji/short glyph. image: optional path in /public.
// band: 'wii' (white), 'ds' (red) or 'wiiu' (blue) top band style.
export const projects = [
  {
    id: 'nontendofolio',
    title: 'NintendoFolio',
    band: 'wiiu',
    bandLabel: 'WEB',
    cover: { from: '#7fdcff', to: '#1679d6', glyph: '✦' },
    year: '2026',
    role: { pt: 'Design, 3D e código', en: 'Design, 3D & code', ja: 'デザイン・3D・コーディング' },
    tags: ['JavaScript', 'three.js', 'CSS', 'Web Audio', 'Vite'],
    summary: {
      pt: 'Este portfólio! Um menu no estilo Wii/3DS com Mii 3D animado, trilha sonora gerada no navegador e três idiomas.',
      en: 'This very portfolio! A Wii/3DS-style menu with an animated 3D Mii, an in-browser generated soundtrack and three languages.',
      ja: 'このポートフォリオ！アニメーションする3D Mii、ブラウザで生成されるBGM、3か国語に対応したWii/3DS風メニュー。',
    },
    links: { live: '', code: 'https://github.com/LuisAugusto2005/NontendoFolio-Portifolio' },
  },
  {
    id: 'my-cool-mii',
    title: 'MyCoolMii 3D',
    band: 'ds',
    bandLabel: '3D',
    cover: { from: '#ff8a8a', to: '#c81e2b', glyph: '◕‿◕' },
    year: '2026',
    role: { pt: 'Modelagem e rigging', en: 'Modeling & rigging', ja: 'モデリング・リギング' },
    tags: ['Blender', 'glTF', 'Rigging'],
    summary: {
      pt: 'Meu próprio Mii em 3D, preparado no Blender com esqueleto completo e exportado em glTF — é ele que te recebe no menu.',
      en: 'My own Mii in 3D, prepared in Blender with a full skeleton and exported as glTF — he is the one greeting you on the menu.',
      ja: 'Blenderでスケルトンまで用意してglTFで書き出した、ぼく自身の3D Mii。メニューで出迎えてくれるのが彼です。',
    },
    links: { live: '', code: '' },
  },
  {
    id: 'sample-game',
    // sample: true,
    title: { pt: 'Projeto Atlas', en: 'Project Atlas', ja: 'プロジェクト・アトラス' },
    band: 'wii',
    bandLabel: 'GAME',
    cover: { from: '#8af2f2', to: '#2fae4f', glyph: '°u°' },
    year: '20XX',
    role: { pt: 'Diretor de Jogo', en: 'Game Director', ja: 'ゲームディレクター' },
    tags: ['Cultural', 'Unity'],
    summary: {
      pt: 'Jogo sobre explorar diversas culturas com interação de NPCs, IA Navegadora e Visuais carismaticos.',
      en: 'A game about exploring diverse cultures, featuring NPC interactions, navigation AI, and charming visuals.',
      ja: 'さまざまな文化を探索するゲーム。NPCとの交流、ナビゲーションAI、魅力的なビジュアルが特徴です。',
    },
    links: { live: '', code: '' },
  },
  {
    id: 'aero-portifolio',
    // sample: true,
    title: { pt: 'Portifolio Frutiger Aero', en: 'Frutiger Aero Portfolio', ja: 'フルティガー・エアロのポートフォリオ' },
    band: 'ds',
    bandLabel: 'WEB',
    cover: { from: '#8aebff', to: '#fff3e4', glyph: '🌢' },
    year: '2026',
    role: { pt: 'Design e código', en: 'Design and development', ja: 'デザイン・開発' },
    tags: ['Vibes', 'Aero', 'JavaScript', 'CSS'],
    summary: {
      pt: 'Outro portfólio além desse! Com visual extremamente inspirado em Frutiger Aero e animações de menu de Persona 3 Reload! Com três idiomas.',
      en: 'Another portfolio besides this one! Featuring a visual style heavily inspired by Frutiger Aero and menu animations inspired by Persona 3 Reload. Available in three languages.',
      ja: 'このポートフォリオとは別に制作した、もうひとつのポートフォリオ！Frutiger Aeroに強くインスパイアされたビジュアルと、『ペルソナ3 リロード』を思わせるメニューアニメーションが特徴。3言語に対応しています。もうひとつのサンプル。プロジェクトごとにゲームケースとして棚に並びます。',
    },
    links: { live: 'https://luisaugusto2005.github.io/Aerofolio-Potifolio/', code: '' },
  },
];

// Skill meter (level 1–5) and badge collection.
export const skills = {
  meters: [
    { label: { pt: 'Front-end', en: 'Front-end', ja: 'フロントエンド' }, level: 4, color: '#22b5f0' },
    { label: { pt: '3D & animação', en: '3D & animation', ja: '3D・アニメーション' }, level: 3, color: '#ff5a5f' },
    { label: { pt: 'UI & design', en: 'UI & design', ja: 'UI・デザイン' }, level: 4, color: '#3fbf5a' },
    { label: { pt: 'Back-end', en: 'Back-end', ja: 'バックエンド' }, level: 2, color: '#f6a821' },
  ],
  // glyph: short text drawn on the badge. color: badge color.
  badges: [
    { name: 'HTML', glyph: '</>', color: '#f06529' },
    { name: 'CSS', glyph: '{ }', color: '#2b8ef0' },
    { name: 'JavaScript', glyph: 'JS', color: '#e8b10c' },
    { name: 'three.js', glyph: '3JS', color: '#3d4a57' },
    { name: 'Blender', glyph: 'Bl', color: '#f5792a' },
    { name: 'Git', glyph: 'Git', color: '#e84e31' },
    { name: 'Godot', glyph: 'GD', color: '#8a5cf6' },
    { name: 'Unity', glyph: 'C#', color: '#1abcfe' },
  ],
};

// Journey timeline (newest first).
export const journey = [
  {
    when: { pt: '2026', en: '2026', ja: '2026年' },
    now: true,
    title: { pt: 'NintendoFolio no ar', en: 'NintendoFolio goes live', ja: 'NintendoFolio 公開' },
    place: { pt: 'Projeto pessoal', en: 'Personal project', ja: '個人プロジェクト' },
    text: {
      pt: 'Criei este portfólio inspirado no Wii, Wii U e 3DS, com meu próprio Mii em 3D.',
      en: 'Built this portfolio inspired by the Wii, Wii U and 3DS, starring my own 3D Mii.',
      ja: 'Wii・Wii U・3DSにインスパイアされたこのポートフォリオを、自分の3D Miiと一緒に制作。',
    },
    icon: '✦',
    color: '#22b5f0',
  },
  {
    sample: true,
    when: { pt: '2026 – presente', en: '2026 – Present', ja: '2026年〜現在' },
    title: { pt: 'Desenvolvedor Unity', en: 'Unity Developer', ja: 'Unity開発者' },
    place: { pt: 'Unifor — Vortex', en: 'Unifor — Vortex', ja: 'Unifor — Vortex' },
    text: {
      pt: 'Trabalho como estagiário em desevolvimento de jogo e outras experiencias com Unity.',
      en: 'I work as a game development intern, gaining hands-on experience creating games and working on other projects with Unity.',
      ja: 'ゲーム開発のインターンとして働き、ゲーム制作をはじめ、Unityを使ったさまざまなプロジェクトの実務経験を積んでいます。',
    },
    icon: '★',
    color: '#5d3fbf',
  },
  {
    sample: true,
    when: { pt: '2024 – 2028', en: '2024 – 2028', ja: '2024年〜2028年' },
    title: { pt: 'Ciencias da Computação', en: 'Computer Science', ja: 'コンピュータサイエンス' },
    place: { pt: 'UNIFOR', en: 'UNIFOR', ja: 'UNIFOR' },
    text: {
      pt: 'Meu primeiro curso que fiz depois da escola, aprendi a programar e me encontrei como desenvolvedor de jogos.',
      en: 'My first degree program after high school, where I learned to code and discovered my passion for game development.',
      ja: '高校卒業後に初めて進学した大学の課程です。ここでプログラミングを学び、ゲーム開発者としての自分の道を見つけました。',
    },
    icon: '✎',
    color: '#f6a821',
  },
];
