'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../page.module.css'; // 修正済みパス
import Image from 'next/image';
import SignoutButton from '../components/SignoutButton';
import { AiOutlineSwap } from 'react-icons/ai';

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
  const [currentCharacter, setCurrentCharacter] = useState<string>('girl1.webp');
  const [isFirstClick, setFirstClick] = useState<boolean>(true);

  const girlAudio = useRef<HTMLAudioElement | null>(null);
  const boyAudio = useRef<HTMLAudioElement | null>(null);
  const firstClickAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 音声オブジェクトを初期化
    girlAudio.current = new Audio('/girl.mp3');
    boyAudio.current = new Audio('/boy.mp3');
    firstClickAudio.current = new Audio(
      Math.random() > 0.5 ? '/お疲れ様です.mp3' : '/やっほー.mp3'
    );

    return () => {
      girlAudio.current?.pause();
      boyAudio.current?.pause();
      firstClickAudio.current?.pause();
    };
  }, []);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
  const toggleMessages = () => setMessagesVisible(!isMessagesVisible);

  const updateGreetingMessageAndBackground = () => {
    const currentHour = new Date().getHours();
    const messages = {
      morning: ['おはよー！朝から頑張って偉いね！', '/morning.webp'],
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

  const handlePageClick = () => {
    if (isFirstClick) {
      firstClickAudio.current?.play();
      setFirstClick(false); // 2回目以降は再生しない
    }
  };

  const toggleCharacter = () => {
    if (currentCharacter === 'girl1.webp') {
      girlAudio.current?.pause();
      girlAudio.current!.currentTime = 0;
      boyAudio.current?.play();
    } else {
      boyAudio.current?.pause();
      boyAudio.current!.currentTime = 0;
      girlAudio.current?.play();
    }
    setCurrentCharacter((prevCharacter) =>
      prevCharacter === 'girl1.webp' ? 'Boy1.webp' : 'girl1.webp'
    );
  };

  return (
    <div
      onClick={handlePageClick} // 初回クリック時の音声再生
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
      {/* 人物画像 */}
      <Image
        src={`/${currentCharacter}`}
        alt="Character"
        fill
        unoptimized
        style={{
          objectFit: 'contain',
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
          <li><a href="https://www.notion.so/tech0-wiki/b3f8af9f46334ce3bf32b33a33931210?pvs=4">宿題の進捗</a></li>
          <li><a href="https://www.notion.so/tech0-wiki/DB-d0fbb0915f00436da682a46420c22791?pvs=4">講義資料</a></li>
          <li><Link href="/home/checktest">理解度チェック</Link></li>
          <li><Link href="/home/maintenance">勉強する</Link></li>
          <li><Link href="/home/breather">遊びに行く</Link></li>
          <li><Link href="/home/teaming">チーミング</Link></li>
          <li><SignoutButton /></li>
        </ul>
      </div>

      <button onClick={toggleSidebar} className={styles.toggleButton}>
        {isSidebarVisible ? '<' : '>'}
      </button>

      {/* コンテンツ */}
      <div className={styles.content}>
        <div className={styles.greeting}>{greetingMessage || '...'}</div>
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
            {/* キャラクター切り替えボタン */}
            <button
        onClick={toggleCharacter}
        className={styles.characterToggleButton}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid #fff',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '48px',
          color: '#FFD700',
          width: '70px',
          height: '70px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <AiOutlineSwap />
      </button>
    </div>
  );
};

export default ClientComponent;



