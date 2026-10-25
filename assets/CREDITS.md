# 插畫與聲音來源

## 原創插畫與音效

`art/apple.svg`、`ball.svg`、`cat.svg`、`dog.svg`、`egg.svg`、`forest.svg`、`wand.svg` 為本專案以 SVG 路徑繪製的原創向量插畫，沒有 emoji 拼貼、外部圖片、字型或圖片服務依賴。選卡、選錯、命中、通關音效由 `audio.js` 以 Web Audio 合成柔和正弦音。

## 真人錄音

以下音檔取自 Wikimedia Commons 與 FreeReading 開放早期識字教材。除 `name-a.mp3` 為公有領域外，本專案選用 **Creative Commons Attribution-ShareAlike 3.0 Unported（CC BY-SA 3.0）**，加工後的音檔也依同一授權提供；此授權允許商業使用，須保留作者、來源、授權連結、改作聲明及相同方式分享條件。

授權：[CC BY-SA 3.0 摘要](https://creativecommons.org/licenses/by-sa/3.0/) · [完整條款](https://creativecommons.org/licenses/by-sa/3.0/legalcode)。這些授權適用於對應錄音素材，並不聲稱原作者為本遊戲背書。

| 本地音檔 | 原作／來源頁 | 錄音作者 | 授權 |
| --- | --- | --- | --- |
| `audio/word-apple.mp3` | [En-us-apple.ogg](https://commons.wikimedia.org/wiki/File:En-us-apple.ogg) | Dvortygirl | CC BY-SA 3.0 |
| `audio/word-ball.mp3` | [En-us-ball.ogg](https://commons.wikimedia.org/wiki/File:En-us-ball.ogg) | Dvortygirl | CC BY-SA 3.0 |
| `audio/word-cat.mp3` | [En-us-cat.ogg](https://commons.wikimedia.org/wiki/File:En-us-cat.ogg) | Dvortygirl | CC BY-SA 3.0 |
| `audio/word-dog.mp3` | [En-us-dog.ogg](https://commons.wikimedia.org/wiki/File:En-us-dog.ogg) | Dvortygirl | CC BY-SA 3.0 |
| `audio/word-egg.mp3` | [En-us-egg.ogg](https://commons.wikimedia.org/wiki/File:En-us-egg.ogg) | Dvortygirl | CC BY-SA 3.0 |
| `audio/name-a.mp3` | [En-us-a.ogg](https://commons.wikimedia.org/wiki/File:En-us-a.ogg) | Xnux | Public domain（公有領域） |
| `audio/name-b.mp3` | [En-us-b.ogg](https://commons.wikimedia.org/wiki/File:En-us-b.ogg) | Twocs / Tom Anderson | CC BY-SA 3.0 |
| `audio/name-c.mp3` | [En-us-c.ogg](https://commons.wikimedia.org/wiki/File:En-us-c.ogg) | Twocs / Tom Anderson | CC BY-SA 3.0 |
| `audio/name-d.mp3` | [En-us-d.ogg](https://commons.wikimedia.org/wiki/File:En-us-d.ogg) | Twocs / Tom Anderson | CC BY-SA 3.0 |
| `audio/name-e.mp3` | [En-us-e.ogg](https://commons.wikimedia.org/wiki/File:En-us-e.ogg) | Logictheo | CC BY-SA 3.0 |
| `audio/phoneme-a.mp3` | [Near-open front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Near-open_front_unrounded_vowel.ogg) | Denelson83 | CC BY-SA 3.0 |
| `audio/phoneme-b.mp3` | [FreeReading — Letter_B.mp3](https://freereading.org/wiki/Most_common_letter_sounds_(audio_clips).html) | FreeReading（來源頁未標示個別錄音者） | CC BY-SA 3.0 |
| `audio/phoneme-c.mp3` | [FreeReading — Letter_c.mp3](https://freereading.org/wiki/Most_common_letter_sounds_(audio_clips).html) | FreeReading（來源頁未標示個別錄音者） | CC BY-SA 3.0 |
| `audio/phoneme-d.mp3` | [FreeReading — Letter_D.mp3](https://freereading.org/wiki/Most_common_letter_sounds_(audio_clips).html) | FreeReading（來源頁未標示個別錄音者） | CC BY-SA 3.0 |
| `audio/phoneme-e.mp3` | [Open-mid front unrounded vowel.ogg](https://commons.wikimedia.org/wiki/File:Open-mid_front_unrounded_vowel.ogg) | Denelson83（下載版本） | CC BY-SA 3.0 |
| `audio/says.mp3` | [En-us-says.ogg](https://commons.wikimedia.org/wiki/File:En-us-says.ogg) | Dvortygirl | CC BY-SA 3.0 |
| `audio/in.mp3` | [En-us-in.ogg](https://commons.wikimedia.org/wiki/File:En-us-in.ogg) | Dvortygirl | CC BY-SA 3.0 |

作者頁：[Dvortygirl](https://commons.wikimedia.org/wiki/User:Dvortygirl)、[Xnux](https://commons.wikimedia.org/wiki/User:Xnux)、[Twocs](https://commons.wikimedia.org/wiki/User:Twocs)、[Logictheo](https://commons.wikimedia.org/wiki/User:Logictheo)、[Denelson83](https://commons.wikimedia.org/wiki/User:Denelson83)、[Peter Isotalo](https://commons.wikimedia.org/wiki/User:Peter_Isotalo)。

FreeReading B／C／D 音訊來源：[Most common letter sounds (audio clips)](https://freereading.org/wiki/Most_common_letter_sounds_(audio_clips).html)。[FreeReading 使用條款第 1 節](https://freereading.org/wiki/FreeReading%253AGeneral_disclaimer.html)明載，除另行標示外，站內內容（含音訊）依 CC BY-SA 3.0 提供；本專案的裁剪版本也以相同授權提供。

## 加工聲明

Wikimedia Commons 音檔於 2026-10-25 下載原始 Ogg，裁去首尾靜音、統一響度（目標 -19 LUFS／峰值 -2 dBTP），轉為 44.1 kHz 單聲道 128 kbps MP3。音高未改變。B／C／D 音素改用已核准、已去尾的 FreeReading 真人音檔，直接複製至遊戲音檔，未再裁切或重製。本專案版本只保留孤立字母開頭音，切掉後面接的例字發音，並統一響度（約 0.3–0.5 秒）。A／E 為原始 IPA 母音示範。E 來源下載到 19,160 bytes、約 0.7 秒的 Denelson83 舊錄音版本；來源頁現行版本另有 Terfili 的錄音。

播放器在單字、字母名、音素之間保留約 160 ms 間隔；沒有把 `/æ/` 轉成字母 A，也沒有要求 TTS 猜測 IPA。17 個短檔，可離線播放。各錄音由不同講者提供，音色與口音可能略有差異。
