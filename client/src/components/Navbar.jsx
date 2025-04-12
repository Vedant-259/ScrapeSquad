import React from 'react';
import { Box, Flex, Button, Spacer, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box 
      bg="#1e293b" 
      px={6} 
      py={4}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
      position="relative"
      zIndex={100}
    >
      <Flex maxW="1200px" mx="auto" align="center">
        <Text 
          fontSize="22px" 
          fontWeight="700" 
          className="logo"
          display="flex"
          alignItems="center"
          color="#8b5cf6"
          _before={{
            content: '"⋮≡"',
            marginRight: "10px",
            fontSize: "24px",
            background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          <RouterLink to="/">ScrapeSquad</RouterLink>
        </Text>
        <Spacer />
        <Flex gap={4} className="nav-links">
          <Button
            className="btn"
            as={RouterLink}
            to="/contact"
            borderWidth="2px"
            borderColor="#8b5cf6"
            color="#8b5cf6"
            bg="transparent"
            _hover={{
              bg: "#8b5cf6",
              color: "#0f172a"
            }}
          >
            Contact
          </Button>
          {!isAuthenticated ? (
            <>
              <Button
                className="btn"
                as={RouterLink}
                to="/login"
                borderWidth="2px"
                borderColor="#8b5cf6"
                color="#8b5cf6"
                bg="transparent"
                _hover={{
                  bg: "#8b5cf6",
                  color: "#0f172a"
                }}
              >
                Login
              </Button>
              <Button
                className="btn"
                as={RouterLink}
                to="/register"
                borderWidth="2px"
                borderColor="#8b5cf6"
                color="#8b5cf6"
                bg="transparent"
                _hover={{
                  bg: "#8b5cf6",
                  color: "#0f172a"
                }}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              <Button
                className="btn"
                as={RouterLink}
                to="/dashboard"
                borderWidth="2px"
                borderColor="#8b5cf6"
                color="#8b5cf6"
                bg="transparent"
                _hover={{
                  bg: "#8b5cf6",
                  color: "#0f172a"
                }}
              >
                Dashboard
              </Button>
              <Button
                className="btn"
                onClick={handleLogout}
                borderWidth="2px"
                borderColor="red.500"
                color="red.500"
                bg="transparent"
                _hover={{
                  bg: "red.500",
                  color: "white"
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;