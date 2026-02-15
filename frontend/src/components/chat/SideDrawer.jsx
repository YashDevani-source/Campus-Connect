import { useState } from "react";
import { ChatState } from "../../context/ChatContext";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { HiSearch, HiX } from "react-icons/hi";

const SideDrawer = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { setSelectedChat, chats, setChats } = ChatState();

  const handleSearch = async () => {
    if (!search) {
      toast.error("Please enter something in search");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/auth/search?search=${search}`);
      setLoading(false);
      setSearchResult(data.data);
    } catch (error) {
      toast.error("Failed to Load the Search Results");
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await api.post(`/chat/access`, { userId });

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast.error("Error fetching the chat");
      setLoadingChat(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-start' }}>
      <div className="side-drawer" onClick={e => e.stopPropagation()} style={{
        width: '300px', height: '100%', background: 'white',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div className="modal-header" style={{ padding: '20px' }}>
          <h3>Search Users</h3>
          <button className="btn-icon" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><HiX /></button>
        </div>

        <div className="drawer-search-bar" style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
          <input
            placeholder="Name or Email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
          <button onClick={handleSearch} style={{
            background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px',
            width: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><HiSearch /></button>
        </div>

        <div className="drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div className="spinner-container" style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            searchResult?.map(u => (
              <div key={u._id} onClick={() => accessChat(u._id)} className="user-list-item" style={{
                padding: '10px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px',
                transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                  {u.name[0]}
                </div>
                <div>
                  <div className="name" style={{ fontWeight: '500' }}>{u.name}</div>
                  <div className="email" style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                </div>
              </div>
            ))
          )}
          {loadingChat && <div style={{ textAlign: 'center', padding: '10px' }}>Opening Chat...</div>}
        </div>
      </div>
      <style>{`
            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
        `}</style>
    </div>
  );
};

export default SideDrawer;
