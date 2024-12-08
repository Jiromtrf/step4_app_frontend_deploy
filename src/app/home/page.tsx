"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../page.module.css';
import SignoutButton from "../components/SignoutButton";

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<{
    text: string;
    user: string;
    reactions: { name: string; count: number }[];
    channel: string;
    timestamp: string;
    thread_ts: string;
  }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [isMessagesVisible, setMessagesVisible] = useState<boolean>(true);
  const [greetingMessage, setGreetingMessage] = useState<string>('');
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const toggleMessages = () => {
    setMessagesVisible(!isMessagesVisible);
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;
    try {
      const response = await axios.post('http://localhost:8000/send_message/', { text: message });
      console.log('Message sent:', response.data);
      setMessage('');
      fetchMessages();
    } catch (err) {
      setError('メッセージの送信に失敗しました');
      console.error('Error sending message:', err.response ? err.response.data : err.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:8000/get_messages/');
      setMessages(response.data.data);
    } catch (err) {
      setError('メッセージの取得に失敗しました');
      console.error('Error retrieving messages:', err.response ? err.response.data : err.message);
    }
  };

  const typeWriterEffect = (text: string, delay: number = 80) => {
    let index = 0;
    setGreetingMessage('');
    const interval = setInterval(() => {
      setGreetingMessage(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, delay);
  };

  const updateGreetingMessage = () => {
    const currentHour = new Date().getHours();
    const messages = {
      morning: ['おはよー！朝から頑張って偉いね！'],
      afternoon: ['やっほー！今日も頑張ろう！'],
      evening: ['ここからがコアタイムだねー！'],
      night: ['遅くまでえらいねー。もうひとふんばり！'],
      lateNight: ['お疲れ様！そろそろ寝た方がいいよ！'],
    };
    let selectedMessages = [];
    if (currentHour >= 5 && currentHour < 12) {
      selectedMessages = messages.morning;
    } else if (currentHour >= 12 && currentHour < 17) {
      selectedMessages = messages.afternoon;
    } else if (currentHour >= 17 && currentHour < 21) {
      selectedMessages = messages.evening;
    } else if (currentHour >= 21 && currentHour < 24) {
      selectedMessages = messages.night;
    } else {
      selectedMessages = messages.lateNight;
    }
    const randomMessage = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
    typeWriterEffect(randomMessage);
  };

  const playAudio = () => {
    const audio = new Audio('/お疲れ様です.mp3');
    audio.play().catch((err) => console.error('音声再生エラー:', err));
  };

  const handlePlayAudio = () => {
    if (!audioPlayed) {
      playAudio();
      setAudioPlayed(true);
    }
  };

  useEffect(() => {
    fetchMessages();
    updateGreetingMessage();
  }, []);

  return (
    <div className={styles.container} onClick={handlePlayAudio}>
      <div
        className={`${styles.sidebar} ${
          isSidebarVisible ? styles.sidebarVisible : styles.sidebarHidden
        }`}
      >
        <h2>機能一覧</h2>
        <ul className={styles.sidebarList}>
          <li><Link href="/home/dashboard">ステータス確認</Link></li>
          <li><a href="#">宿題の進捗</a></li>
          <li><a href="#">講義資料</a></li>
          <li><Link href="/home/checktest">理解度チェック</Link></li>
          <li><a href="#">勉強する</a></li>
          <li><a href="#">遊びに行く</a></li>
          <li>
            <Link href="/home/teaming">チーミング</Link>
          </li>
          <li><SignoutButton /></li>
        </ul>
      </div>
      <button onClick={toggleSidebar} className={styles.toggleButton}>
        {isSidebarVisible ? '<' : '>'}
      </button>
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
          <button onClick={sendMessage} className={styles.button}>送信</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
