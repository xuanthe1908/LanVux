// src/pages/dashboard/student/MessagesPage.tsx (continued)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import Button from '../../../components/ui/Button';
import { 
  ChatBubbleLeftRightIcon,
  UserCircleIcon, 
  PaperAirplaneIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'student' | 'instructor' | 'admin';
  lastMessage: {
    content: string;
    timestamp: string;
    isFromUser: boolean;
    isRead: boolean;
  };
  messages: Message[];
}

const StudentMessagesPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialInstructorId = queryParams.get('instructor');
  
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewMessageForm, setShowNewMessageForm] = useState<boolean>(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState<string>('');
  const [newMessageContent, setNewMessageContent] = useState<string>('');
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
          // Mock data
          const mockConversations: Conversation[] = [
            {
              id: 'conv-1',
              participantId: 'inst-1',
              participantName: 'Jane Smith',
              participantAvatar: '/images/instructor-1.jpg',
              participantRole: 'instructor',
              lastMessage: {
                content: 'Great work on your last assignment! Let me know if you have any questions about the feedback.',
                timestamp: '2025-05-19T10:30:00Z',
                isFromUser: false,
                isRead: true
              },
              messages: [
                {
                  id: 'msg-1-1',
                  senderId: 'user-1',
                  recipientId: 'inst-1',
                  senderName: user?.firstName + ' ' + user?.lastName,
                  senderAvatar: '/images/user-avatar.jpg',
                  content: 'Hi Professor Smith, I have a question about the React Hooks assignment.',
                  timestamp: '2025-05-19T09:15:00Z',
                  isRead: true
                },
                {
                  id: 'msg-1-2',
                  senderId: 'inst-1',
                  recipientId: 'user-1',
                  senderName: 'Jane Smith',
                  senderAvatar: '/images/instructor-1.jpg',
                  content: 'Of course! What specific question do you have about the hooks assignment?',
                  timestamp: '2025-05-19T09:30:00Z',
                  isRead: true
                },
                {
                  id: 'msg-1-3',
                  senderId: 'user-1',
                  recipientId: 'inst-1',
                  senderName: user?.firstName + ' ' + user?.lastName,
                  senderAvatar: '/images/user-avatar.jpg',
                  content: 'I\'m having trouble understanding the useContext hook. Can you provide an example of when we would use it?',
                  timestamp: '2025-05-19T09:45:00Z',
                  isRead: true
                },
                {
                  id: 'msg-1-4',
                  senderId: 'inst-1',
                  recipientId: 'user-1',
                  senderName: 'Jane Smith',
                  senderAvatar: '/images/instructor-1.jpg',
                  content: 'Great question! The useContext hook is perfect for cases where you have data that needs to be accessible by many components at different nesting levels. Instead of passing props down through multiple levels (prop drilling), you can use Context to make the data available throughout your component tree. A common example is theme data (light/dark mode) or user authentication state.',
                  timestamp: '2025-05-19T10:15:00Z',
                  isRead: true
                },
                {
                  id: 'msg-1-5',
                  senderId: 'inst-1',
                  recipientId: 'user-1',
                  senderName: 'Jane Smith',
                  senderAvatar: '/images/instructor-1.jpg',
                  content: 'Great work on your last assignment! Let me know if you have any questions about the feedback.',
                  timestamp: '2025-05-19T10:30:00Z',
                  isRead: true
                }
              ]
            },
            {
              id: 'conv-2',
              participantId: 'inst-2',
              participantName: 'John Doe',
              participantAvatar: '/images/instructor-2.jpg',
              participantRole: 'instructor',
              lastMessage: {
                content: 'The next Node.js assignment will be posted tomorrow. Make sure to review the authentication materials.',
                timestamp: '2025-05-18T15:45:00Z',
                isFromUser: false,
                isRead: false
              },
              messages: [
                {
                  id: 'msg-2-1',
                  senderId: 'inst-2',
                  recipientId: 'user-1',
                  senderName: 'John Doe',
                  senderAvatar: '/images/instructor-2.jpg',
                  content: 'Hello! I wanted to inform everyone that we\'ll be covering authentication in next week\'s lecture.',
                  timestamp: '2025-05-17T11:30:00Z',
                  isRead: true
                },
                {
                  id: 'msg-2-2',
                  senderId: 'user-1',
                  recipientId: 'inst-2',
                  senderName: user?.firstName + ' ' + user?.lastName,
                  senderAvatar: '/images/user-avatar.jpg',
                  content: 'Thanks for letting me know. Will we be using JWT or session-based authentication?',
                  timestamp: '2025-05-17T14:20:00Z',
                  isRead: true
                },
                {
                  id: 'msg-2-3',
                  senderId: 'inst-2',
                  recipientId: 'user-1',
                  senderName: 'John Doe',
                  senderAvatar: '/images/instructor-2.jpg',
                  content: 'We\'ll be covering both approaches, but the assignment will focus on JWT implementation.',
                  timestamp: '2025-05-18T09:10:00Z',
                  isRead: true
                },
                {
                  id: 'msg-2-4',
                  senderId: 'inst-2',
                  recipientId: 'user-1',
                  senderName: 'John Doe',
                  senderAvatar: '/images/instructor-2.jpg',
                  content: 'The next Node.js assignment will be posted tomorrow. Make sure to review the authentication materials.',
                  timestamp: '2025-05-18T15:45:00Z',
                  isRead: false
                }
              ]
            },
            {
              id: 'conv-3',
              participantId: 'student-1',
              participantName: 'Michael Brown',
              participantAvatar: '/images/student-3.jpg',
              participantRole: 'student',
              lastMessage: {
                content: 'Yes, I\'ll be at the study group this weekend.',
                timestamp: '2025-05-15T17:20:00Z',
                isFromUser: false,
                isRead: true
              },
              messages: [
                {
                  id: 'msg-3-1',
                  senderId: 'user-1',
                  recipientId: 'student-1',
                  senderName: user?.firstName + ' ' + user?.lastName,
                  senderAvatar: '/images/user-avatar.jpg',
                  content: 'Hey Michael, are you planning to join the React study group this weekend?',
                  timestamp: '2025-05-15T16:30:00Z',
                  isRead: true
                },
                {
                  id: 'msg-3-2',
                  senderId: 'student-1',
                  recipientId: 'user-1',
                  senderName: 'Michael Brown',
                  senderAvatar: '/images/student-3.jpg',
                  content: 'Yes, I\'ll be at the study group this weekend.',
                  timestamp: '2025-05-15T17:20:00Z',
                  isRead: true
                }
              ]
            }
          ];
          
          setConversations(mockConversations);
          
          // Set initial active conversation if instructorId is provided
          if (initialInstructorId) {
            const conversation = mockConversations.find(c => c.participantId === initialInstructorId);
            if (conversation) {
              setActiveConversation(conversation.id);
            }
          } else if (mockConversations.length > 0) {
            // Otherwise, set the first conversation as active
            setActiveConversation(mockConversations[0].id);
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, [initialInstructorId, user]);
  
  // Scroll to bottom when messages change or active conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation, conversations]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeConversation) return;
    
    // In a real app, this would be an API call
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;
    
    // Create a new message
    const newMessage: Message = {
      id: `msg-${conversation.id}-${conversation.messages.length + 1}`,
      senderId: 'user-1',
      recipientId: conversation.participantId,
      senderName: user?.firstName + ' ' + user?.lastName || 'Me',
      senderAvatar: '/images/user-avatar.jpg',
      content: messageInput,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Update the messages array and last message for the conversation
    const updatedConversations = conversations.map(c => {
      if (c.id === activeConversation) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: {
            content: messageInput,
            timestamp: new Date().toISOString(),
            isFromUser: true,
            isRead: false
          }
        };
      }
      return c;
    });
    
    setConversations(updatedConversations);
    setMessageInput('');
  };
  
  const handleStartNewConversation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessageRecipient.trim() || !newMessageContent.trim()) return;
    
    // In a real app, this would validate the recipient and create a new conversation via API
    const recipientName = newMessageRecipient.split(' ');
    const firstName = recipientName[0] || '';
    const lastName = recipientName.slice(1).join(' ') || '';
    
    // Create a new conversation with the first message
    const newConversationId = `conv-${conversations.length + 1}`;
    const newParticipantId = `new-${conversations.length + 1}`;
    
    const newMessage: Message = {
      id: `msg-${newConversationId}-1`,
      senderId: 'user-1',
      recipientId: newParticipantId,
      senderName: user?.firstName + ' ' + user?.lastName || 'Me',
      senderAvatar: '/images/user-avatar.jpg',
      content: newMessageContent,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    const newConversation: Conversation = {
      id: newConversationId,
      participantId: newParticipantId,
      participantName: `${firstName} ${lastName}`,
      participantAvatar: '/images/default-avatar.jpg',
      participantRole: 'instructor', // Default to instructor for demonstration
      lastMessage: {
        content: newMessageContent,
        timestamp: new Date().toISOString(),
        isFromUser: true,
        isRead: false
      },
      messages: [newMessage]
    };
    
    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversationId);
    setShowNewMessageForm(false);
    setNewMessageRecipient('');
    setNewMessageContent('');
  };
  
  // Format timestamp for better display
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Filter conversations by search term
  const filteredConversations = conversations.filter(conversation => 
    conversation.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeConversationData = activeConversation 
    ? conversations.find(c => c.id === activeConversation) 
    : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-600">Communicate with your instructors and classmates</p>
      </div>
      
      {/* Messages container */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[600px] flex">
          {/* Conversations sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search and new message */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="form-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                onClick={() => setShowNewMessageForm(true)}
              >
                New Message
              </Button>
            </div>
            
            {/* Conversation list */}
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex-1 flex justify-center items-center p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      activeConversation === conversation.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-start">
                      <img
                        src={conversation.participantAvatar}
                        alt={conversation.participantName}
                        className="h-10 w-10 rounded-full flex-shrink-0"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.participantName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${
                            conversation.lastMessage.isRead ? 'text-gray-500' : 'font-medium text-gray-900'
                          }`}>
                            {conversation.lastMessage.isFromUser ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                          {!conversation.lastMessage.isRead && !conversation.lastMessage.isFromUser && (
                            <span className="inline-block h-2 w-2 rounded-full bg-primary-600"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Message content */}
          <div className="w-2/3 flex flex-col">
            {activeConversationData ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <img
                    src={activeConversationData.participantAvatar}
                    alt={activeConversationData.participantName}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {activeConversationData.participantName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {activeConversationData.participantRole.charAt(0).toUpperCase() + 
                        activeConversationData.participantRole.slice(1)}
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {activeConversationData.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'user-1' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.senderId !== 'user-1' && (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="h-8 w-8 rounded-full mr-2"
                          />
                        )}
                        <div>
                          <div
                            className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md ${
                              message.senderId === 'user-1'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            <span>{formatTimestamp(message.timestamp)}</span>
                          </div>
                        </div>
                        {message.senderId === 'user-1' && (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="h-8 w-8 rounded-full ml-2"
                          />
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                    <div className="flex-1">
                      <textarea
                        className="form-input w-full rounded-lg resize-none border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        rows={3}
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                      ></textarea>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      disabled={!messageInput.trim()}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-500">
                <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
                <p className="max-w-md text-gray-600">
                  Select a conversation to view messages or start a new conversation with an instructor or classmate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* New message form */}
      {showNewMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-medium text-gray-900 mb-4">New Message</h3>
            <form onSubmit={handleStartNewConversation}>
              <div className="mb-4">
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient
                </label>
                <input
                  type="text"
                  id="recipient"
                  className="form-input w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter recipient name"
                  value={newMessageRecipient}
                  onChange={(e) => setNewMessageRecipient(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  className="form-input w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  rows={5}
                  placeholder="Type your message here"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewMessageForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!newMessageRecipient.trim() || !newMessageContent.trim()}
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMessagesPage;