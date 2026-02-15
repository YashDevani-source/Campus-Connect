import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import {
  HiOutlineUser, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineDocumentText, HiOutlinePencilAlt, HiOutlineDownload,
  HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail,
  HiOutlineIdentification, HiOutlineUserGroup, HiOutlineLightningBolt,
  HiOutlineChartBar, HiOutlineExternalLink, HiOutlineCalendar, HiOutlineArrowRight,
  HiOutlineClipboardList, HiOutlineTruck, HiOutlineOfficeBuilding, HiOutlinePlus, HiOutlineBookOpen
} from 'react-icons/hi';

const Profile = () => {
  const { user } = useAuth();
  
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HiOutlineIdentification /> {user.role === 'student' ? (user.rollNumber || 'N/A') : user.email}</span>
            {user.department && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HiOutlineAcademicCap /> {user.department}</span>}
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => toast('Edit functionality coming soon!')}><HiOutlinePencilAlt /> Edit</button>
          {user.role === 'student' && (
            <button className="btn btn-sm btn-primary" onClick={handleDownloadID}><HiOutlineDownload /> ID Card</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
        {user.role === 'student' && <StudentProfile user={user} />}
        {user.role === 'faculty' && <FacultyProfile user={user} />}
        {user.role === 'managementMember' && <ManagementProfile user={user} />}
        {user.role === 'admin' && <AdminProfile user={user} />}
      </div>
    </div>
  );
};

/* ═══════ STUDENT PROFILE ═══════ */
const StudentProfile = ({ user }) => {
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
    { id: 'report', label: 'Report Card', icon: <HiOutlineChartBar /> },
  ];

  return (
    <>
      <SidebarNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      
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

        {activeTab === 'certs' && <CertificatesTab />}
        {activeTab === 'report' && <ReportCardTab />}
      </div>
    </>
  );
};

/* ═══════ FACULTY PROFILE ═══════ */
const FacultyProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Profile Info', icon: <HiOutlineUser /> },
    { id: 'courses', label: 'My Courses', icon: <HiOutlineAcademicCap /> },
    { id: 'research', label: 'Research', icon: <HiOutlineDocumentText /> },
  ];

  return (
    <>
      <SidebarNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', minHeight: '400px' }}>
        {activeTab === 'basic' && (
          <div>
             <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Faculty Information</h2>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <InfoItem label="Full Name" value={user.name} />
                <InfoItem label="Email" value={user.email} />
                <InfoItem label="Department" value={user.department} />
                <InfoItem label="Designation" value="Assistant Professor" />
                <InfoItem label="Joined" value={new Date(user.createdAt).getFullYear()} />
                <InfoItem label="Role" value={user.role} badge />
             </div>
             
             <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <Link to="/faculty/propose-course" className="btn btn-outline"><HiOutlinePlus /> Propose Course</Link>
                   <Link to="/faculty/courses" className="btn btn-outline"><HiOutlineAcademicCap /> Manage Courses</Link>
                   <Link to="/faculty/attendance" className="btn btn-outline"><HiOutlineClipboardList /> Mark Attendance</Link>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'courses' && (
           <div className="empty-state-card">
              <HiOutlineAcademicCap style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h3>Teaching Courses</h3>
              <p>Courses assigned to you will appear here.</p>
              <Link to="/faculty/courses" className="btn btn-sm btn-primary" style={{marginTop: '1rem'}}>Go to Courses</Link>
           </div>
        )}
        {activeTab === 'research' && (
           <div className="empty-state-card">
              <HiOutlineDocumentText style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h3>Research Publications</h3>
              <p>Research details functionality coming soon.</p>
           </div>
        )}
      </div>
    </>
  );
};

/* ═══════ MANAGEMENT PROFILE ═══════ */
const ManagementProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Profile Info', icon: <HiOutlineUser /> },
    { id: 'work', label: 'Work Overview', icon: <HiOutlineBriefcase /> },
  ];

  return (
    <>
      <SidebarNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', minHeight: '400px' }}>
        {activeTab === 'basic' && (
          <div>
             <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Staff Information</h2>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <InfoItem label="Full Name" value={user.name} />
                <InfoItem label="Email" value={user.email} />
                <InfoItem label="Department" value={user.department || 'Administration'} />
                <InfoItem label="Role" value="Management Staff" badge />
                <InfoItem label="Joined" value={new Date(user.createdAt).getFullYear()} />
             </div>

             <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Management Dashboard</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                   <Link to="/management/course-approval" className="btn btn-outline"><HiOutlineBookOpen /> Course Approvals</Link>
                   <Link to="/management/grievances" className="btn btn-outline"><HiOutlineClipboardList /> Grievances</Link>
                   <Link to="/management/transport" className="btn btn-outline"><HiOutlineTruck /> Transport</Link>
                   <Link to="/management/hostel" className="btn btn-outline"><HiOutlineOfficeBuilding /> Hostel</Link>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'work' && (
           <div className="empty-state-card">
              <HiOutlineBriefcase style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h3>Work Overview</h3>
              <p>Assigned tasks and activity logs will appear here.</p>
           </div>
        )}
      </div>
    </>
  );
};

/* ═══════ ADMIN PROFILE ═══════ */
const AdminProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Admin Info', icon: <HiOutlineUser /> },
    { id: 'system', label: 'System Status', icon: <HiOutlineChartBar /> },
  ];

  return (
    <>
      <SidebarNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', minHeight: '400px' }}>
        {activeTab === 'basic' && (
          <div>
             <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Administrator Profile</h2>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <InfoItem label="Full Name" value={user.name} />
                <InfoItem label="Email" value={user.email} />
                <InfoItem label="Role" value="Super Admin" badge />
                <InfoItem label="System Access" value="Full Control" highlight />
             </div>

             <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>System Administration</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                   <Link to="/admin/course-approval" className="btn btn-outline"><HiOutlineBookOpen /> Course Approvals</Link>
                   <Link to="/admin/users" className="btn btn-outline"><HiOutlineUserGroup /> User Management</Link>
                   <Link to="/admin/settings" className="btn btn-outline"><HiOutlineLightningBolt /> System Settings</Link>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'system' && (
           <div className="empty-state-card">
              <HiOutlineChartBar style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h3>System Health</h3>
              <p>Server status: <strong>Operational</strong></p>
              <p>Database status: <strong>Connected</strong></p>
           </div>
        )}
      </div>
    </>
  );
};

/* ═══════ SHARED COMPONENTS ═══════ */

const SidebarNavigation = ({ tabs, activeTab, setActiveTab }) => (
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
);

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

// ... (CertificatesTab and ReportCardTab components remain unchanged)

/* ═══════ CERTIFICATES TAB (fetches from API) ═══════ */
const CertificatesTab = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/certificates');
        setCertificates(res.data.data || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const typeColors = {
    course: 'var(--accent)', internship: 'var(--success)',
    achievement: 'var(--warning)', other: 'var(--text-secondary)'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" /><p>Loading certificates...</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ margin: 0 }}>My Certificates</h2>
        <Link to="/student/certificates" className="btn btn-sm btn-outline" style={{ textDecoration: 'none' }}>
          View All <HiOutlineArrowRight />
        </Link>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state-card">
          <HiOutlineDocumentText style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Certificates</h3>
          <p>Certificates issued to you will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {certificates.map((cert, idx) => (
            <div key={cert._id} className="cert-card animate-scale-in" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="cert-card-accent" style={{ background: typeColors[cert.type] || 'var(--accent)' }} />
              <div className="cert-card-icon" style={{ color: typeColors[cert.type] || 'var(--accent)' }}>
                <HiOutlineDocumentText />
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <span className="badge" style={{ background: `${typeColors[cert.type]}15`, color: typeColors[cert.type], margin: '0.5rem 0' }}>
                {cert.type}
              </span>
              <div className="cert-details">
                <span><HiOutlineUser /> {cert.issuer}</span>
                <span><HiOutlineCalendar /> {new Date(cert.issueDate).toLocaleDateString()}</span>
              </div>
              {cert.fileUrl && (
                <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: 'auto' }}>
                  <HiOutlineExternalLink /> View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════ REPORT CARD TAB (fetches CGPA from API) ═══════ */
const ReportCardTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/cgpa');
        setData(res.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" /><p>Loading report...</p></div>;

  if (!data || !data.semesters?.length) return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Report Card</h2>
        <Link to="/student/report" className="btn btn-sm btn-outline" style={{ textDecoration: 'none' }}>
          Full Report <HiOutlineArrowRight />
        </Link>
      </div>
      <div className="empty-state-card">
        <HiOutlineChartBar style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
        <h3>No Academic Data</h3>
        <p>Semester reports have not been generated yet.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Report Card</h2>
        <Link to="/student/report" className="btn btn-sm btn-outline" style={{ textDecoration: 'none' }}>
          Full Report <HiOutlineArrowRight />
        </Link>
      </div>

      {/* CGPA Summary */}
      <div className="report-hero-stats" style={{ margin: '1rem 0 1.5rem' }}>
        <div className="report-stat-big">
          <span className="report-stat-val" style={{ color: 'var(--accent)' }}>{data.cgpa}</span>
          <span className="report-stat-label">CGPA</span>
        </div>
        <div className="report-stat-big">
          <span className="report-stat-val">{data.totalCreditsEarned}</span>
          <span className="report-stat-label">Credits</span>
        </div>
        <div className="report-stat-big">
          <span className="report-stat-val">{data.semesters.length}</span>
          <span className="report-stat-label">Semesters</span>
        </div>
      </div>

      {/* SGPA Bars */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.25rem', height: '140px', marginBottom: '1.5rem' }}>
        {data.semesters.map((sem, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{sem.sgpa}</span>
            <div style={{ width: '24px', height: '100px', background: 'var(--bg-input)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%', borderRadius: '12px', minHeight: '4px',
                height: `${(sem.sgpa / 10) * 100}%`,
                background: sem.sgpa >= 8 ? 'var(--success)' : sem.sgpa >= 6 ? 'var(--accent)' : 'var(--warning)',
                animation: 'barGrow 0.8s ease forwards',
                animationDelay: `${idx * 0.15}s`
              }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>S{sem.semester}</span>
          </div>
        ))}
      </div>

      {/* Semester Summary */}
      {data.semesters.map((sem, idx) => (
        <div key={idx} style={{
          background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', marginBottom: '0.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600 }}>Semester {sem.semester}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-success">SGPA: {sem.sgpa}</span>
            <span className="badge badge-default">{sem.totalCreditsEarned || 0} Cr</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profile;
