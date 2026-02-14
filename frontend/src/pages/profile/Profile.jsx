import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineBriefcase, 
  HiOutlineDocumentText, HiOutlinePencilAlt, HiOutlineDownload,
  HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail,
  HiOutlineIdentification, HiOutlineUserGroup, HiOutlineLightningBolt
} from 'react-icons/hi';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');

  // Mock data usage
  const userData = {
    ...user,
    academicYear: user.academicYear || '2023-2027',
    cgpa: user.cgpa || 8.5,
    personalInfo: user.personalInfo || {
      dob: '2004-05-15',
      bloodGroup: 'B+',
      address: '123 Campus Hostel, IIT Mandi',
      phone: '+91 9876543210'
    },
    parentDetails: user.parentDetails || {
      fatherName: 'Mr. Rajesh Devani',
      motherName: 'Mrs. Sunita Devani',
      guardianContact: '+91 9876543211'
    },
    academicDetails: user.academicDetails || [
      { semester: 'Sem 1', sgpa: 8.2, cgpa: 8.2, subjects: [{ name: 'Calculus', grade: 'A' }, { name: 'Physics', grade: 'B+' }] },
      { semester: 'Sem 2', sgpa: 8.8, cgpa: 8.5, subjects: [{ name: 'Data Structures', grade: 'A-' }, { name: 'Electronics', grade: 'A' }] }
    ],
    skills: user.skills || ['React', 'Node.js', 'Python', 'C++'],
    projects: user.projects || [
      { title: 'Campus Connect', description: 'Campus management system', link: 'https://github.com/iitmandi' },
      { title: 'AI Resume Builder', description: 'Resume optimization tool', link: '#' }
    ]
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <HiOutlineUser /> },
    { id: 'academic', label: 'Academic', icon: <HiOutlineAcademicCap /> },
    { id: 'personal', label: 'Personal', icon: <HiOutlineLocationMarker /> },
    { id: 'family', label: 'Family', icon: <HiOutlineUserGroup /> },
    { id: 'skills', label: 'Skills & Projects', icon: <HiOutlineLightningBolt /> },
    { id: 'certs', label: 'Certificates', icon: <HiOutlineDocumentText /> },
  ];

  const handleDownloadID = () => {
    toast.success('Downloading ID Card...');
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Banner Profile Header */}
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '2rem', 
        marginBottom: '2rem',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          width: '100px', height: '100px', 
          borderRadius: '50%', 
          background: 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', color: 'var(--accent)',
          border: '2px solid var(--border)'
        }}>
          {user.profilePhoto ? <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <HiOutlineUser />}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: '0.25rem', fontSize: '1.8rem' }}>{user.name}</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HiOutlineIdentification /> {user.rollNumber || 'N/A'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HiOutlineAcademicCap /> {user.department || 'Dept. N/A'}</span>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => toast('Edit functionality coming soon!')}><HiOutlinePencilAlt /> Edit</button>
          <button className="btn btn-sm btn-primary" onClick={handleDownloadID}><HiOutlineDownload /> ID Card</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Sidebar Navigation */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '0.5rem', border: '1px solid var(--border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.75rem 1rem',
                background: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', textAlign: 'left',
                fontWeight: activeTab === tab.id ? '600' : '500',
                marginBottom: '0.25rem',
                borderLeft: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* content Area */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', minHeight: '400px' }}>
          
          {activeTab === 'basic' && (
            <div>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Basic Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <InfoItem label="Full Name" value={user.name} />
                <InfoItem label="Email" value={user.email} />
                <InfoItem label="Roll Number" value={user.rollNumber} />
                <InfoItem label="Department" value={user.department} />
                <InfoItem label="Role" value={user.role} badge />
                <InfoItem label="Joined" value={new Date(user.createdAt).getFullYear()} />
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
             <div>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Academic Record</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <InfoItem label="Course" value="B.Tech" />
                <InfoItem label="Current Year" value={userData.academicYear} />
                <InfoItem label="Overall CGPA" value={userData.cgpa} highlight />
                <InfoItem label="Attendance" value="85%" />
              </div>

              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Semester Performance</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {userData.academicDetails.map((sem, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600' }}>{sem.semester}</span>
                      <span className="badge badge-success">SGPA: {sem.sgpa}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {sem.subjects.map((sub, sIdx) => (
                        <span key={sIdx} className="badge badge-default" style={{ background: 'var(--bg-card)' }}>{sub.name}: {sub.grade}</span>
                      ))}
                    </div>
                  </div>
                ))}
               </div>
             </div>
          )}

          {activeTab === 'personal' && (
            <div>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Personal Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <InfoItem label="Date of Birth" value={new Date(userData.personalInfo.dob).toLocaleDateString()} />
                <InfoItem label="Blood Group" value={userData.personalInfo.bloodGroup} />
                <InfoItem label="Phone" value={userData.personalInfo.phone} />
                <InfoItem label="Address" value={userData.personalInfo.address} fullWidth />
              </div>
            </div>
          )}

          {activeTab === 'family' && (
             <div>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Family Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <InfoItem label="Father's Name" value={userData.parentDetails.fatherName} />
                <InfoItem label="Mother's Name" value={userData.parentDetails.motherName} />
                <InfoItem label="Guardian Contact" value={userData.parentDetails.guardianContact} />
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Skills & Projects</h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Technical Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {userData.skills.map((skill, idx) => (
                    <span key={idx} style={{ 
                      padding: '0.4rem 0.8rem', borderRadius: '20px', 
                      background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)',
                      fontSize: '0.85rem', fontWeight: '500'
                    }}>{skill}</span>
                  ))}
                </div>
              </div>

               <div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Projects</h3>
                {userData.projects.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
                    <div style={{ fontWeight: '600' }}>{proj.title}</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>{proj.description}</p>
                    <a href={proj.link} style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View Project &rarr;</a>
                  </div>
                ))}
               </div>
            </div>
          )}

          {activeTab === 'certs' && (
            <div className="empty-state">
              <HiOutlineDocumentText style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p>No certificates uploaded yet.</p>
              <button className="btn btn-sm btn-primary">Upload Certificate</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Helper component for uniform rows
const InfoItem = ({ label, value, fullWidth, highlight, badge }) => (
  <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{label}</div>
    {badge ? (
      <span className="role-badge role-student">{value}</span>
    ) : (
      <div style={{ 
        fontSize: '1rem', 
        fontWeight: highlight ? '700' : '500',
        color: highlight ? 'var(--accent)' : 'var(--text-primary)'
      }}>{value || '-'}</div>
    )}
  </div>
);

export default Profile;
