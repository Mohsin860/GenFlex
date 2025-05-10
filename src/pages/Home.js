// src/pages/Home.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Container,
  Grid,
  GridItem,
  Icon,
  Card,
  CardBody,
  SimpleGrid,
  Divider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaRobot, FaChartLine, FaLaptopCode, FaPencilAlt, FaCheckCircle } from 'react-icons/fa';

const FeatureCard = ({ icon, title, description, color }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');
  
  return (
    <Card 
      bg={cardBg} 
      boxShadow="md" 
      borderRadius="lg" 
      h="100%"
      _hover={{ 
        transform: 'translateY(-5px)', 
        boxShadow: 'lg',
        bg: cardHoverBg 
      }}
      transition="all 0.3s ease"
    >
      <CardBody>
        <Flex direction="column" align="center" textAlign="center">
          <Flex
            w="70px"
            h="70px"
            align="center"
            justify="center"
            color="white"
            rounded="full"
            bg={color}
            mb={4}
          >
            <Icon as={icon} boxSize={6} />
          </Flex>
          <Heading size="md" mb={2} fontWeight="bold">
            {title}
          </Heading>
          <Text color="gray.500">{description}</Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

const Home = () => {
  const bgColor = useColorModeValue('teal.500', 'teal.600');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg={bgColor}
        color="white" 
        py={{ base: 20, md: 28 }}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={10}>
            <GridItem>
              <VStack
                spacing={6}
                align={{ base: 'center', md: 'flex-start' }}
                textAlign={{ base: 'center', md: 'left' }}
              >
                <HStack spacing={4} align="center">
                  <Flex 
                    bg="white" 
                    p={3} 
                    borderRadius="md" 
                    boxShadow="md" 
                    width="60px" 
                    height="60px" 
                    justifyContent="center" 
                    alignItems="center"
                  >
                    <Icon as={FaGraduationCap} boxSize={8} color="teal.500" />
                  </Flex>
                  <Badge 
                    colorScheme="green" 
                    p={2} 
                    borderRadius="md" 
                    bg="rgba(255, 255, 255, 0.2)" 
                    fontSize="sm"
                  >
                    AI-POWERED EDUCATION
                  </Badge>
                </HStack>
                
                <Heading
                  as="h1"
                  size="2xl"
                  fontWeight="extrabold"
                  lineHeight="1.1"
                  letterSpacing="tight"
                >
                  The{' '}
                  <Text as="span" color="yellow.300">
                    Intelligent
                  </Text>{' '}
                  Exam Platform for Modern Education
                </Heading>
                
                <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="600px">
                  GenFlex helps educators create, manage, and evaluate exams with the power of AI. Streamline your teaching and assessment process today.
                </Text>
                
                <HStack
                  spacing={4}
                  pt={4}
                  width={{ base: 'full', sm: 'auto' }}
                  justifyContent={{ base: 'center', md: 'flex-start' }}
                >
                  <Button
                    as={Link}
                    to="/signup"
                    bg="white"
                    color="teal.500"
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    borderRadius="full"
                    boxShadow="md"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s ease"
                  >
                    Get Started Now
                  </Button>
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline"
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    borderRadius="full"
                    borderColor="white"
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.1)',
                    }}
                    transition="all 0.2s ease"
                  >
                    Log In
                  </Button>
                </HStack>
                
                <HStack spacing={6} pt={6} opacity={0.9}>
                  <HStack>
                    <Icon as={FaCheckCircle} color="yellow.300" />
                    <Text fontSize="sm">Easy Setup</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="yellow.300" />
                    <Text fontSize="sm">AI Grading</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaCheckCircle} color="yellow.300" />
                    <Text fontSize="sm">Secure Platform</Text>
                  </HStack>
                </HStack>
              </VStack>
            </GridItem>
            
            <GridItem display={{ base: 'none', md: 'block' }}>
              <Flex justifyContent="center" alignItems="center" h="100%">
                <Box position="relative" width="full" height="400px">
                  <Flex 
                    position="absolute"
                    right="10%"
                    top="10%"
                    bg="rgba(255, 255, 255, 0.15)"
                    borderRadius="lg"
                    p={4}
                    width="150px"
                    height="150px"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={FaRobot} boxSize={16} color="white" />
                  </Flex>
                </Box>
              </Flex>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" maxW="800px">
              <Heading as="h2" size="xl" fontWeight="bold">
                Powerful Features for Modern Educators
              </Heading>
              <Text color="gray.500" fontSize="lg">
                GenFlex combines AI technology with intuitive design to revolutionize how you create and grade exams.
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
              <FeatureCard
                icon={FaRobot}
                title="AI-Generated Questions"
                description="Create customized questions from your lecture materials with a single click."
                color="teal.500"
              />
              <FeatureCard
                icon={FaGraduationCap}
                title="Smart Evaluation"
                description="Grade essay and coding submissions automatically with AI-powered evaluation."
                color="blue.500"
              />
              <FeatureCard
                icon={FaChartLine}
                title="Detailed Analytics"
                description="Gain insights into student performance with comprehensive reports and analytics."
                color="purple.500"
              />
              <FeatureCard
                icon={FaLaptopCode}
                title="Code Execution"
                description="Test and run student code submissions directly on the platform."
                color="green.500"
              />
              <FeatureCard
                icon={FaPencilAlt}
                title="Diverse Question Types"
                description="Support for essay, coding, mathematical, and complex question formats."
                color="orange.500"
              />
              <FeatureCard
                icon={FaCheckCircle}
                title="Automated Feedback"
                description="Provide students with instant, detailed feedback on their work."
                color="red.500"
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* About Section */}
      <Box py={20} bg={sectionBg}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={10} alignItems="center">
            <GridItem order={{ base: 2, md: 1 }}>
              <VStack spacing={6} align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }}>
                <Heading as="h2" size="xl" fontWeight="bold">
                  About GenFlex
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  GenFlex is an educational technology platform designed for educators to create, manage, and evaluate various types of exams. The platform leverages AI to streamline the assessment process, making it more efficient and effective.
                </Text>
                <Text color="gray.600" fontSize="lg">
                  Our mission is to empower educators with technology that saves time and provides deeper insights, allowing them to focus on what matters most—teaching and supporting students.
                </Text>
                <Button
                  size="lg"
                  colorScheme="teal"
                  mt={4}
                  borderRadius="full"
                  boxShadow="md"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s ease"
                >
                  Learn More
                </Button>
              </VStack>
            </GridItem>
            <GridItem order={{ base: 1, md: 2 }}>
              <Flex
                justifyContent="center"
                alignItems="center"
                bg="gray.200"
                height="400px"
                borderRadius="lg"
                boxShadow="lg"
                overflow="hidden"
              >
                <Icon as={FaGraduationCap} boxSize={20} color="teal.500" />
              </Flex>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="teal.500">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={10} alignItems="center">
            <GridItem>
              <VStack spacing={6} align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }} color="white">
                <Heading as="h2" size="xl" fontWeight="bold">
                  Ready to Transform Your Teaching?
                </Heading>
                <Text fontSize="lg">
                  Join thousands of educators who are saving time and improving outcomes with GenFlex.
                </Text>
                <HStack spacing={4} pt={4}>
                  <Button
                    as={Link}
                    to="/signup"
                    bg="white"
                    color="teal.500"
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    borderRadius="full"
                    boxShadow="md"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s ease"
                  >
                    Get Started Now
                  </Button>
                  <Button
                    as={Link}
                    to="/demo"
                    variant="outline"
                    size="lg"
                    fontWeight="bold"
                    px={8}
                    borderRadius="full"
                    borderColor="white"
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.1)',
                    }}
                    transition="all 0.2s ease"
                  >
                    See Demo
                  </Button>
                </HStack>
              </VStack>
            </GridItem>
            <GridItem display={{ base: 'none', md: 'block' }}>
              <Flex justifyContent="center" alignItems="center" height="300px">
                <SimpleGrid columns={2} spacing={4} width="100%">
                  <Flex 
                    bg="rgba(255, 255, 255, 0.15)" 
                    borderRadius="lg"
                    justifyContent="center"
                    alignItems="center"
                    height="100px"
                  >
                    <Icon as={FaRobot} boxSize={8} color="white" />
                  </Flex>
                  <Flex 
                    bg="rgba(255, 255, 255, 0.15)" 
                    borderRadius="lg"
                    justifyContent="center"
                    alignItems="center"
                    height="100px"
                  >
                    <Icon as={FaGraduationCap} boxSize={8} color="white" />
                  </Flex>
                  <GridItem colSpan={2}>
                    <Flex 
                      bg="rgba(255, 255, 255, 0.15)" 
                      borderRadius="lg"
                      justifyContent="center"
                      alignItems="center"
                      height="100px"
                    >
                      <Icon as={FaChartLine} boxSize={8} color="white" />
                    </Flex>
                  </GridItem>
                </SimpleGrid>
              </Flex>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="gray.800" color="white" py={10}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4} textAlign={{ base: 'center', md: 'left' }}>
                <Flex 
                  bg="white" 
                  p={3} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                  width="140px"
                  height="60px"
                >
                  <Text fontWeight="bold" fontSize="xl" color="teal.500">GenFlex</Text>
                </Flex>
                <Text fontSize="sm" maxW="400px">
                  GenFlex is the leading AI-powered exam platform for modern educators, helping to streamline the creation, management, and evaluation of diverse exam types.
                </Text>
                <HStack spacing={4} pt={2}>
                  <Button size="sm" variant="ghost" borderRadius="full">Privacy</Button>
                  <Button size="sm" variant="ghost" borderRadius="full">Terms</Button>
                  <Button size="sm" variant="ghost" borderRadius="full">Contact</Button>
                </HStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4} textAlign={{ base: 'center', md: 'left' }}>
                <Heading size="sm">Features</Heading>
                <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2}>
                  <Button variant="link" size="sm" color="gray.400">AI Question Generation</Button>
                  <Button variant="link" size="sm" color="gray.400">Smart Evaluation</Button>
                  <Button variant="link" size="sm" color="gray.400">Student Analytics</Button>
                  <Button variant="link" size="sm" color="gray.400">Code Testing</Button>
                </VStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4} textAlign={{ base: 'center', md: 'left' }}>
                <Heading size="sm">Resources</Heading>
                <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2}>
                  <Button variant="link" size="sm" color="gray.400">Documentation</Button>
                  <Button variant="link" size="sm" color="gray.400">Blog</Button>
                  <Button variant="link" size="sm" color="gray.400">Tutorials</Button>
                  <Button variant="link" size="sm" color="gray.400">Support</Button>
                </VStack>
              </VStack>
            </GridItem>
          </Grid>
          
          <Divider my={8} borderColor="gray.700" />
          
          <Text textAlign="center" fontSize="sm" color="gray.500">
            &copy; {new Date().getFullYear()} GenFlex. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;