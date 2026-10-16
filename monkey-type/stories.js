// 文章の追加はこのファイルだけでできます。README.txtに書き方があります。
// 全難易度（EASY・NORMAL・HELL）はstandardの共通一覧を使います。
// 各行は [表示する日本語, 入力する半角ローマ字] です。
const STORY_LIBRARY = {
  standard: [
    { title: '桃太郎', parts: [
      ['むかしむかし','mukashimukashi'],['あるところに','arutokoroni'],
      ['おじいさんと','ojiisanto'],['おばあさんが','obaasanga'],['すんでいました','sundeimashita'],
      ['おじいさんは','ojiisanha'],['やまへ','yamahe'],['しばかりに','shibakarini'],
      ['おばあさんは','obaasanha'],['かわへ','kawahe'],['せんたくに','sentakuni'],['いきました','ikimashita']
    ] },
    { title: '桃太郎のもも', parts: [['おおきな','ookina'],['ももが','momoga'],['どんぶらこ','donburako'],['どんぶらこと','donburakoto'],['ながれてきました','nagaretekimashita']] },
    // 青空文庫の原作冒頭より。作者・出典を記録。
    {
      "title": "吾輩は猫である",
      "author": "夏目漱石",
      "source": "https://www.aozora.gr.jp/cards/000148/files/789_14547.html",
      "parts": [
        [
          "吾輩は猫である",
          "wagahaihanekodearu"
        ],
        [
          "名前はまだ無い",
          "namaehamadanai"
        ]
      ]
    },
    {
      "title": "走れメロス",
      "author": "太宰治",
      "source": "https://www.aozora.gr.jp/cards/000035/files/1567_14913.html",
      "parts": [
        [
          "メロスは",
          "merosuha"
        ],
        [
          "激怒した",
          "gekidoshita"
        ]
      ]
    },
    {
      "title": "坊っちゃん",
      "author": "夏目漱石",
      "source": "https://www.aozora.gr.jp/cards/000148/files/752_14964.html",
      "parts": [
        [
          "親譲りの無鉄砲で",
          "oyayuzurinomuteppoude"
        ],
        [
          "小供の時から",
          "kodomonotokikara"
        ],
        [
          "損ばかりしている",
          "sonbakarishiteiru"
        ]
      ]
    },
    {
      "title": "羅生門",
      "author": "芥川龍之介",
      "source": "https://www.aozora.gr.jp/cards/000879/files/127_15260.html",
      "parts": [
        [
          "ある日の暮方の事である",
          "aruhinokuregatanokotodearu"
        ],
        [
          "一人の下人が",
          "hitorinogeninga"
        ],
        [
          "羅生門の下で",
          "rashoumonnoshitade"
        ],
        [
          "雨やみを待っていた",
          "amayamiwomatteita"
        ]
      ]
    }
  ]
};
