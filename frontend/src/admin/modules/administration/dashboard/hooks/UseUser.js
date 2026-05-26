import { useState } from 'react';

export const useUsers = (initialUsers) => {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API PLACEHOLDER: GET USERS
  // useEffect(() => { fetchUsers().then(setUsers) }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = (updatedData) => {
    // API PLACEHOLDER: PATCH /users/:id
    // await api.patch(`/users/${selectedUser.id}`, updatedData);
    
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updatedData } : u));
    setIsModalOpen(false);
  };

  const toggleStatus = (id) => {
    // API PLACEHOLDER: POST /users/:id/toggle-status
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'ACTIVO' ? 'BANEADO' : 'ACTIVO';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  return { users, selectedUser, isModalOpen, setIsModalOpen, handleEdit, handleUpdate, toggleStatus };
};