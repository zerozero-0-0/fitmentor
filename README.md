# Fitmentor

iPhoneのChromeで使う筋トレ管理アプリ。Gemini APIを使って今日のトレーニングメニューを提案する。

## 機能

- 種目・重量・レップ数のログ記録
- 直近の記録とコンディションをもとにAIがメニュー提案
- トレーニング履歴の確認

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | React 19 / TypeScript / Vite / Tailwind CSS |
| Backend | Python 3.10 / FastAPI / SQLModel |
| DB | PostgreSQL 17 |
| AI | Google Gemini API |
| Frontend 本番 | Vercel |
| Backend 本番 | fly.io |

## 開発環境の起動

```bash
cp .env.example .env
# .env を編集して GEMINI_API_KEY を設定

docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 本番デプロイ

### Backend (fly.io)

初回セットアップ:

```bash
cd backend

# Postgres DBを作成してアタッチ (DATABASE_URL が自動でシークレットに設定される)
fly postgres create --name fitmentor-db --region nrt
fly postgres attach fitmentor-db

# その他のシークレットを設定
fly secrets set GEMINI_API_KEY=<your-key>
fly secrets set FRONTEND_ORIGIN=https://<your-app>.vercel.app

fly deploy
```

2回目以降:

```bash
cd backend && fly deploy
```

### Frontend (Vercel)

1. Vercel ダッシュボードでリポジトリを連携
2. Root Directory を `frontend` に設定
3. 環境変数 `VITE_API_URL` に `https://<your-backend-app>.fly.dev` を設定

以降はmainブランチへのプッシュで自動デプロイされる。

## 環境変数

`.env.example` を参照。
