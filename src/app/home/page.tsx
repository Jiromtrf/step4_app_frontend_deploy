"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../page.module.css';
import SignoutButton from "../components/SignoutButton";

interface Reaction {
  name: string;
  count: number;
}

interface MessageData {
  text: string;
  user: string;
  reactions: Reaction[];
  channel: string;
  timestamp: string;
  thread_ts: string;
}

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [isMessagesVisible, setMessagesVisible] = useState<boolean>(true);
  const [greetingMessage, setGreetingMessage] = useState<string>('');
  const [audioPlayed, setAudioPlayed] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const toggleMessages = useCallback(() => {
    setMessagesVisible(prev => !prev);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get<{data: MessageData[]}>('https://tech0-gen-7-step4-studentwebapp-pos-2-g7czbec8g5amg9hv.eastus-01.azurewebsites.net/get_messages/');
      setMessages(response.data.data);
    } catch (err: unknown) {
      setError('メッセージの取得に失敗しました');
      if (axios.isAxiosError(err)) {
        console.error('Error retrieving messages:', err.response?.data || err.message);
      } else {
        console.error('Error retrieving messages:', (err as Error).message);
      }
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (message.trim() === '') return;
    try {
      const response = await axios.post('https://tech0-gen-7-step4-studentwebapp-pos-2-g7czbec8g5amg9hv.eastus-01.azurewebsites.net/send_message/', { text: message });
      console.log('Message sent:', response.data);
      setMessage('');
      fetchMessages();
    } catch (err: unknown) {
      setError('メッセージの送信に失敗しました');
      if (axios.isAxiosError(err)) {
        console.error('Error sending message:', err.response?.data || err.message);
      } else {
        console.error('Error sending message:', (err as Error).message);
      }
    }
  }, [message, fetchMessages]);

  const typeWriterEffect = useCallback((text: string, delay: number = 80) => {
    let index = 0;
    setGreetingMessage('');
    const interval = setInterval(() => {
      setGreetingMessage(text.slice(0, index + 1)); // 'prev' 引数を削除
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, delay);
  }, []);

  const updateGreetingMessage = useCallback(() => {
    const currentHour = new Date().getHours();
    const messagesMap = {
      morning: ['おはよー！朝から頑張って偉いね！'],
      afternoon: ['やっほー！今日も頑張ろう！'],
      evening: ['ここからがコアタイムだねー！'],
      night: ['遅くまでえらいねー。もうひとふんばり！'],
      lateNight: ['お疲れ様！そろそろ寝た方がいいよ！'],
    };
    let selectedMessages: string[];
    if (currentHour >= 5 && currentHour < 12) {
      selectedMessages = messagesMap.morning;
    } else if (currentHour >= 12 && currentHour < 17) {
      selectedMessages = messagesMap.afternoon;
    } else if (currentHour >= 17 && currentHour < 21) {
      selectedMessages = messagesMap.evening;
    } else if (currentHour >= 21 && currentHour < 24) {
      selectedMessages = messagesMap.night;
    } else {
      selectedMessages = messagesMap.lateNight;
    }
    const randomMessage = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
    typeWriterEffect(randomMessage);
  }, [typeWriterEffect]);

  const playAudio = useCallback(() => {
    const audio = new Audio('/お疲れ様です.mp3');
    audio.play().catch((err) => console.error('音声再生エラー:', err));
  }, []);

  const handlePlayAudio = useCallback(() => {
    if (!audioPlayed) {
      playAudio();
      setAudioPlayed(true);
    }
  }, [audioPlayed, playAudio]);

  useEffect(() => {
    fetchMessages();
    updateGreetingMessage();
  }, [fetchMessages, updateGreetingMessage]);

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
          <li><Link href="/home/teaming">チーミング</Link></li>
          <li><SignoutButton /></li>
        </ul>
      </div>
      <button onClick={toggleSidebar} className={styles.toggleButton}>
        {isSidebarVisible ? '<' : '>'}
      </button>
      <div className={styles.content}>
        <div className={styles.greeting}>{greetingMessage}</div>
        {error && <div style={{ color: 'red', marginBottom: '1em' }}>{error}</div>}
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
