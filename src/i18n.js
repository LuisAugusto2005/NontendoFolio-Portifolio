// UI strings for the three supported languages.
// Portfolio content (bio, projects, etc.) lives in content.js.

export const LANGS = [
  { id: 'pt', label: 'Português', short: 'PT', locale: 'pt-BR' },
  { id: 'en', label: 'English', short: 'EN', locale: 'en-US' },
  { id: 'ja', label: '日本語', short: 'JA', locale: 'ja-JP' },
];

const STRINGS = {
  pt: {
    'meta.title': 'NintendoFolio — Portfólio de {name}',
    'boot.title': 'AVISO – SAÚDE E SEGURANÇA',
    'boot.lead': 'ANTES DE NAVEGAR, LEIA COM ATENÇÃO:',
    'boot.body':
      'Este portfólio contém um alto visual legal, carinho e um Mii muito animado. Se sentir uma vontade incontrolável de contratar o desenvolvedor ou até conversar, não resista.',
    'boot.more': 'Mais informações nos canais do menu.',
    'boot.press': 'Pressione {A} para continuar.',
    'boot.tap': 'Toque na tela para continuar.',
    'boot.loading': 'Carregando',
    'boot.sound': 'Som',
    'boot.language': 'Idioma',
    'boot.headphones': 'Melhor com som ligado',

    'status.menu': 'Menu principal',

    'ch.about.title': 'Sobre mim',
    'ch.about.desc': 'Quer saber quem eu sou? Aqui tem tudo sobre mim!',
    'ch.projects.title': 'Projetos',
    'ch.projects.desc': 'Minha estante de jogos… quer dizer, de projetos!',
    'ch.skills.title': 'Habilidades',
    'ch.skills.desc': 'Minha coleção de insígnias e poderes especiais.',
    'ch.journey.title': 'Trajetória',
    'ch.journey.desc': 'O mural com os momentos da minha jornada.',
    'ch.contact.title': 'Contato',
    'ch.contact.desc': 'Mande uma carta! Eu respondo rapidinho.',
    'ch.shop.title': 'Loja de Curriculo',
    'ch.shop.desc': 'Baixe meu currículo por 0 pontos!',
    'ch.settings.title': 'Configurações',
    'ch.settings.desc': 'Idioma, som e outras opções.',
    'ch.empty': 'Canal vazio',

    'banner.menu': 'Menu',
    'banner.start': 'Iniciar',
    'page.home': 'Menu',
    'page.backToMenu': 'Voltar ao menu',

    'mii.hello': 'Yo! Eu sou o {name}! Que bom te ver por aqui ✨',
    'mii.back': ['De volta ao menu! Onde vamos agora?', 'E aí, gostou? Tem mais canais pra ver!', 'Escolha outro canal! ♪'],
    'mii.poke': [
      'Ei, isso faz cócegas!',
      'Uau! Você me achou!',
      'Hell yeah!!',
      'We Ball!',
      'Clique nos canais para explorar!',
      'Já viu meus projetos?',
      'Dá pra estourar as bolhas do fundo, sabia?',
    ],
    'mii.idle': 'Só uma partidinha rápida no 3DS…',
    'mii.wake': 'Opa! Voltei!',
    'mii.lang': 'Agora em português!',

    'about.bioTitle': 'Quem sou eu',
    'about.card': 'Cartão Mii',
    'about.drag': 'Arraste para girar',
    'about.languages': 'Idiomas',
    'about.from': 'De',
    'about.greeting': 'Saudação',

    'projects.subtitle': 'Escolha um jogo… digo, um projeto!',
    'projects.live': 'Ver online',
    'projects.code': 'Código-fonte',
    'projects.tech': 'Tecnologias',
    'projects.year': 'Ano',
    'projects.role': 'Papel',
    'projects.close': 'Fechar',
    'projects.sample': 'Exemplo',
    'projects.open': 'Abrir projeto',

    'skills.meters': 'Medidor de habilidades',
    'skills.badges': 'Coleção de insígnias',
    'skills.hint': 'Passe o cursor (ou toque) nas insígnias!',
    'skills.level.1': 'Aprendendo',
    'skills.level.2': 'Básico',
    'skills.level.3': 'Intermediário',
    'skills.level.4': 'Avançado',
    'skills.level.5': 'Mestre',

    'journey.subtitle': 'Mural de mensagens',
    'journey.now': 'Agora',

    'contact.letterTitle': 'Escreva uma carta',
    'contact.to': 'Para',
    'contact.from': 'Seu nome',
    'contact.message': 'Mensagem',
    'contact.placeholder': 'Oi! Vi seu portfólio e…',
    'contact.send': 'Enviar',
    'contact.sent': 'Carta enviada! Seu app de e-mail vai abrir.',
    'contact.empty': 'Escreva alguma coisa antes de enviar!',
    'contact.noEmail': 'O e-mail ainda não foi configurado.',
    'contact.friends': 'Lista de amigos',
    'contact.friendCode': 'Código de amigo',
    'contact.visit': 'Visitar',
    'contact.write': 'Escrever',
    'contact.subject': 'Olá! Vim pelo seu portfólio',

    'shop.welcome': 'Bem-vindo à Loja de Curriculum Vitae!',
    'shop.item': 'Currículo de {name}',
    'shop.desc': 'PDF • Sempre atualizado',
    'shop.price': 'Preço',
    'shop.points': '0 pontos',
    'shop.balance': 'Saldo: ∞ pontos',
    'shop.download': 'Baixar',
    'shop.downloading': 'Baixando…',
    'shop.done': 'Download concluído! Obrigado pela compra!',
    'shop.unavailable': 'Em breve! O currículo ainda está sendo preparado.',
    'shop.again': 'Baixar de novo',
    'shop.blocks': 'blocos',

    'settings.language': 'Idioma',
    'settings.music': 'Música',
    'settings.sfx': 'Efeitos sonoros',
    'settings.cursor': 'Ponteiro de mão',
    'settings.motion': 'Animações',
    'settings.motion.full': 'Completas',
    'settings.motion.reduced': 'Reduzidas',
    'settings.on': 'Ligado',
    'settings.off': 'Desligado',
    'settings.replay': 'Rever introdução',
    'settings.credits': 'Créditos',
    'settings.creditsText':
      'Feito com three.js, muito carinho e nostalgia. Inspirado no Wii, Wii U e Nintendo 3DS. Projeto de fã, sem afiliação com a Nintendo.',

    'common.music': 'Música',
    'common.sound': 'Som',
  },

  en: {
    'meta.title': "NintendoFolio — {name}'s Portfolio",
    'boot.title': 'WARNING – HEALTH AND SAFETY',
    'boot.lead': 'BEFORE BROWSING, READ CAREFULLY:',
    'boot.body':
      'This portfolio has a cool look, lots of heart, and a super-energetic Mii. If you feel an irresistible urge to hire the developer or even just have a chat, do not resist.',
    'boot.more': 'More information in the menu channels.',
    'boot.press': 'Press {A} to continue.',
    'boot.tap': 'Tap the screen to continue.',
    'boot.loading': 'Loading',
    'boot.sound': 'Sound',
    'boot.language': 'Language',
    'boot.headphones': 'Best with sound on',

    'status.menu': 'Main menu',

    'ch.about.title': 'About Me',
    'ch.about.desc': "Want to know who I am? It's all in here!",
    'ch.projects.title': 'Projects',
    'ch.projects.desc': 'My game shelf… I mean, project shelf!',
    'ch.skills.title': 'Skills',
    'ch.skills.desc': 'My badge collection and special powers.',
    'ch.journey.title': 'Journey',
    'ch.journey.desc': 'A message board of my journey so far.',
    'ch.contact.title': 'Contact',
    'ch.contact.desc': 'Send me a letter! I reply quickly.',
    'ch.shop.title': 'Resume Shop',
    'ch.shop.desc': 'Download my résumé for 0 points!',
    'ch.settings.title': 'Settings',
    'ch.settings.desc': 'Language, sound and other options.',
    'ch.empty': 'Empty channel',

    'banner.menu': 'Menu',
    'banner.start': 'Start',
    'page.home': 'Menu',
    'page.backToMenu': 'Back to menu',

    'mii.hello': "Hi! I'm {name}! Great to see you here ✨",
    'mii.back': ['Back to the menu! Where to next?', 'Liked it? There are more channels to see!', 'Pick another channel! ♪'],
    'mii.poke': [
      'Hey, that tickles!',
      'Whoa! You found me!',
      'Hell yeah!!',
      'We Ball!',
      'Click the channels to explore!',
      'Have you seen my projects yet?',
      'Psst… you can pop the bubbles in the background!',
    ],
    'mii.idle': 'Just a quick round on my 3DS…',
    'mii.wake': "Oops! I'm back!",
    'mii.lang': 'Now speaking English!',

    'about.bioTitle': 'Who I am',
    'about.card': 'Mii Card',
    'about.drag': 'Drag to spin',
    'about.languages': 'Languages',
    'about.from': 'From',
    'about.greeting': 'Greeting',

    'projects.subtitle': 'Pick a game… er, a project!',
    'projects.live': 'Live demo',
    'projects.code': 'Source code',
    'projects.tech': 'Tech',
    'projects.year': 'Year',
    'projects.role': 'Role',
    'projects.close': 'Close',
    'projects.sample': 'Sample',
    'projects.open': 'Open project',

    'skills.meters': 'Skill meter',
    'skills.badges': 'Badge collection',
    'skills.hint': 'Hover (or tap) the badges!',
    'skills.level.1': 'Learning',
    'skills.level.2': 'Basic',
    'skills.level.3': 'Intermediate',
    'skills.level.4': 'Advanced',
    'skills.level.5': 'Master',

    'journey.subtitle': 'Message board',
    'journey.now': 'Now',

    'contact.letterTitle': 'Write a letter',
    'contact.to': 'To',
    'contact.from': 'Your name',
    'contact.message': 'Message',
    'contact.placeholder': 'Hi! I saw your portfolio and…',
    'contact.send': 'Send',
    'contact.sent': 'Letter sent! Your email app will open.',
    'contact.empty': 'Write something before sending!',
    'contact.noEmail': "The email address hasn't been set up yet.",
    'contact.friends': 'Friend list',
    'contact.friendCode': 'Friend code',
    'contact.visit': 'Visit',
    'contact.write': 'Write',
    'contact.subject': 'Hi! I found you through your portfolio',

    'shop.welcome': 'Welcome to the Resume Shop!',
    'shop.item': "{name}'s Résumé",
    'shop.desc': 'PDF • Always up to date',
    'shop.price': 'Price',
    'shop.points': '0 Points',
    'shop.balance': 'Balance: ∞ points',
    'shop.download': 'Download',
    'shop.downloading': 'Downloading…',
    'shop.done': 'Download complete! Thanks for your purchase!',
    'shop.unavailable': 'Coming soon! The résumé is still being prepared.',
    'shop.again': 'Download again',
    'shop.blocks': 'blocks',

    'settings.language': 'Language',
    'settings.music': 'Music',
    'settings.sfx': 'Sound effects',
    'settings.cursor': 'Hand pointer',
    'settings.motion': 'Animations',
    'settings.motion.full': 'Full',
    'settings.motion.reduced': 'Reduced',
    'settings.on': 'On',
    'settings.off': 'Off',
    'settings.replay': 'Replay intro',
    'settings.credits': 'Credits',
    'settings.creditsText':
      'Made with three.js, lots of care and nostalgia. Inspired by the Wii, Wii U and Nintendo 3DS. A fan project, not affiliated with Nintendo.',

    'common.music': 'Music',
    'common.sound': 'Sound',
  },

  ja: {
    'meta.title': 'NintendoFolio — {name}のポートフォリオ',
    'boot.title': '警告 ― 健康と安全のために',
    'boot.lead': 'ご利用の前に、よくお読みください：',
    'boot.body':
      'このポートフォリオには、クールなビジュアル、たっぷりの愛情、そしてとっても元気なMiiが詰まっています。開発者を雇いたい、あるいはちょっと話してみたいという抑えきれない気持ちが湧いてきたら、我慢しないでください。',
    'boot.more': 'くわしくはメニューのチャンネルをご覧ください。',
    'boot.press': '{A}ボタンを押してください。',
    'boot.tap': '画面をタッチしてください。',
    'boot.loading': '読み込み中',
    'boot.sound': 'サウンド',
    'boot.language': '言語',
    'boot.headphones': 'サウンドONがおすすめ',

    'status.menu': 'メインメニュー',

    'ch.about.title': 'プロフィール',
    'ch.about.desc': 'ぼくのことを知りたい？ここに全部あるよ！',
    'ch.projects.title': 'プロジェクト',
    'ch.projects.desc': 'ぼくのゲーム棚…じゃなくて、プロジェクト棚だよ！',
    'ch.skills.title': 'スキル',
    'ch.skills.desc': 'ぼくのバッジコレクションと特技だよ。',
    'ch.journey.title': 'あゆみ',
    'ch.journey.desc': 'これまでのあゆみをまとめた伝言板だよ。',
    'ch.contact.title': '連絡先',
    'ch.contact.desc': '手紙を送ってね！すぐに返事するよ。',
    'ch.shop.title': '履歴書ショップ',
    'ch.shop.desc': '履歴書を0ポイントでダウンロード！',
    'ch.settings.title': '設定',
    'ch.settings.desc': '言語やサウンドなどの設定だよ。',
    'ch.empty': '空きチャンネル',

    'banner.menu': 'メニュー',
    'banner.start': 'はじめる',
    'page.home': 'メニュー',
    'page.backToMenu': 'メニューにもどる',

    'mii.hello': 'こんにちは！{name}です！来てくれてありがとう✨',
    'mii.back': ['メニューにもどったよ！次はどこに行く？', 'どうだった？ほかのチャンネルもあるよ！', 'ほかのチャンネルも見てね！♪'],
    'mii.poke': [
      'くすぐったいよ！',
      'わっ！見つかっちゃった！',
      'ぴょんぴょん♪',
      '「We Ball！」',
      'チャンネルをクリックして探検してね！',
      'ぼくのプロジェクト、もう見た？',
      'ないしょだけど…背景のシャボン玉、割れるんだよ！',
    ],
    'mii.idle': 'ちょっとだけ3DSで遊ぼうかな…',
    'mii.wake': 'おっと！おかえり！',
    'mii.lang': '日本語になったよ！',

    'about.bioTitle': '自己紹介',
    'about.card': 'Miiカード',
    'about.drag': 'ドラッグで回転',
    'about.languages': '話せる言語',
    'about.from': '出身',
    'about.greeting': 'あいさつ',

    'projects.subtitle': 'ソフトを選んでね…じゃなくて、プロジェクト！',
    'projects.live': 'デモを見る',
    'projects.code': 'ソースコード',
    'projects.tech': '使用技術',
    'projects.year': '年',
    'projects.role': '担当',
    'projects.close': 'とじる',
    'projects.sample': 'サンプル',
    'projects.open': 'プロジェクトを開く',

    'skills.meters': 'スキルメーター',
    'skills.badges': 'バッジコレクション',
    'skills.hint': 'バッジにカーソルを合わせて（タッチして）みてね！',
    'skills.level.1': '勉強中',
    'skills.level.2': '初級',
    'skills.level.3': '中級',
    'skills.level.4': '上級',
    'skills.level.5': '達人',

    'journey.subtitle': '伝言板',
    'journey.now': '現在',

    'contact.letterTitle': '手紙を書く',
    'contact.to': 'あて先',
    'contact.from': 'お名前',
    'contact.message': 'メッセージ',
    'contact.placeholder': 'こんにちは！ポートフォリオを見て…',
    'contact.send': '送信',
    'contact.sent': '手紙を送りました！メールアプリが開きます。',
    'contact.empty': 'メッセージを入力してね！',
    'contact.noEmail': 'メールアドレスがまだ設定されていません。',
    'contact.friends': 'フレンドリスト',
    'contact.friendCode': 'フレンドコード',
    'contact.visit': 'ひらく',
    'contact.write': '書く',
    'contact.subject': 'ポートフォリオを見て連絡しました',

    'shop.welcome': '履歴書ショップへようこそ！',
    'shop.item': '{name}の履歴書',
    'shop.desc': 'PDF・いつでも最新',
    'shop.price': '価格',
    'shop.points': '0ポイント',
    'shop.balance': '残高：∞ポイント',
    'shop.download': 'ダウンロード',
    'shop.downloading': 'ダウンロード中…',
    'shop.done': 'ダウンロードが完了しました！お買い上げありがとうございました！',
    'shop.unavailable': '近日公開！履歴書は準備中です。',
    'shop.again': 'もう一度ダウンロード',
    'shop.blocks': 'ブロック',

    'settings.language': '言語',
    'settings.music': 'BGM',
    'settings.sfx': '効果音',
    'settings.cursor': '手のポインター',
    'settings.motion': 'アニメーション',
    'settings.motion.full': 'フル',
    'settings.motion.reduced': 'ひかえめ',
    'settings.on': 'オン',
    'settings.off': 'オフ',
    'settings.replay': 'イントロをもう一度',
    'settings.credits': 'クレジット',
    'settings.creditsText':
      'three.jsと愛とノスタルジーで制作。Wii・Wii U・ニンテンドー3DSにインスパイアされたファンプロジェクトです。任天堂とは関係ありません。',

    'common.music': 'BGM',
    'common.sound': 'サウンド',
  },
};

let current = 'en';
const listeners = new Set();

export function detectLang() {
  const nav = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase());
  for (const l of nav) {
    if (l.startsWith('pt')) return 'pt';
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('en')) return 'en';
  }
  return 'en';
}

export function getLang() {
  return current;
}

export function getLocale() {
  return LANGS.find((l) => l.id === current).locale;
}

export function setLang(lang) {
  if (!STRINGS[lang]) lang = 'en';
  const changed = lang !== current;
  current = lang;
  document.documentElement.lang = getLocale();
  document.documentElement.dataset.lang = lang;
  if (changed) listeners.forEach((fn) => fn(lang));
  return changed;
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a UI key. `vars` fills {placeholders}. Arrays are returned as-is. */
export function t(key, vars) {
  let s = STRINGS[current][key] ?? STRINGS.en[key] ?? key;
  if (typeof s === 'string' && vars) {
    s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }
  return s;
}

/** Pick the current-language value from a {pt, en, ja} object (or return strings untouched). */
export function L(value) {
  if (value == null) return '';
  if (typeof value !== 'object' || Array.isArray(value)) return value;
  return value[current] ?? value.en ?? Object.values(value)[0] ?? '';
}

/** Fill every [data-i18n] element inside `root`. */
export function applyTranslations(root = document, vars) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n, vars);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria, vars));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder, vars));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.dataset.i18nTitle, vars));
  });
}
