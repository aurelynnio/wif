import { SocketContext } from './socketContextBase';
import { useAuthStore } from '@/store/authStore';
import useSocket from '@/hooks/useSocket';

export const SocketProvider = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const userId = user?._id || user?.user?._id;

  const socketData = useSocket(userId);

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
