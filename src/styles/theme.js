// src/styles/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9cff',
      500: '#0080e6',
      600: '#0064b3',
      700: '#004880',
      800: '#002d4d',
      900: '#00121a',
    },
    accent: {
      100: '#f5f9ff',
      200: '#e8f1fc',
      300: '#d1e3f9',
      400: '#b3d0f6',
      500: '#7aabef',
    },
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          transition: 'all 0.2s ease',
        }),
        outline: {
          borderWidth: '2px',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          _hover: {
            boxShadow: 'lg',
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export default theme;