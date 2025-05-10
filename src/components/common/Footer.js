// src/components/common/Footer.js
import React from 'react';
import { Box, Container, Stack, Text, HStack, Icon, Link, Image } from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      py={6}
      mt={10}
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <HStack>
            <Image 
              src="/images/GenFlexLogo.jpg" 
              alt="GenFlex Logo" 
              height="30px" 
              objectFit="contain"
              mr={3}
            />
            <Text fontSize="sm" color="gray.600">
              &copy; {new Date().getFullYear()} GenFlex. All rights reserved.
            </Text>
          </HStack>
          <HStack spacing={4}>
            <Link href="#" isExternal>
              <Icon as={FaGithub} color="gray.600" _hover={{ color: 'brand.500' }} />
            </Link>
            <Link href="#" isExternal>
              <Icon as={FaTwitter} color="gray.600" _hover={{ color: 'brand.500' }} />
            </Link>
            <Link href="#" isExternal>
              <Icon as={FaLinkedin} color="gray.600" _hover={{ color: 'brand.500' }} />
            </Link>
            <Link href="mailto:info@genflex.com">
              <Icon as={FaEnvelope} color="gray.600" _hover={{ color: 'brand.500' }} />
            </Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;