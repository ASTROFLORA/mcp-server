import { tool } from 'ai';
import { z } from 'zod';
import { conversationStorage } from '../conversation-storage';

export const searchConversationsTool = tool({
  description: 'Search through previous conversations for relevant information',
  inputSchema: z.object({
    query: z.string().describe('Search query to find relevant conversations'),
  }),
  execute: async ({ query }) => {
    try {
      const results = conversationStorage.searchConversations(query);
      
      if (results.length === 0) {
        return `No conversations found matching "${query}"`;
      }
      
      const searchResults = results.slice(0, 5).map(conv => {
        const messageCount = conv.messages.length;
        const lastUpdate = new Date(conv.updated_at).toLocaleDateString();
        const tags = conv.tags?.join(', ') || 'No tags';
        
        return [
          `Title: ${conv.title}`,
          `Messages: ${messageCount}`,
          `Last Updated: ${lastUpdate}`,
          `Tags: ${tags}`,
          `Summary: ${conv.summary || 'No summary available'}`,
        ].join('\n  ');
      }).join('\n\n');
      
      return `Found ${results.length} conversations matching "${query}":\n\n${searchResults}`;
    } catch (error) {
      return `Error searching conversations: ${error}`;
    }
  },
});

export const getConversationStatsTool = tool({
  description: 'Get statistics and insights from conversation history',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const stats = conversationStorage.getConversationStats();
      
      const topTopics = stats.top_topics.map(([topic, count]) => 
        `${topic}: ${count} conversations`
      ).join('\n  ');
      
      return [
        'Conversation Statistics:',
        `Total Conversations: ${stats.total_conversations}`,
        `Total Messages: ${stats.total_messages}`,
        `Average Messages per Conversation: ${stats.avg_messages_per_conversation.toFixed(1)}`,
        '',
        'Top Discussion Topics:',
        `  ${topTopics || 'No topics available'}`,
      ].join('\n');
    } catch (error) {
      return `Error getting conversation stats: ${error}`;
    }
  },
});

export const addConversationTagTool = tool({
  description: 'Add a tag to the current conversation for better organization',
  inputSchema: z.object({
    conversation_id: z.string().describe('ID of the conversation to tag'),
    tag: z.string().describe('Tag to add to the conversation'),
  }),
  execute: async ({ conversation_id, tag }) => {
    try {
      conversationStorage.addConversationTag(conversation_id, tag);
      return `Added tag "${tag}" to conversation ${conversation_id}`;
    } catch (error) {
      return `Error adding tag: ${error}`;
    }
  },
});