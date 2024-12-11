import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 環境変数からAPIベースURLを取得
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl) {
      throw new Error('API URL is not defined. Please check your environment variables.');
    }

    // バックエンドからメッセージを取得
    const response = await fetch(`${apiUrl}/get_messages`);

    // レスポンスのステータスをチェック
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    // JSONデータを解析
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get_messages route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred.' },
      { status: 500 }
    );
  }
}

