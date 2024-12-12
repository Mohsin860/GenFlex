import React from 'react';
import { Box, Flex, Heading, Button } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../../utils/auth';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box bg="teal.500" px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading as="h1" size="lg" color="white">
          <Link to="/">GenFlex</Link>
        </Heading>
        <Flex alignItems={'center'}>
          {!isAuthenticated() ? (
            <>
              <Button as={Link} to="/login" colorScheme="teal" mr={4}>
                Login
              </Button>
              <Button as={Link} to="/signup" colorScheme="teal">
                Signup
              </Button>
            </>
          ) : (
            <Button colorScheme="teal" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;