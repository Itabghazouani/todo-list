'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { User } from '@prisma/client';

const UserContext = createContext<{
  user: User | null;
  loading: boolean;
}>({ user: null, loading: true });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      // Fetch user data from your MongoDB database
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
