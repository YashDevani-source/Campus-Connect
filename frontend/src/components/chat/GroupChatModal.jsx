import { useState } from "react";
import { ChatState } from "../../context/ChatContext";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { HiX } from "react-icons/hi";

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/auth/search?search=${query}`);
      setLoading(false);
      setSearchResult(data.data);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const { data } = await api.post("/chat/group", {
        name: groupChatName,
        users: selectedUsers.map((u) => u._id),
      });
      setChats([data, ...chats]);
      setIsOpen(false);
      toast.success("New Group Chat Created!");
      setGroupChatName('');
      setSelectedUsers([]);
      setSearchResult([]);
    } catch (error) {
      toast.error("Failed to Create the Chat!");
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some(u => u._id === userToAdd._id)) {
      toast.error("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Group Chat</h3>
              <button className="btn-icon" onClick={() => setIsOpen(false)}><HiX /></button>
            </div>
            <div className="modal-body">
              <input
                placeholder="Chat Name e.g. 'Project Alpha team'"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input
                placeholder="Add Users via name/email"
                onChange={(e) => handleSearch(e.target.value)}
                style={{ margin: '10px 0', padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
              />

              <div className="selected-users">
                {selectedUsers.map(u => (
                  <div key={u._id} className="user-badge" onClick={() => handleDelete(u)}>
                    {u.name} <HiX />
                  </div>
                ))}
              </div>

              <div className="search-results" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {loading ? <div>Loading...</div> : (
                  searchResult?.slice(0, 4).map(user => (
                    <div key={user._id} onClick={() => handleGroup(user)} style={{
                      padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#ddd', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {user.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>{user.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{
                padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }} onClick={handleSubmit}>Create Chat</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
