## Fitmentor

トレーニングの記録・管理・提案を行うアプリケーションです。
毎日のトレーニングを記録と、その記録と当日のコンディションからトレーニングメニューの提案を行います。

## 技術スタック
- フロントエンド: React + Vite
- バックエンド: FastAPI
- データベース: NEON
- AI: GeminiAPI

## 環境変数
Docker起動前に `.env.example` をコピーして `.env` を作成し、必要な値を設定してください。
Docker Compose 利用時は `GEMINI_API_KEY` もルートの `.env` に設定してください。
