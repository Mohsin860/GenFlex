// src/components/common/Header.js
import React from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  HStack, 
  useColorModeValue, 
  Container,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  Image
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getUserType } from '../../utils/auth';
import { FaChevronDown } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const userType = getUserType();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const user = isAuth ? JSON.parse(localStorage.getItem('user')) : null;
  const userName = user ? user.name : '';
  const userInitials = userName.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <Box bg={bgColor} px={4} boxShadow="sm" position="sticky" top="0" zIndex="1000" borderBottom="1px" borderColor={borderColor}>
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={4} alignItems="center">
            <Link to="/">
              <HStack>
                <Image 
                  src="/images/GenFlexLogo.jpg" 
                  alt="GenFlex Logo" 
                  height="40px"
                  objectFit="contain"
                />
                <Heading as="h1" size="md" fontWeight="bold" color="brand.600" display={{ base: 'none', md: 'block' }}>
                  GenFlex
                </Heading>
              </HStack>
            </Link>
            {isAuth && (
              <HStack
                as="nav"
                spacing={4}
                display={{ base: 'none', md: 'flex' }}
              >
                {userType === 'faculty' ? (
                  <>
                    <Link to="/faculty">
                      <Text fontWeight="medium" color="gray.600" _hover={{ color: "brand.500" }}>Dashboard</Text>
                    </Link>
                    <Link to="/manage-exams">
                      <Text fontWeight="medium" color="gray.600" _hover={{ color: "brand.500" }}>Manage Exams</Text>
                    </Link>
                    <Link to="/faculty/create-exam">
                      <Text fontWeight="medium" color="gray.600" _hover={{ color: "brand.500" }}>Create Essay Exam</Text>
                    </Link>
                    <Link to="/faculty/create-coding-exam">
                      <Text fontWeight="medium" color="gray.600" _hover={{ color: "brand.500" }}>Create Tech Exam</Text>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/student">
                      <Text fontWeight="medium" color="gray.600" _hover={{ color: "brand.500" }}>Dashboard</Text>
                    </Link>
                  </>
                )}
              </HStack>
            )}
          </HStack>
          <Flex alignItems="center">
            {!isAuth ? (
              <HStack spacing={4}>
                <Button as={Link} to="/login" variant="outline" colorScheme="brand">
                  Login
                </Button>
                <Button as={Link} to="/signup" colorScheme="brand">
                  Sign Up
                </Button>
              </HStack>
            ) : (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <HStack>
                    <Avatar
                      size="sm"
                      name={userName}
                      bg="brand.500"
                      color="white"
                    >
                      {userInitials}
                    </Avatar>
                    <Text display={{ base: 'none', md: 'block' }}>{userName}</Text>
                    <Icon as={FaChevronDown} w={3} h={3} />
                  </HStack>
                </MenuButton>
                <MenuList zIndex={100}>
                  <MenuItem as={Link} to={userType === 'faculty' ? '/faculty' : '/student'}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;