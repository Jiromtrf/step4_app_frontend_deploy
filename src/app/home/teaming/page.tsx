"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import styles from "./teaming.module.css";
import Modal from "react-modal";

const RadarChart = dynamic(() => import("../../components/RadarChart"), { ssr: false });

export default function Teaming() {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roles, setRoles] = useState<{
    PdM: any | null,
    Biz: any | null,
    Tech: any | null,
    Design: any | null,
  }>({
    PdM: null,
    Biz: null,
    Tech: null,
    Design: null,
  });
  const [chartData, setChartData] = useState({ biz: 0, design: 0, tech: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    specialties: [] as string[],
    orientations: [] as string[],
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<string[]>([]);
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

  const fetchCurrentUser = async () => {
    try {
      if (!session || !session.accessToken) {
        console.error("セッションがありません");
        return;
      }

      const response = await axios.get(`${baseUrl}/api/user/me`, {
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
    } catch (err: any) {
      console.error("Failed to fetch current user:", err.response?.data || err.message || err);
    }
  };

  const fetchTeamInfo = async () => {
    if (!currentTeamId) {
      setRoles({ PdM: null, Biz: null, Tech: null, Design: null });
      setChartData({ biz: 0, design: 0, tech: 0 });
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/api/team/${currentTeamId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      // 未使用のためコメントアウト
      // const teamMembers = response.data;

      const teamMembersData = response.data; // 実際には別名で代替使用
      const newRoles: any = { PdM: null, Biz: null, Tech: null, Design: null };

      teamMembersData.forEach((member: any) => {
        if (newRoles[member.role]) {
          if (Array.isArray(newRoles[member.role])) {
            newRoles[member.role].push(member);
          } else {
            newRoles[member.role] = [newRoles[member.role], member];
          }
        } else {
          newRoles[member.role] = member;
        }
      });

      setRoles(newRoles);

      const aggregated = teamMembersData.reduce((acc: any, member: any) => {
        acc.biz += member.biz || 0;
        acc.design += member.design || 0;
        acc.tech += member.tech || 0;
        return acc;
      }, { biz: 0, design: 0, tech: 0 });

      setChartData(aggregated);
    } catch (err: any) {
      console.error("Failed to fetch team info:", err.response?.data || err.message || err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [session]);

  useEffect(() => {
    if (currentUser) {
      fetchTeamInfo();
    }
  }, [currentUser]);

  const handleAddMemberClick = (role: string) => {
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
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/user/search`, searchFilters, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setSearchResults(response.data.data);

      if (currentTeamId) {
        const teamInfoResponse = await axios.get(`${baseUrl}/api/team/${currentTeamId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const teamInfo = teamInfoResponse.data;

        const unfilledRoles = ["PdM", "Biz", "Tech", "Design"].filter(r => !roles[r]);
        const recommended = response.data.data.filter((u: any) => {
          return unfilledRoles.some(r => u.orientations.includes(r));
        }).map((u: any) => u.user_id);

        setRecommendedUsers(recommended);
      } else {
        setRecommendedUsers([]);
      }

    } catch (err: any) {
      console.error("Failed to search users:", err.response?.data || err.message || err);
    }
  };

  // userが未使用と指摘された箇所を想定してコメントアウト
  // 例えば、メンバー削除関数でuserを受け取っているが使っていない場合:
  const handleRemoveMember = async (role: string /*, user: any */) => { // userをコメントアウト
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
      } catch (err: any) {
        console.error("Failed to remove team member:", err.response?.data || err.message || err);
        alert("メンバーの削除に失敗しました");
      }
    }
  };

  const handleSelectUser = async (role: string | null, user: any) => {
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
    } catch (err: any) {
      console.error("Failed to add team member:", err.response?.data || err.message || err);
      alert("メンバーの追加に失敗しました");
    }
  };

  const handleCreateTeam = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/team/create`, {
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
    } catch (err: any) {
      console.error("Failed to create team:", err.response?.data || err.message || err);
      alert("チームの作成に失敗しました");
    }
  };


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
              {["PdM", "Biz", "Tech", "Design"].map((role) => (
                <div key={role} className={styles.roleCard}>
                  <div className={styles.roleHeader} style={{ backgroundColor: getRoleColor(role) }}>
                    {role}
                    <button onClick={() => handleAddMemberClick(role)} className={styles.addButton}>
                      +
                    </button>
                  </div>
                  {roles[role] && (
                    <div className={styles.roleDetails}>
                      {Array.isArray(roles[role]) ? (
                        roles[role].map((member: any) => (
                          <div key={member.user_id} className={styles.member}>
                            <img
                              src={member.avatar_url || "/default-avatar.png"}
                              alt={member.name}
                              className={styles.avatar}
                            />
                            <p>{member.name}</p>
                            <button onClick={() => handleRemoveMember(role/*, member*/)}>メンバーを外す</button>
                          </div>
                        ))
                      ) : (
                        <div className={styles.member}>
                          <img
                            src={roles[role]?.avatar_url || "/default-avatar.png"}
                            alt={roles[role]?.name}
                            className={styles.avatar}
                          />
                          <p>{roles[role]?.name}</p>
                          <button onClick={() => handleRemoveMember(role/*, roles[role]*/)}>メンバーを外す</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
            <img src={user.avatar_url || "/default-avatar.png"} alt={user.name} className={styles.avatar} />
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
