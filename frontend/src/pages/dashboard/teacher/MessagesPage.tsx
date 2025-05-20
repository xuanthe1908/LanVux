import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import messageService from '../../../services/messageService';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import Spinner from '../../../components/ui/Spinner';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  UserCircleIcon, 
  ArrowLeftIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

const TeacherMessagesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessageModal, setNewMessageModal] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [students, setStudents] = useState<Array<{id: string, name: string}>>([]);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
    fetchStudents();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  // Fetch student list (for new message)
  const fetchStudents = async () => {
    try {
      // This would be replaced with a real API call
      // const response = await studentService.getStudents();
      // setStudents(response);
      
      // Placeholder data
      setStudents([
        { id: '1', name: 'Alex Johnson' },
        { id: '2', name: 'Sarah Williams' },
        { id: '3', name: 'Michael Brown' },
        { id: '4', name: 'Emily Davis' },
        { id: '5', name: 'David Wilson' }
      ]);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getConversations();
      setConversations(data.conversations);
      
      // If there are conversations and none is selected, select the first one
      if (data.conversations.length > 0 && !activeConversation) {
        setActiveConversation(data.conversations[0].userId);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getConversationMessages(userId);
      setMessages(data.messages);
      
      // Update unread count for this conversation
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeConversation) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      const messageData = {
        recipientId: activeConversation,
        subject: 'Re: Course Discussion',
        content: messageInput
      };
      
      const sentMessage = await messageService.sendMessage(messageData);
      
      // Add new message to the messages list
      setMessages(prev => [...prev, sentMessage]);
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === activeConversation 
            ? { 
                ...conv, 
                lastMessage: messageInput, 
                lastMessageDate: new Date().toISOString() 
              } 
            : conv
        )
      );
      
      // Clear input
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle new message submission
  const handleNewMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessageRecipient || !newMessageContent.trim()) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      const messageData = {
        recipientId: newMessageRecipient,
        subject: newMessageSubject || 'Course Discussion',
        content: newMessageContent
      };
      
      await messageService.sendMessage(messageData);
      
      // Clear form and close modal
      setNewMessageRecipient('');
      setNewMessageSubject('');
      setNewMessageContent('');
      setNewMessageModal(false);
      
      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error('Error sending new message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => 
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with your students</p>
      </div>
      
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
        {/* Conversation list */}
        <div className={`md:w-1/3 border-r border-gray-200 ${activeConversation ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Inbox</h2>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setNewMessageModal(true)}
              >
                New Message
              </Button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {loading && conversations.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <Spinner size="lg" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations match your search' : 'No conversations yet'}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <li 
                    key={conversation.userId}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      activeConversation === conversation.userId ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation.userId)}
                  >
                    <div className="p-4 flex items-start">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className={`text-sm font-medium ${
                            conversation.unreadCount > 0 ? 'text-primary-700' : 'text-gray-900'
                          }`}>
                            {conversation.userName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessageDate)}
                          </p>
                        </div>
                        <div className="flex justify-between items-baseline mt-1">
                          <p className={`text-sm truncate ${
                            conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                          }`}>
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-primary-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {conversation.userRole === 'student' ? 'Student' : 
                           conversation.userRole === 'teacher' ? 'Teacher' : 
                           conversation.userRole === 'admin' ? 'Admin' : 
                           conversation.userRole}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Message area */}
        <div className={`flex-1 flex flex-col ${activeConversation ? '' : 'hidden md:flex'}`}>
          {activeConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    className="md:hidden mr-2 text-gray-500"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="ml-2">
                    <p className="font-medium">
                      {conversations.find(c => c.userId === activeConversation)?.userName || 'Student'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {conversations.find(c => c.userId === activeConversation)?.userRole || 'Student'}
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    className="text-gray-500 hover:text-gray-700"
                    title="Delete Conversation"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Messages list */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Spinner size="lg" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-gray-500">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.senderId === user?.id;
                      return (
                        <div 
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                            isCurrentUser 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            <div className="flex justify-between items-baseline mb-1">
                              <p className={`text-xs font-medium ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                                {isCurrentUser ? 'You' : message.senderName}
                              </p>
                              <p className={`text-xs ${isCurrentUser ? 'text-primary-200' : 'text-gray-400'}`}>
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      className="form-input w-full rounded-lg resize-none border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      rows={3}
                      placeholder="Type your message here..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sendingMessage}
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="h-12 w-12 rounded-full flex items-center justify-center"
                    disabled={sendingMessage || !messageInput.trim()}
                    isLoading={sendingMessage}
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 p-4">
              <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4" />
              <p className="text-xl font-medium mb-2">No Conversation Selected</p>
              <p className="text-center mb-4">Select a conversation from the list or start a new one</p>
              <Button 
                variant="primary"
                onClick={() => setNewMessageModal(true)}
              >
                Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* New Message Modal */}
      {newMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">New Message</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setNewMessageModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleNewMessageSubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient
                </label>
                <select
                  id="recipient"
                  className="form-select w-full"
                  value={newMessageRecipient}
                  onChange={(e) => setNewMessageRecipient(e.target.value)}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="form-input w-full"
                  placeholder="Subject (optional)"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  className="form-input w-full"
                  rows={5}
                  placeholder="Type your message here..."
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewMessageModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={sendingMessage}
                  disabled={!newMessageRecipient || !newMessageContent.trim() || sendingMessage}
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

export default TeacherMessagesPage;