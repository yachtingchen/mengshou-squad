# 🌱 萌獸小隊：智慧卡牌大對戰

依照 [GAME_RULES.md](GAME_RULES.md) 製作的繁體中文、純靜態卡牌遊戲。無後端、無安裝套件、無建置步驟，也不需要網路資源。

## 本地開啟

直接用瀏覽器開啟 `index.html` 即可遊玩。也可以在此資料夾執行：

```bash
python3 -m http.server 8080
```

再開啟 `http://localhost:8080`。

## 怎麼玩

- 預設為「親子對戰」。家長與孩子各選一隻萌獸，再按「一起出發」。
- 家長先點選一張牌，接著將裝置交給孩子選牌；兩人選好後同時揭曉結算。
- 「公開意圖」預設開啟；關閉後，孩子選牌時只會看到家長已選好。
- 親子模式可選擇開啟屬性相剋，預設關閉。
- 每隻生命 6、初始能量 0、能量上限 3。能量不足 2 時第三張是集氣，達到 2 時改為絕招。
- 同時扣血，可能平手。結果畫面可以重玩或換夥伴，沒有時間限制或失敗懲罰。
- 「對戰電腦」提供八關固定循環的漸進意圖（非隨機），每關生命與能量重新開始。第 5 關開始啟用屬性相剋。電腦按規則預告傷害 2／3 的攻擊、抵擋 2 的防守或休息；其行動不消耗卡牌能量。
- 關卡循環會包含休息，避免電腦無止境防守。親子雙方若一直防守，仍可自行選擇攻擊繼續比賽，沒有額外回合限制。

結算順序為：扣絕招能量 → 計算原始傷害與屬性 → 護盾抵擋 → 同時扣生命 → 增加能量（最多 3）→ 判勝負。護盾不跨回合，不回血。

## 部署到 Azure Static Web Apps

此專案部署成靜態檔案即可，不需要 API 或 Node.js 執行環境。

1. 將專案推送到 GitHub 儲存庫。
2. 在 Azure 入口網站建立 **Static Web App**，選擇 GitHub 來源並連結儲存庫與分支。
3. 建置預設選 **Custom**，設定：
   - **App location**：`/`
   - **API location**：留空
   - **Output location**：留空（原始根目錄就是成品）
4. Azure 會產生 GitHub Actions 工作流程。此專案不需建置，可在 `Azure/static-web-apps-deploy` 的 `with` 中使用下列設定，並保留 Azure 產生的部署 token 與其餘工作流程：

```yaml
app_location: "/"
api_location: ""
output_location: ""
skip_app_build: true
```

5. 工作流程成功後，開啟 Azure 提供的網站網址。確認首頁、親子完整對戰與電腦意圖都能正常使用。

`staticwebapp.config.json` 放在根目錄，會隨網站部署。若使用 Azure Blob 靜態網站，也可將 `index.html`、`style.css`、`game.js`、`app.js` 上傳至 `$web` 容器，首頁設為 `index.html`。

## 檔案與驗證

- `index.html`：頁面、說明視窗。
- `style.css`：響應式介面與揭曉動畫，支援減少動態效果設定。
- `game.js`：卡牌與同時結算規則；同時可由 Node.js 載入驗證。
- `app.js`：選角、交棒、意圖、關卡與結果介面。
- `tests/game.test.js`：結算與完整對戰測試。

有 Node.js 時可執行 `node tests/game.test.js`。遊玩本身不需要 Node.js。

部署參考：[Microsoft 官方建置設定說明](https://learn.microsoft.com/azure/static-web-apps/build-configuration)。
