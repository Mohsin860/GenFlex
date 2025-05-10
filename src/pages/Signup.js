// src/pages/Signup.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Select,
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
import { signup } from '../utils/auth';
import { FaEye, FaEyeSlash, FaUserAlt, FaEnvelope, FaLock, FaUserGraduate } from 'react-icons/fa';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!userType) newErrors.userType = 'Please select a role';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await signup({ name, email, password, userType });
      toast({
        title: 'Account created',
        description: "Your account has been created successfully. Please log in.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      console.error('Signup error in component:', error);
      toast({
        title: 'Signup failed',
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
              <Heading as="h1" size="xl" textAlign="center" mb={2}>Create Account</Heading>
              <Text color="gray.600" textAlign="center">Join GenFlex and start your educational journey</Text>
            </Flex>
            
            <FormControl id="name" isRequired isInvalid={errors.name}>
              <FormLabel>Full Name</FormLabel>
              <InputGroup>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                  borderRadius="md"
                  pl="10"
                />
                <Box position="absolute" left="3" top="3" zIndex="2" color="gray.500">
                  <Icon as={FaUserAlt} />
                </Box>
              </InputGroup>
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
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
                  <Icon as={FaEnvelope} />
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
                  placeholder="Create a password"
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
            
            <FormControl id="userType" isRequired isInvalid={errors.userType}>
              <FormLabel>Role</FormLabel>
              <InputGroup>
                <Select 
                  placeholder="Select your role" 
                  value={userType} 
                  onChange={(e) => setUserType(e.target.value)}
                  borderRadius="md"
                  pl="10"
                >
                  <option value="faculty">Faculty / Teacher</option>
                  <option value="student">Student</option>
                </Select>
                <Box position="absolute" left="3" top="3" zIndex="2" color="gray.500">
                  <Icon as={FaUserGraduate} />
                </Box>
              </InputGroup>
              <FormErrorMessage>{errors.userType}</FormErrorMessage>
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="full"
              size="lg"
              isLoading={loading}
              loadingText="Creating account"
              mt={4}
              boxShadow="md"
              _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              Sign Up
            </Button>
            
            <Text textAlign="center">
              Already have an account? {" "}
              <ChakraLink as={Link} to="/login" color="teal.500" fontWeight="semibold">
                Log in
              </ChakraLink>
            </Text>
          </VStack>
        </Card>
      </Container>
    </Box>
  );
};

export default Signup;