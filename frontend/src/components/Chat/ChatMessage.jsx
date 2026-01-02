/**
 * Individual chat message component
 * Single Responsibility: Render a single message
 */
export default function ChatMessage({ message }) {
  if (message.system) {
    return (
      <div className="text-gray-500 italic text-sm text-center py-1">
        {message.text}
      </div>
    );
  }

  return (
    <div className="p-2 hover:bg-gray-50 rounded">
      <strong className="text-blue-600">{message.username}:</strong>
      <span className="ml-2 text-gray-800">{message.text}</span>
    </div>
  );
}
