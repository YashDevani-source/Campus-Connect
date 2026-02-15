import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { HiPaperAirplane, HiArrowLeft } from "react-icons/hi";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5001";
var socket, selectedChatCompare;

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const { selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const { user } = useAuth();

  useEffect(() => {
    socket = io(ENDPOINT, { autoConnect: false });
    if (user && user.token) {
      socket.connect();
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
    }
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const { data } = await api.get(`/chat/${selectedChat._id}/messages`);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      //   toast.error("Failed to Load the Messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const sendMessage = async (event) => {
    if ((event.key === "Enter" || event.type === 'click') && newMessage) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      try {
        const msgContent = newMessage;
        setNewMessage("");
        const { data } = await api.post("/chat/message", {
          content: msgContent,
          chatId: selectedChat._id,
        });
      } catch (error) {
        toast.error("Failed to send");
      }
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat || chat.type === 'course' || chat.type === 'role-based') return chat.chatName;
    const other = chat.users.find(u => u._id !== user._id);
    return other ? other.name : "User";
  };

  return (
    <div className={`main-chat-container ${!selectedChat ? 'hidden' : ''}`}>
      {selectedChat ? (
        <>
          <div className="chat-header">
            <button
              className="btn-icon md:hidden"
              onClick={() => setSelectedChat("")}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HiArrowLeft />
            </button>
            <div className="chat-title">
              {getChatName(selectedChat)}
              {selectedChat.isGroupChat && <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>{selectedChat.users.length} members</span>}
            </div>
          </div>

          <div className="chat-messages-area">
            {loading ? (
              <div className="spinner-container" style={{ height: '100%', alignItems: 'center' }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <ScrollableChat messages={messages} />
            )}
          </div>

          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <input
                placeholder="Type a message..."
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
              />
            </div>
            <button className="btn-send" onClick={sendMessage}><HiPaperAirplane /></button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.1 }}>💬</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Campus Chat</h3>
          <p style={{ fontSize: '1.1rem', opacity: 0.6 }}>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};
export default ChatBox;
