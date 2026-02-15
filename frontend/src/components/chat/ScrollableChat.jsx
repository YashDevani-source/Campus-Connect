import { useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ScrollableChat = ({ messages }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="scrollable-chat" style={{ display: 'flex', flexDirection: 'column' }}>
      {messages && messages.map((m) => {
        const isSent = m.sender._id === user._id;
        return (
          <div key={m._id} style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                {!isSent && m.chat.isGroupChat && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px', display: 'block', color: 'var(--primary-color)' }}>
                    {m.sender.name}
                  </span>
                )}
                {m.content}
              </div>
              <span className="timestamp">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
export default ScrollableChat;
