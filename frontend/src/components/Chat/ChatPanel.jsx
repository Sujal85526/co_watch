import { Users } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

/**
 * Chat panel component with messages and input
 * Single Responsibility: Display chat interface
 */
export default function ChatPanel({ messages, onlineCount, onSendMessage }) {
  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h2 className="font-bold text-lg">Chat</h2>
        <div className="flex items-center gap-2 text-green-600">
          <Users size={18} />
          <span className="font-medium">{onlineCount} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
