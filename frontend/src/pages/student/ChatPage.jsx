import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import MyChats from "../../components/chat/MyChats";
import ChatBox from "../../components/chat/ChatBox";
import SideDrawer from "../../components/chat/SideDrawer";
import "./ChatStyles.css";

const ChatPage = () => {
  const { user } = useAuth();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) return <div className="loading-screen">Loading Chat...</div>;

  return (
    <div className="chat-page-container" style={{ width: "100%", height: "90vh", display: "flex", position: 'relative' }}>
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="chat-layout-wrapper" style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* Sidebar */}
        <div className="sidebar-container" style={{ width: "30%", minWidth: "300px", borderRight: "1px solid #ddd", height: "100%", overflowY: "auto" }}>
          <MyChats fetchAgain={fetchAgain} setDrawerOpen={setDrawerOpen} />
        </div>

        {/* Main Chat Area */}
        <div className="main-chat-container" style={{ flex: 1, height: "100%" }}>
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
