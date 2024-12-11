import React from 'react';
import ClientComponent from './ClientComponent';

// サーバーサイドでメッセージを取得
const fetchInitialMessages = async () => {
  // 環境変数からベースURLを取得
  const baseUrl = process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    throw new Error('NEXTAUTH_URL is not defined in the environment variables');
  }

  const response = await fetch(`${baseUrl}/api/get_messages`, {
    cache: 'no-store', // キャッシュを無効化
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  const data = await response.json();
  return data.data;
};

const SignIn = async () => {
  const initialMessages = await fetchInitialMessages();

  return (
    <div>
      <ClientComponent initialMessages={initialMessages} />
    </div>
  );
};

export default SignIn;
