import { useState, useEffect } from 'react';
import accountService from '../services/accountService';

export function useAccount() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await accountService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  return { profile, setProfile, loading, error, fetchProfile };
}