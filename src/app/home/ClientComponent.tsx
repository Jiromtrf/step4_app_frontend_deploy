'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../page.module.css'; // 修正済みパス
import Image from 'next/image';
import SignoutButton from '../components/SignoutButton';

interface Message {
  text: string;
  user: string;
  reactions: { name: string; count: number }[];
  channel: string;
  timestamp: string;
  thread_ts: string;
}

interface ClientComponentProps {
  initialMessages: Message[];
}

const ClientComponent: React.FC<ClientComponentProps> = ({ initialMessages }) => {
  const [messages] = useState<Message[]>(initialMessages);
  const [message, setMessage] = useState<string>('');
  const [greetingMessage, setGreetingMessage] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string>('/gal1.webp');
  const [isSidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [isMessagesVisible, setMessagesVisible] = useState<boolean>(true);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const toggleMessages = () => setMessagesVisible(!isMessagesVisible);

  const updateGreetingMessageAndBackground = () => {
    const currentHour = new Date().getHours();
    const messages = {
      morning: ['おはよー！朝から頑張って偉いね！', '/girl1.png'],
      afternoon: ['やっほー！今日も頑張ろう！', '/afternoon.webp'],
      evening: ['ここからがコアタイムだねー！', '/evening.webp'],
      night: ['遅くまでえらいねー。もうひとふんばり！', '/night.webp'],
      lateNight: ['お疲れ様！そろそろ寝た方がいいよ！', '/night.webp'],
    };
    let selected = messages.lateNight;

    if (currentHour >= 5 && currentHour < 12) selected = messages.morning;
    else if (currentHour >= 12 && currentHour < 17) selected = messages.afternoon;
    else if (currentHour >= 17 && currentHour < 21) selected = messages.evening;
    else if (currentHour >= 21 && currentHour < 24) selected = messages.night;

    const [message, bg] = selected;
    setBackgroundImage(bg);
    setGreetingMessage(message);
  };

  useEffect(() => {
    updateGreetingMessageAndBackground();
  }, []);

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 人物画像 (画面下部に固定) */}
      <Image
        src="/girl1.png"
        alt="Girl"
        fill // 'fill' プロパティを使用
        unoptimized // 画像最適化を無効化
        style={{
            objectFit: 'contain', // スタイルとして指定
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 0,
            pointerEvents: 'none',
        }}
        />


      {/* サイドバー */}
      <div className={`${styles.sidebar} ${isSidebarVisible ? styles.sidebarVisible : styles.sidebarHidden}`}>
        <h2>機能一覧</h2>
        <ul className={styles.sidebarList}>
          <li><Link href="/home/dashboard">ステータス確認</Link></li>
          <li><a href="#">宿題の進捗</a></li>
          <li><a href="#">講義資料</a></li>
          <li><Link href="/home/checktest">理解度チェック</Link></li>
          <li><a href="#">勉強する</a></li>
          <li><a href="#">遊びに行く</a></li>
          <li><Link href="/home/teaming">チーミング</Link></li>
          <li><SignoutButton /></li>
        </ul>
      </div>

      <button onClick={toggleSidebar} className={styles.toggleButton}>
        {isSidebarVisible ? '<' : '>'}
      </button>

      {/* コンテンツ */}
      <div className={styles.content}>
        <div className={styles.greeting}>{greetingMessage}</div>
        <button onClick={toggleMessages} className={styles.messageToggleButton}>
          {isMessagesVisible ? 'メッセージ一覧を隠す' : 'メッセージ一覧を表示'}
        </button>
        {isMessagesVisible && (
          <div className={styles.messages}>
            <h2>メッセージ一覧</h2>
            <ul className={styles.messageList}>
              {messages.map((msg, index) => (
                <li key={index} className={styles.messageItem}>
                  <p><strong>{msg.user}</strong>: {msg.text}</p>
                  <div className={styles.reactions}>
                    {msg.reactions.map((reaction, i) => (
                      <span key={i} className={styles.reaction}>
                        {reaction.name} ({reaction.count})
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className={styles.inputArea}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力"
            className={styles.input}
          />
          <button className={styles.button}>送信</button>
        </div>
      </div>
    </div>
  );
};

export default ClientComponent;



