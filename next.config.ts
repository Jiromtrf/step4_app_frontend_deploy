/** @type {import('next').NextConfig} */
const nextConfig = {
  // スタンドアロンモードを有効化して、必要最低限のファイルのみをデプロイ
  output: 'standalone',

  // 環境変数の設定
  env: {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL, // Azureで設定されたAPI URLを使用
  },
};

export default nextConfig;