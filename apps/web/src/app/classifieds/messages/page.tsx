'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  classifiedId: string;
  listingTitle: string;
  listingSlug: string;
  listingCategory: string;
  otherUser: {
    id: string;
    name: string;
    avatarInitial: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

function mapConversation(raw: Record<string, unknown>): Conversation {
  const otherName = String(raw.other_user_name || raw.otherUserName || 'User');
  return {
    id: `${raw.classified_id}-${raw.other_user_id}`,
    classifiedId: String(raw.classified_id || ''),
    listingTitle: String(raw.classified_title || raw.listingTitle || ''),
    listingSlug: String(raw.classified_slug || raw.listingSlug || ''),
    listingCategory: String(raw.classified_category || raw.listingCategory || 'other'),
    otherUser: {
      id: String(raw.other_user_id || ''),
      name: otherName,
      avatarInitial: otherName.charAt(0).toUpperCase(),
    },
    lastMessage: String(raw.last_message || raw.lastMessage || ''),
    lastMessageAt: String(raw.last_message_at || raw.lastMessageAt || ''),
    unread: Number(raw.unread_count || raw.unread || 0),
  };
}

function mapMessage(raw: Record<string, unknown>): Message {
  return {
    id: String(raw.id || ''),
    senderId: String(raw.sender_id || raw.senderId || ''),
    text: String(raw.message || raw.text || ''),
    timestamp: String(raw.created_at || raw.timestamp || '').replace('T', ' ').slice(0, 16),
  };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/classifieds/messages/conversations');
      const raw = Array.isArray(data) ? data : data.data || [];
      const convs = raw.map((r: Record<string, unknown>) => mapConversation(r));
      setConversations(convs);
      if (convs.length > 0 && !activeConversation) {
        setActiveConversation(convs[0].id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(message);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeConversation]);

  const fetchMessages = useCallback(async (classifiedId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data } = await apiClient.get(`/classifieds/messages/${classifiedId}`);
      const raw = Array.isArray(data) ? data : data.data || data.messages || [];
      setMessages(raw.map((r: Record<string, unknown>) => mapMessage(r)));
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Get current user ID
    apiClient.get('/users/me').then(({ data }) => {
      setCurrentUserId(String(data.id || ''));
    }).catch(() => {});
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      const conv = conversations.find((c) => c.id === activeConversation);
      if (conv) {
        fetchMessages(conv.classifiedId);
      }
    }
  }, [activeConversation, conversations, fetchMessages]);

  const activeConv = conversations.find((c) => c.id === activeConversation);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return;
    setIsSending(true);
    try {
      await apiClient.post(`/classifieds/${activeConv.classifiedId}/messages`, {
        message: newMessage.trim(),
      });
      setNewMessage('');
      await fetchMessages(activeConv.classifiedId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/classifieds" className="hover:text-primary-600">Classifieds</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Messages</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Left Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No conversations yet.
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv.id)}
                      className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${
                        activeConversation === conv.id
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {conv.otherUser.name}
                            </span>
                            {conv.unread > 0 && (
                              <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">{conv.listingTitle}</p>
                          <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - Message Thread */}
            <div className="flex-1 flex flex-col">
              {activeConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {activeConv.otherUser.name}
                      </h3>
                      <Link
                        href={`/classifieds/${activeConv.listingCategory}/${activeConv.listingSlug}`}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        {activeConv.listingTitle}
                      </Link>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {activeConv.otherUser.avatarInitial}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-sm">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                isMe
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isMe ? 'text-primary-200' : 'text-gray-400'
                                }`}
                              >
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? '...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">
                    {conversations.length === 0
                      ? 'No conversations yet. Contact a seller to start messaging.'
                      : 'Select a conversation to start messaging.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
