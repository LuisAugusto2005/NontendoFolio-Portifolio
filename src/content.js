// ─────────────────────────────────────────────────────────────────────────────
//  YOUR PORTFOLIO CONTENT — edit this file.
//  Every text can be a plain string or an object { pt, en, ja }.
//  Entries marked `sample: true` are placeholders: replace or delete them.
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  name: 'Luis Augusto',
  nameJa: 'ルイス・アウグスト', // used when the site is in Japanese
  role: {
    pt: 'Desenvolvedor & criador de experiências interativas',
    en: 'Developer & interactive experience maker',
    ja: 'デベロッパー／インタラクティブ体験クリエイター',
  },
  location: { pt: 'Brasil', en: 'Brazil', ja: 'ブラジル' },
  bio: {
    pt: [
      'Oi! Eu sou o Luis, um desenvolvedor brasileiro que cresceu entre o Wii, o 3DS e muitas horas no Mii Channel.',
      'Gosto de construir coisas que dão vontade de clicar: interfaces caprichadas, animações fluidas e um pouco de 3D sempre que dá. Este portfólio é a prova — até o meu Mii veio junto.',
    ],
    en: [
      "Hi! I'm Luis, a Brazilian developer who grew up between the Wii, the 3DS and way too many hours in the Mii Channel.",
      "I love building things that make you want to click: polished interfaces, fluid animations and a bit of 3D whenever possible. This portfolio is the proof — even my Mii came along.",
    ],
    ja: [
      'こんにちは！ブラジル出身の開発者、ルイスです。Wiiと3DS、そしてMiiチャンネルとともに育ちました。',
      'ついクリックしたくなるものを作るのが好きです。ていねいなUI、なめらかなアニメーション、そしてできるだけ3Dも。このポートフォリオがその証拠──ぼくのMiiも一緒に来ました。',
    ],
  },
  // "Mii Card" fields (StreetPass style). Add, remove or edit freely.
  card: [
    { label: { pt: 'Hobby', en: 'Hobby', ja: 'しゅみ' }, value: { pt: 'Games, desenvolver Games, Desenhar e Modelar 3D', en: 'Gaming, Game Development, Drawing & 3D Modeling', ja: 'ゲーム、ゲーム開発、イラスト、3Dモデリング' } },
    { label: { pt: 'Console favorito', en: 'Favorite console', ja: 'すきなゲーム機' }, value: 'Nintendo 3DS' },
    { label: { pt: 'Cor favorita', en: 'Favorite color', ja: 'すきな色' }, value: { pt: 'Vermelho', en: 'Red', ja: 'あか' }, swatch: '#d92b2b' },
  ],
  greeting: { pt: 'Vamos criar algo incrível juntos!', en: "Let's build something amazing together!", ja: 'いっしょにすごいものを作ろう！' },
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
    title: 'NontendoFolio',
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
    id: 'sample-web-app',
    sample: true,
    title: { pt: 'Seu projeto aqui', en: 'Your project here', ja: 'ここにプロジェクト' },
    band: 'wii',
    bandLabel: 'APP',
    cover: { from: '#b6f28a', to: '#2fae4f', glyph: '✿' },
    year: '20XX',
    role: { pt: 'Seu papel', en: 'Your role', ja: 'あなたの担当' },
    tags: ['Tag 1', 'Tag 2'],
    summary: {
      pt: 'Entrada de exemplo. Edite src/content.js para adicionar seus projetos: título, capa, descrição em PT/EN/JA, tecnologias e links.',
      en: 'Sample entry. Edit src/content.js to add your own projects: title, cover, description in PT/EN/JA, tech tags and links.',
      ja: 'サンプルです。src/content.js を編集して、タイトル・カバー・説明文（PT/EN/JA）・技術タグ・リンクを追加してください。',
    },
    links: { live: '', code: '' },
  },
  {
    id: 'sample-game',
    sample: true,
    title: { pt: 'Outro projeto', en: 'Another project', ja: 'べつのプロジェクト' },
    band: 'ds',
    bandLabel: 'GAME',
    cover: { from: '#ffe08a', to: '#ff9d2e', glyph: '★' },
    year: '20XX',
    role: { pt: 'Seu papel', en: 'Your role', ja: 'あなたの担当' },
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
    summary: {
      pt: 'Mais uma entrada de exemplo — cada projeto vira uma caixinha de jogo nesta estante.',
      en: 'One more sample entry — every project becomes a little game case on this shelf.',
      ja: 'もうひとつのサンプル。プロジェクトごとにゲームケースとして棚に並びます。',
    },
    links: { live: '', code: '' },
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
    title: { pt: 'NontendoFolio no ar', en: 'NontendoFolio goes live', ja: 'NontendoFolio 公開' },
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
    when: { pt: '20XX – 20XX', en: '20XX – 20XX', ja: '20XX年〜20XX年' },
    title: { pt: 'Sua experiência aqui', en: 'Your experience here', ja: 'ここに経歴' },
    place: { pt: 'Empresa / Freelance', en: 'Company / Freelance', ja: '会社／フリーランス' },
    text: {
      pt: 'Entrada de exemplo — edite src/content.js com seus empregos, estágios ou trabalhos freelance.',
      en: 'Sample entry — edit src/content.js with your jobs, internships or freelance work.',
      ja: 'サンプルです。src/content.js に仕事・インターン・フリーランスの経歴を書いてください。',
    },
    icon: '★',
    color: '#3fbf5a',
  },
  {
    sample: true,
    when: { pt: '20XX – 20XX', en: '20XX – 20XX', ja: '20XX年〜20XX年' },
    title: { pt: 'Sua formação aqui', en: 'Your education here', ja: 'ここに学歴' },
    place: { pt: 'Escola / Universidade', en: 'School / University', ja: '学校／大学' },
    text: {
      pt: 'Cursos, faculdade, certificados — tudo o que fez parte da sua jornada.',
      en: 'Courses, college, certificates — everything that was part of your journey.',
      ja: '講座、大学、資格など、あなたのあゆみの一部をすべてここに。',
    },
    icon: '✎',
    color: '#f6a821',
  },
];
