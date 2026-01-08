import { supabaseAdmin } from './supabase';
import { Conversation, Message, ConversationSummary } from './database.types';

// =============================================
// CONVERSATION OPERATIONS
// Using supabaseAdmin (service role) to bypass RLS
// since these operations happen server-side with Clerk auth
// =============================================

/**
 * Create a new conversation
 * Title is auto-generated from first user message
 */
export async function createConversation(
  userId: string,
  firstMessage: string
): Promise<Conversation | null> {
  try {
    // Generate title from first message (first 50 chars)
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: userId,
        title: title,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createConversation:', error);
    return null;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
  userId: string
): Promise<ConversationSummary[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('conversation_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversation:', error);
    return null;
  }
}

/**
 * Update conversation (e.g., change title or archive)
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<Pick<Conversation, 'title' | 'status'>>
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('conversations')
      .update(updates)
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateConversation:', error);
    return false;
  }
}

/**
 * Delete a conversation (and all its messages - cascade)
 */
export async function deleteConversation(
  conversationId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    return false;
  }
}

// =============================================
// MESSAGE OPERATIONS
// =============================================

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: role,
        content: content
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addMessage:', error);
    return null;
  }
}

/**
 * Get all messages for a conversation
 */
export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
}

/**
 * Add multiple messages at once (batch insert)
 */
export async function addMessages(
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<boolean> {
  try {
    const messagesToInsert = messages.map(msg => ({
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content
    }));

    const { error } = await supabaseAdmin
      .from('messages')
      .insert(messagesToInsert);

    if (error) {
      console.error('Error adding messages:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addMessages:', error);
    return false;
  }
}
