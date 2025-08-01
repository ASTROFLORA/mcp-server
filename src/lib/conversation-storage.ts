interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    sensors?: any[];
    connectedSensors?: string[];
    timestamp?: string;
  };
}

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
  tags?: string[];
  summary?: string;
}

class ConversationStorage {
  private conversations: Map<string, Conversation> = new Map();
  private messageIndex: Map<string, string> = new Map(); // message_id -> conversation_id

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createConversation(title?: string): string {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const conversation: Conversation = {
      id,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
      created_at: now,
      updated_at: now,
      messages: [],
      tags: ['sensors', 'astroflora'],
    };

    this.conversations.set(id, conversation);
    return id;
  }

  addMessage(
    conversation_id: string,
    role: 'user' | 'assistant',
    content: string,
    context?: any
  ): string {
    const conversation = this.conversations.get(conversation_id);
    if (!conversation) {
      throw new Error(`Conversation ${conversation_id} not found`);
    }

    const message_id = this.generateId();
    const now = new Date().toISOString();

    const message: ConversationMessage = {
      id: message_id,
      conversation_id,
      role,
      content,
      timestamp: now,
      context,
    };

    conversation.messages.push(message);
    conversation.updated_at = now;
    this.messageIndex.set(message_id, conversation_id);

    // Auto-generate title from first user message
    if (!conversation.title || conversation.title.startsWith('Conversation')) {
      if (role === 'user' && conversation.messages.length <= 2) {
        conversation.title = this.generateTitle(content);
      }
    }

    return message_id;
  }

  getConversation(conversation_id: string): Conversation | null {
    return this.conversations.get(conversation_id) || null;
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  searchConversations(query: string): Conversation[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.conversations.values())
      .filter(conv => 
        conv.title?.toLowerCase().includes(searchTerm) ||
        conv.summary?.toLowerCase().includes(searchTerm) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm)) ||
        conv.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getConversationMessages(conversation_id: string): ConversationMessage[] {
    const conversation = this.conversations.get(conversation_id);
    return conversation ? conversation.messages : [];
  }

  updateConversationSummary(conversation_id: string, summary: string): void {
    const conversation = this.conversations.get(conversation_id);
    if (conversation) {
      conversation.summary = summary;
      conversation.updated_at = new Date().toISOString();
    }
  }

  addConversationTag(conversation_id: string, tag: string): void {
    const conversation = this.conversations.get(conversation_id);
    if (conversation) {
      if (!conversation.tags) {
        conversation.tags = [];
      }
      if (!conversation.tags.includes(tag)) {
        conversation.tags.push(tag);
        conversation.updated_at = new Date().toISOString();
      }
    }
  }

  deleteConversation(conversation_id: string): boolean {
    const conversation = this.conversations.get(conversation_id);
    if (conversation) {
      // Remove message index entries
      conversation.messages.forEach(msg => {
        this.messageIndex.delete(msg.id);
      });
      
      return this.conversations.delete(conversation_id);
    }
    return false;
  }

  private generateTitle(content: string): string {
    // Extract key topics from the first message
    const words = content.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => 
      word.length > 3 && 
      !['what', 'how', 'when', 'where', 'why', 'the', 'and', 'but', 'for', 'with'].includes(word)
    );
    
    if (keyWords.length > 0) {
      const title = keyWords.slice(0, 3).join(' ');
      return title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    return `Conversation ${new Date().toLocaleDateString()}`;
  }

  // Analytics methods
  getConversationStats() {
    const conversations = Array.from(this.conversations.values());
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const avgMessagesPerConversation = conversations.length > 0 ? totalMessages / conversations.length : 0;
    
    const topicCounts = new Map<string, number>();
    conversations.forEach(conv => {
      conv.tags?.forEach(tag => {
        topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
      });
    });

    return {
      total_conversations: conversations.length,
      total_messages: totalMessages,
      avg_messages_per_conversation: avgMessagesPerConversation,
      top_topics: Array.from(topicCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    };
  }
}

// Singleton instance
export const conversationStorage = new ConversationStorage();

// Export types
export type { ConversationMessage, Conversation };