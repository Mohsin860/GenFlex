import React from 'react';
import { Box, Heading, Text, Button, VStack, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Flex 
      minHeight="80vh"
      direction="column"
      textAlign="center"
    >
      <Box flex="1" py={10}>
        <VStack spacing={8}>
          <Heading as="h1" size="2xl">
            Welcome to GenFlex
          </Heading>
          <Text fontSize="xl">
            An intelligent exam management system for the modern educator
          </Text>
          <Button as={Link} to="/login" colorScheme="teal" size="lg">
            Get Started
          </Button>
        </VStack>
      </Box>
      
      
    </Flex>
  );
};

export default Home;