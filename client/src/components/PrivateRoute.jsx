import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="teal.500"
          size="xl"
        />
      </Center>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute; 