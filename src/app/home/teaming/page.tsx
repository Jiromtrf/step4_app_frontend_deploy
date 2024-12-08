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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    specialties: [] as string[],
    orientations: [] as string[],
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
      // 未使用のためコメントアウト
      // const teamMembers = response.data;

      const teamMembersData = response.data; // ここで使用していないので削除するか使用する
      const newRoles: Roles = { PdM: null, Biz: null, Tech: null, Design: null };

      teamMembersData.forEach((member: User) => {
        const r = member.role as keyof Roles;
        if (!r) return;
        const currentValue = newRoles[r];
        if (currentValue === null) {
          newRoles[r] = member;
        } else if (Array.isArray(currentValue)) {
          currentValue.push(member);
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
      if (confirm("現在あなたは他の役割に登録されています。それでも新規メンバーを検索しますか？")) {
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
      const response = await axios.post<{data: User[]}>(`${baseUrl}/api/user/search`, searchFilters, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setSearchResults(response.data.data);

      if (currentTeamId) {
        // teamMembersData は未使用のため削除
        await axios.get<User[]>(`${baseUrl}/api/team/${currentTeamId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const unfilledRoles = ["PdM", "Biz", "Tech", "Design"].filter(r => !roles[r as keyof Roles]);

        const recommended = response.data.data.filter((u: User) => {
          return u.orientations && unfilledRoles.some(r => u.orientations.includes(r));
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

  const handleRemoveMember = useCallback(async (role: string) => { // 'user' パラメータを削除
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
              <RadarChart skills={chartData} />
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
          <input
            type="text"
            placeholder="名前で検索"
            value={searchFilters.name}
            onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
          />
          <select
            multiple
            value={searchFilters.specialties}
            onChange={(e) => {
              const options = e.target.options;
              const selected: string[] = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selected.push(options[i].value);
                }
              }
              setSearchFilters({ ...searchFilters, specialties: selected });
            }}
          >
            <option value="Tech">Tech</option>
            <option value="Design">Design</option>
            <option value="Biz">Biz</option>
          </select>
          <select
            multiple
            value={searchFilters.orientations}
            onChange={(e) => {
              const options = e.target.options;
              const selected: string[] = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selected.push(options[i].value);
                }
              }
              setSearchFilters({ ...searchFilters, orientations: selected });
            }}
          >
            <option value="Tech">Tech</option>
            <option value="Design">Design</option>
            <option value="Biz">Biz</option>
            <option value="PdM">PdM</option>
          </select>
          <button onClick={handleSearch}>検索</button>
        </div>
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
              <div>
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
              <button onClick={() => handleSelectUser(selectedRole, user)}>追加</button>
            </div>
          ))}

        </div>
        <button onClick={() => setIsModalOpen(false)}>閉じる</button>
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
        />
        <button onClick={handleCreateTeam}>作成</button>
        <button onClick={() => setIsCreateTeamModalOpen(false)}>閉じる</button>
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
