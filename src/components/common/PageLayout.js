// src/components/common/PageLayout.js
import React from 'react';
import { Box, Container, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';

const PageLayout = ({ title, subtitle, children, maxW = 'container.xl', py = 8 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box bg="gray.50" minH="calc(100vh - 136px)">
      <Container maxW={maxW} py={py}>
        {(title || subtitle) && (
          <VStack spacing={2} mb={8} align="flex-start">
            {title && <Heading as="h1" size="xl">{title}</Heading>}
            {subtitle && <Text color="gray.600">{subtitle}</Text>}
          </VStack>
        )}
        <Box
          bg={bgColor}
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          boxShadow="sm"
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default PageLayout;