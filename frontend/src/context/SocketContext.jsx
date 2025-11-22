import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      // Connect to socket
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      setSocket(newSocket);

      // Emit user online event
      newSocket.emit('user-online', user._id);

      // Listen for user status changes
      newSocket.on('user-status-change', ({ userId, isOnline }) => {
        setOnlineUsers((prev) => {
          if (isOnline) {
            if (prev.includes(userId)) return prev;
            return [...prev, userId];
          } else {
            return prev.filter((id) => id !== userId);
          }
        });
      });

      // Receive initial list of online users
      newSocket.on('online-users', (list) => {
        if (Array.isArray(list)) {
          // Ensure unique values
          const unique = Array.from(new Set(list));
          setOnlineUsers(unique);
        }
      });

      // Cleanup on unmount
      return () => {
        newSocket.off('user-status-change');
        newSocket.off('online-users');
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};