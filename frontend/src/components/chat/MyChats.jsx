import { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { HiPlus, HiUserGroup } from "react-icons/hi";
import GroupChatModal from "./GroupChatModal";

const MyChats = ({ fetchAgain, setDrawerOpen }) => {
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const { user } = useAuth();

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chat");
      setChats(data);
    } catch (error) {
      //   toast.error("Failed to Load the chats");
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  const getSender = (loggedUser, users) => {
    if (!users || users.length < 2) return "Unknown User";
    const friend = users.find(u => u._id !== (user?._id));
    return friend ? friend.name : "Unknown";
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat || chat.type === 'course' || chat.type === 'role-based') {
      return chat.chatName;
    }
    return getSender(user, chat.users);
  };

  return (
    <div className={`sidebar-container ${selectedChat ? 'hidden' : ''}`}>
      <div className="my-chats-header">
        <h3>Chats</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <GroupChatModal>
            <button className="btn-icon" title="New Group">
              <HiUserGroup />
            </button>
          </GroupChatModal>

          <button className="btn-icon" onClick={() => setDrawerOpen(true)} title="New Chat">
            <HiPlus />
          </button>
        </div>
      </div>

      <div className="chats-list">
        {chats ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`chat-list-item ${selectedChat === chat ? "selected" : ""}`}
            >
              <div className="chat-avatar">
                {chat.isGroupChat ? "G" : getChatName(chat).charAt(0)}
              </div>
              <div className="chat-info">
                <span className="chat-name">
                  {getChatName(chat)}
                </span>
                {chat.latestMessage && (
                  <span className="chat-latest-msg">
                    <b>{chat.latestMessage.sender.name}: </b>
                    {chat.latestMessage.content}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="spinner-container" style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}><div className="spinner"></div></div>
        )}
      </div>
    </div>
  );
};

export default MyChats;
