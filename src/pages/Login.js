// src/pages/Login.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
  Link as ChakraLink,
  FormErrorMessage,
  Container,
  Flex,
  Image,
  useColorModeValue,
  Card
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import { FaEye, FaEyeSlash, FaUserAlt, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const user = await login({ email, password });
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(user.userType === 'faculty' ? '/faculty' : '/student');
    } catch (error) {
      console.error('Login error in component:', error);
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)" py={10}>
      <Container maxW="md">
        <Card
          bg={cardBg}
          p={8}
          borderRadius="lg"
          boxShadow="xl"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Flex direction="column" align="center" w="full">
              <Image 
                src="/images/GenFlexLogo.jpg" 
                alt="GenFlex Logo" 
                height="80px" 
                objectFit="contain"
                mb={4}
              />
              <Heading as="h1" size="xl" textAlign="center" mb={2}>Login</Heading>
              <Text color="gray.600" textAlign="center">Welcome back! Please enter your credentials.</Text>
            </Flex>
            
            <FormControl id="email" isRequired isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your.email@example.com"
                  borderRadius="md"
                  pl="10"
                />
                <Box position="absolute" left="3" top="3" zIndex="2" color="gray.500">
                  <Icon as={FaUserAlt} />
                </Box>
              </InputGroup>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl id="password" isRequired isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="********"
                  borderRadius="md"
                  pl="10"
                />
                <Box position="absolute" left="3" top="3" zIndex="2" color="gray.500">
                  <Icon as={FaLock} />
                </Box>
                <InputRightElement width="3rem">
                  <Button 
                    h="1.5rem" 
                    size="sm" 
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  >
                    <Icon as={showPassword ? FaEyeSlash : FaEye} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="full"
              size="lg"
              isLoading={loading}
              loadingText="Logging in"
              mt={4}
              boxShadow="md"
              _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              Log In
            </Button>
            
            <Text textAlign="center">
              Don't have an account? {" "}
              <ChakraLink as={Link} to="/signup" color="teal.500" fontWeight="semibold">
                Sign up
              </ChakraLink>
            </Text>
          </VStack>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;