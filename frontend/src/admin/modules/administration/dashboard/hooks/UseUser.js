import { useState, useEffect } from 'react';
import { getMembers, toggleMemberStatus } from '../../services/UsersService';
import { getDashboard } from '../../services/ReportService';

function normalizeStatus(raw) {
  if (!raw) return 'ACTIVO';
  const s = String(raw).toUpperCase();
  if (s === 'ACTIVE' || s === 'ACTIVO' || s === 'ENABLED') return 'ACTIVO';
  return 'BANEADO';
}

function mapUser(u) {
  const joined = [u.firstName, u.lastName].filter(Boolean).join(' ');
  const name = u.name ?? u.fullName ?? (joined || u.email) ?? '—';

  const date = u.createdAt
    ? new Date(u.createdAt)
        .toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase()
    : '—';

  return {
    id:     u.userId ?? u.id ?? u.storeUserId,
    name,
    email:  u.email ?? '',
    role:   u.role ?? 'CLIENTE',
    status: normalizeStatus(u.status ?? (u.active === false ? 'BANNED' : 'ACTIVE')),
    date,
  };
}

export const useUsers = () => {
  const [users,       setUsers]       = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen,  setIsModalOpen]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      try {
        const [membersResult, dashResult] = await Promise.allSettled([
          getMembers(),
          getDashboard(),
        ]);
        if (cancelled) return;

        if (membersResult.status === 'fulfilled') {
          const raw = membersResult.value;
          const list = Array.isArray(raw) ? raw : raw?.content ?? [];
          setUsers(list.map(mapUser));
        } else {
          console.error('[useUsers] getMembers failed:', membersResult.reason);
        }

        if (dashResult.status === 'fulfilled') {
          setStats(dashResult.value);
        } else {
          console.error('[useUsers] getDashboard failed:', dashResult.reason);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = (updatedData) => {
    setUsers(prev =>
      prev.map(u => u.id === selectedUser.id ? { ...u, ...updatedData } : u)
    );
    setIsModalOpen(false);
  };

  const toggleStatus = async (id) => {
    try {
      await toggleMemberStatus(id);
      setUsers(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, status: u.status === 'ACTIVO' ? 'BANEADO' : 'ACTIVO' }
            : u
        )
      );
    } catch (err) {
      console.error('[useUsers] toggleStatus failed:', err);
    }
  };

  return {
    users,
    stats,
    loading,
    selectedUser,
    isModalOpen,
    setIsModalOpen,
    handleEdit,
    handleUpdate,
    toggleStatus,
  };
};
