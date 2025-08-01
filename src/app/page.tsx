'use client';

import { useChat } from '@ai-sdk/react';
import { Box, Button, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Prose } from '@/components/ui/prose';
import { ColorModeButton } from '@/components/ui/color-mode';
import Markdown from 'react-markdown';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
    },
  });
  return (
    <Box 
      minH="100vh" 
      bg="bg.canvas"
      bgGradient={{
        base: "linear(to-br, green.50, blue.50, purple.50)",
        _dark: "linear(to-br, green.950, teal.950, blue.950)"
      }}
    >
      {/* Header with logo and color mode toggle */}
      <Box 
        bg="bg.subtle" 
        borderBottomWidth="1px" 
        borderColor="border.subtle"
        backdropFilter="blur(10px)"
        position="sticky"
        top="0"
        zIndex="10"
      >
        <Box maxW='800px' mx='auto' px='6' py='4'>
          <HStack justify="space-between" align="center">
            <HStack align="center" gap="3">
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                bgGradient="linear(to-r, green.400, teal.400, blue.400)"
                bgClip="text"
              >
                🧬 AstroFlora AI
              </Text>
              <Text fontSize="sm" color="fg.muted" fontStyle="italic">
                Advanced Biological Intelligence
              </Text>
            </HStack>
            <ColorModeButton />
          </HStack>
        </Box>
      </Box>

      <Box maxW='800px' mx='auto' px='6' pt='6' pb='28'>
        <Stack gap='6'>
          {messages.length === 0 && (
            <Box textAlign="center" py="12">
              <Text fontSize="lg" color="fg.muted" mb="2">
                Welcome to AstroFlora AI
              </Text>
              <Text fontSize="sm" color="fg.subtle" maxW="md" mx="auto">
                Your advanced biological intelligence assistant. Ask about plant biology, 
                genetics, biotechnology, or any life sciences topic.
              </Text>
            </Box>
          )}
          
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
              bg={message.role === 'user' 
                ? { base: "green.100", _dark: "green.900/30" }
                : { base: "white", _dark: "gray.800/60" }
              }
              color="fg"
              px='6'
              py='4'
              borderRadius='2xl'
              maxW='85%'
              boxShadow={{
                base: "0 4px 12px rgba(0,0,0,0.1)",
                _dark: "0 4px 12px rgba(0,0,0,0.3)"
              }}
              borderWidth="1px"
              borderColor={message.role === 'user' 
                ? { base: "green.200", _dark: "green.700/50" }
                : { base: "gray.200", _dark: "gray.700/50" }
              }
              backdropFilter="blur(10px)"
              position="relative"
              _before={message.role === 'user' ? {
                content: '""',
                position: "absolute",
                top: "50%",
                right: "-8px",
                transform: "translateY(-50%)",
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: "8px 0 8px 12px",
                borderColor: { 
                  base: "transparent transparent transparent green.100", 
                  _dark: "transparent transparent transparent green.900/30" 
                },
              } : {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "-8px",
                transform: "translateY(-50%)",
                width: "0",
                height: "0",
                borderStyle: "solid",
                borderWidth: "8px 12px 8px 0",
                borderColor: { 
                  base: "transparent white transparent transparent", 
                  _dark: "transparent gray.800/60 transparent transparent" 
                },
              }}
            >
              {message.role === 'assistant' && (
                <HStack mb="2" gap="2">
                  <Text fontSize="xs" color="teal.500" fontWeight="medium">
                    🤖 AstroFlora AI
                  </Text>
                </HStack>
              )}
              {message.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <Prose key={`${message.id}-${i}`} size="lg">
                      <Markdown>{part.text}</Markdown>
                    </Prose>
                  );
                } else if ('output' in part && part.output && typeof part.output === 'string') {
                  return (
                    <Prose key={`${message.id}-${i}`} size="lg">
                      <Markdown>{part.output}</Markdown>
                    </Prose>
                  );
                }
                return null;
              })}
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        as='form'
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });

          setInput('');
        }}
        position='fixed'
        bottom='0'
        left='0'
        right='0'
        bg={{ base: "white/90", _dark: "gray.900/90" }}
        backdropFilter="blur(12px)"
        py='4'
        px='6'
        borderTopWidth='1px'
        borderColor="border.subtle"
        boxShadow={{
          base: "0 -4px 12px rgba(0,0,0,0.1)",
          _dark: "0 -4px 12px rgba(0,0,0,0.3)"
        }}
      >
        <Box maxW='800px' mx='auto'>
          <HStack gap="3">
            <Input
              placeholder='Ask about biology, genetics, plant science...'
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              flex='1'
              bg={{ base: "white", _dark: "gray.800" }}
              borderColor={{ base: "green.200", _dark: "green.700" }}
              borderRadius="xl"
              px="4"
              py="3"
              fontSize="sm"
              _focus={{
                borderColor: { base: "green.400", _dark: "green.500" },
                boxShadow: { base: "0 0 0 1px green.400", _dark: "0 0 0 1px green.500" },
              }}
              _placeholder={{ color: "fg.subtle" }}
            />
            <Button 
              type='submit'
              bg="green.500"
              color="white"
              borderRadius="xl"
              px="6"
              py="3"
              fontSize="sm"
              fontWeight="medium"
              _hover={{
                bg: "green.600",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
              }}
              _active={{
                bg: "green.700",
                transform: "translateY(0px)"
              }}
              transition="all 0.2s"
              disabled={!input.trim()}
              _disabled={{
                opacity: 0.5,
                cursor: "not-allowed",
                _hover: {
                  bg: "green.500",
                  transform: "none",
                  boxShadow: "none"
                }
              }}
            >
              Send 🚀
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
