// frontend/src/app/home/teaming/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import styles from "./teaming.module.css";
import Modal from "react-modal";
import Image from "next/image";

const RadarChart = dynamic(() => import("../../components/RadarChart"), { ssr: false });

interface User {
  user_id: number;
  name: string;
  avatar_url?: string;
  biz?: number;
  design?: number;
  tech?: number;
  specialties?: string[];
  orientations?: string[];
  core_time?: string;
  role?: string;
  team_id?: number;
}

interface Roles {
  PdM: User | User[] | null;
  Biz: User | User[] | null;
  Tech: User | User[] | null;
  Design: User | User[] | null;
}

interface ChartData {
  biz: number;
  design: number;
  tech: number;
}

// 学習フェーズごとの目標値
const phaseGoals = {
  step1: { biz: 100, design: 80, tech: 60 },
  step2: { biz: 150, design: 120, tech: 100 },
  step3: { biz: 200, design: 160, tech: 140 },
  step4: { biz: 250, design: 200, tech: 180 },
};

export default function Teaming() {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Roles>({
    PdM: null,
    Biz: null,
    Tech: null,
    Design: null,
  });
  const [chartData, setChartData] = useState<ChartData>({ biz: 0, design: 0, tech: 0 });

  // 現在の学習フェーズ（初期値はステップ1）
  const [currentPhase, setCurrentPhase] = useState<keyof typeof phaseGoals>("step1");

  // 現在のフェーズに基づく目標値
  const [teamGoals, setTeamGoals] = useState(phaseGoals[currentPhase]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    specialties: [] as string[],      // 配列に戻す
    orientations: [] as string[],     // 配列に戻す
  });
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<number[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const appElement = document.querySelector('#__next');
    if (appElement) {
      Modal.setAppElement('#__next');
    } else {
      console.warn("Modal.setAppElement: '#__next' が見つからないため body を使用します。");
      Modal.setAppElement('body');
    }
  }, []);

  // 現在の学習フェーズが変更されたときに目標値を更新
  useEffect(() => {
    setTeamGoals(phaseGoals[currentPhase]);
  }, [currentPhase]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      if (!session || !session.accessToken) {
        console.error("セッションがありません");
        return;
      }

      const response = await axios.get<User>(`${baseUrl}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setCurrentUser(response.data);
      if (response.data.team_id) {
        setCurrentTeamId(response.data.team_id);
      } else {
        setCurrentTeamId(null);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to fetch current user:", err.response?.data || err.message);
      } else {
        console.error("Failed to fetch current user:", (err as Error).message);
      }
    }
  }, [session, baseUrl]);

  const fetchTeamInfo = useCallback(async () => {
    if (!currentTeamId) {
      setRoles({ PdM: null, Biz: null, Tech: null, Design: null });
      setChartData({ biz: 0, design: 0, tech: 0 });
      return;
    }

    try {
      const response = await axios.get<User[]>(`${baseUrl}/api/team/${currentTeamId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const teamMembersData = response.data;

      const newRoles: Roles = { PdM: null, Biz: null, Tech: null, Design: null };

      teamMembersData.forEach((member: User) => {
        const r = member.role as keyof Roles;
        if (!r) return;
        const currentValue = newRoles[r];
        if (currentValue === null) {
          newRoles[r] = member;
        } else if (Array.isArray(currentValue)) {
          (newRoles[r] as User[]).push(member); // 型アサーションを追加
        } else {
          newRoles[r] = [currentValue, member];
        }
      });

      setRoles(newRoles);

      const aggregated = teamMembersData.reduce((acc: ChartData, member: User) => {
        acc.biz += member.biz || 0;
        acc.design += member.design || 0;
        acc.tech += member.tech || 0;
        return acc;
      }, { biz: 0, design: 0, tech: 0 });

      setChartData(aggregated);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to fetch team info:", err.response?.data || err.message);
      } else {
        console.error("Failed to fetch team info:", (err as Error).message);
      }
    }
  }, [currentTeamId, baseUrl, session?.accessToken]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTeamInfo();
    }
  }, [currentUser, fetchTeamInfo]);

  const handleAddMemberClick = useCallback((role: string) => {
    const isUserInAnyRole = Object.values(roles).some(roleData => {
      if (Array.isArray(roleData)) {
        return roleData.some(member => member.user_id === currentUser?.user_id);
      }
      return roleData?.user_id === currentUser?.user_id;
    });

    if (isUserInAnyRole) {
      if (confirm("新規メンバーを検索しますか？")) {
        setSelectedRole(role);
        setIsModalOpen(true);
      }
    } else {
      setSelectedRole(role);
      setIsModalOpen(true);
    }
  }, [roles, currentUser]);

  const handleSearch = useCallback(async () => {
    try {
      // フィルターが空の場合、全ユーザーを取得するために必要な処理を行う
      const filters = {
        name: searchFilters.name.trim() === "" ? undefined : searchFilters.name,
        specialties: searchFilters.specialties.length > 0 ? searchFilters.specialties : undefined,
        orientations: searchFilters.orientations.length > 0 ? searchFilters.orientations : undefined,
      };

      const response = await axios.post<{data: User[]}>(`${baseUrl}/api/user/search`, filters, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setSearchResults(response.data.data);

      if (currentTeamId) {
        const unfilledRoles = ["PdM", "Biz", "Tech", "Design"].filter(r => !roles[r as keyof Roles]);

        const recommended = response.data.data.filter((u: User) => {
          return (u.orientations ?? []).length > 0 && unfilledRoles.some(r => (u.orientations ?? []).includes(r));
        }).map((u: User) => u.user_id);

        setRecommendedUsers(recommended);
      } else {
        setRecommendedUsers([]);
      }

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to search users:", err.response?.data || err.message);
      } else {
        console.error("Failed to search users:", (err as Error).message);
      }
    }
  }, [baseUrl, currentTeamId, roles, searchFilters, session?.accessToken]);

  const handleRemoveMember = useCallback(async (role: string) => {
    if (!currentTeamId) {
      alert("チームが存在しません");
      return;
    }

    if (confirm("このメンバーを外しますか？")) {
      try {
        await axios.delete(`${baseUrl}/api/team/remove_member`, {
          data: {
            team_id: currentTeamId,
            role: role
          },
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        alert("メンバーを削除しました！レーダーチャートを更新します。");
        fetchTeamInfo();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Failed to remove team member:", err.response?.data || err.message);
        } else {
          console.error("Failed to remove team member:", (err as Error).message);
        }
        alert("メンバーの削除に失敗しました");
      }
    }
  }, [baseUrl, currentTeamId, fetchTeamInfo, session?.accessToken]);

  const handleSelectUser = useCallback(async (role: string | null, user: User) => {
    if (!role) {
      alert("ロールが未選択です");
      return;
    }
    if (!currentTeamId) {
      alert("チームが存在しません");
      return;
    }

    try {
      await axios.post(`${baseUrl}/api/team/add_member`, {
        team_id: currentTeamId,
        role: role,
        user_id: user.user_id
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      alert("メンバーを追加しました！レーダーチャートを更新します。");
      setIsModalOpen(false);
      fetchTeamInfo();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to add team member:", err.response?.data || err.message);
      } else {
        console.error("Failed to add team member:", (err as Error).message);
      }
      alert("メンバーの追加に失敗しました");
    }
  }, [baseUrl, currentTeamId, fetchTeamInfo, session?.accessToken]);

  const handleCreateTeam = useCallback(async () => {
    try {
      const response = await axios.post<{team_id: number}>(`${baseUrl}/api/team/create`, {
        name: newTeamName
      }, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      alert("チームが作成されました");
      setCurrentTeamId(response.data.team_id);
      setIsCreateTeamModalOpen(false);
      fetchTeamInfo();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to create team:", err.response?.data || err.message);
      } else {
        console.error("Failed to create team:", (err as Error).message);
      }
      alert("チームの作成に失敗しました");
    }
  }, [baseUrl, fetchTeamInfo, newTeamName, session?.accessToken]);

  // リセットボタンのハンドラー
  const handleResetFilters = useCallback(() => {
    setSearchFilters({
      name: "",
      specialties: [],
      orientations: [],
    });
  }, []);

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>チーム</h2>
        <ul>
          <li className={styles.active}>チーム構成</li>
          <li>メンバー募集</li>
          <li>メンバー検索</li>
          <li>プロフィール</li>
          <li>メッセージ</li>
        </ul>
      </aside>

      <main className={styles.main}>
        {/* 学習フェーズのドロップダウンを追加 */}
        <div className={styles.phaseSelector}>
          <label htmlFor="phase-select">学習フェーズ: </label>
          <select
            id="phase-select"
            value={currentPhase}
            onChange={(e) => setCurrentPhase(e.target.value as keyof typeof phaseGoals)}
          >
            {Object.keys(phaseGoals).map((phase) => (
              <option key={phase} value={phase}>
                {phase.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {currentTeamId ? (
          <>
            <div className={styles.roles}>
              {(["PdM", "Biz", "Tech", "Design"] as (keyof Roles)[]).map((role) => {
                const roleData = roles[role];
                return (
                  <div key={role} className={styles.roleCard}>
                    <div className={styles.roleHeader} style={{ backgroundColor: getRoleColor(role) }}>
                      {role}
                      <button onClick={() => handleAddMemberClick(role)} className={styles.addButton}>
                        +
                      </button>
                    </div>
                    {roleData && (
                      <div className={styles.roleDetails}>
                        {Array.isArray(roleData) ? (
                          roleData.map((member) => (
                            <div key={member.user_id} className={styles.member}>
                              <Image
                                src={member.avatar_url || "/default-avatar.png"}
                                alt={member.name}
                                className={styles.avatar}
                                width={50}
                                height={50}
                              />
                              <p>{member.name}</p>
                              <button onClick={() => handleRemoveMember(role)}>メンバーを外す</button>
                            </div>
                          ))
                        ) : (
                          <div className={styles.member}>
                            <Image
                              src={roleData.avatar_url || "/default-avatar.png"}
                              alt={roleData.name}
                              className={styles.avatar}
                              width={50}
                              height={50}
                            />
                            <p>{roleData.name}</p>
                            <button onClick={() => handleRemoveMember(role)}>メンバーを外す</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.chartContainer}>
              <RadarChart
                skills={chartData}
                goals={teamGoals}
                mode="team"
                stepSize={50} // チーム用にstepSizeを50に設定
                labels={{ goals: "目標値", skills: "チームの能力値" }} // 凡例を変更
              />
            </div>
          </>
        ) : (
          <div>
            <p>現在、あなたはどのチームにも所属していません。</p>
            <p>新たにチームを作成しますか？</p>
            <button onClick={() => setIsCreateTeamModalOpen(true)}>チームを作成</button>
          </div>
        )}
      </main>

      {/* メンバー検索モーダル */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="メンバー検索"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>メンバーを追加</h2>
        <div className={styles.searchFilters}>
          {/* 名前検索 */}
          <div className={styles.filterGroup}>
            <label htmlFor="search-name">名前で検索:</label>
            <input
              type="text"
              id="search-name"
              placeholder="名前で検索"
              value={searchFilters.name}
              onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
            />
          </div>

          {/* 得意分野 */}
          <div className={styles.filterGroup}>
            <label htmlFor="search-specialties">得意分野:</label>
            <select
              id="search-specialties"
              value={searchFilters.specialties[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSearchFilters({ 
                  ...searchFilters, 
                  specialties: value ? [value] : [] 
                });
              }}
            >
              <option value="">すべて</option> {/* リセット用 */}
              <option value="Tech">Tech</option>
              <option value="Design">Design</option>
              <option value="Biz">Biz</option>
            </select>
            <button 
              onClick={() => setSearchFilters({ ...searchFilters, specialties: [] })} 
              className={styles.resetButton}
            >
              リセット
            </button>
          </div>

          {/* 志向性 */}
          <div className={styles.filterGroup}>
            <label htmlFor="search-orientations">志向性:</label>
            <select
              id="search-orientations"
              value={searchFilters.orientations[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSearchFilters({ 
                  ...searchFilters, 
                  orientations: value ? [value] : [] 
                });
              }}
            >
              <option value="">すべて</option> {/* リセット用 */}
              <option value="Tech">Tech</option>
              <option value="Design">Design</option>
              <option value="Biz">Biz</option>
              <option value="PdM">PdM</option>
            </select>
            <button 
              onClick={() => setSearchFilters({ ...searchFilters, orientations: [] })} 
              className={styles.resetButton}
            >
              リセット
            </button>
          </div>

          {/* 検索ボタンと全てリセットボタン */}
          <div className={styles.searchActions}>
            <button onClick={handleSearch}>検索</button>
            <button onClick={handleResetFilters} className={styles.resetAllButton}>全てリセット</button>
          </div>
        </div>

        {/* 検索結果 */}
        <div className={styles.searchResults}>
          {searchResults.map((user) => (
            <div key={user.user_id} className={styles.searchResult}>
              <Image
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.name}
                className={styles.avatar}
                width={50}
                height={50}
              />
              <div className={styles.userInfo}>
                <p><strong>{user.name}</strong></p>
                <p>
                  得意分野:{" "}
                  {user.specialties && user.specialties.length > 0
                    ? user.specialties.join(", ")
                    : "登録なし"}
                </p>
                <p>
                  志向性:{" "}
                  {user.orientations && user.orientations.length > 0
                    ? user.orientations.join(", ")
                    : "登録なし"}
                </p>
                <p>
                  コアタイム:{" "}
                  {user.core_time && user.core_time.trim() !== ""
                    ? user.core_time
                    : "登録なし"}
                </p>
              </div>
              {recommendedUsers.includes(user.user_id) && <span className={styles.recommended}>おすすめ</span>}
              <button onClick={() => handleSelectUser(selectedRole, user)} className={styles.addButton}>
                追加
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>閉じる</button>
      </Modal>

      {/* チーム作成モーダル */}
      <Modal
        isOpen={isCreateTeamModalOpen}
        onRequestClose={() => setIsCreateTeamModalOpen(false)}
        contentLabel="チーム作成"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>新しいチームを作成</h2>
        <input
          type="text"
          placeholder="チーム名を入力"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className={styles.teamNameInput}
        />
        <div className={styles.createTeamActions}>
          <button onClick={handleCreateTeam} className={styles.createButton}>作成</button>
          <button onClick={() => setIsCreateTeamModalOpen(false)} className={styles.closeButton}>閉じる</button>
        </div>
      </Modal>
    </div>
  );
}

function getRoleColor(role: string): string {
  switch (role) {
    case "PdM":
      return "#FFCCCC";
    case "Biz":
      return "#FFCCFF";
    case "Tech":
      return "#CCCCFF";
    case "Design":
      return "#CCFFCC";
    default:
      return "#FFFFFF";
  }
}
