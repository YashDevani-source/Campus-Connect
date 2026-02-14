const StatusBadge = ({ status }) => {
  const colorMap = {
    pending: 'badge-warning',
    'in-review': 'badge-info',
    resolved: 'badge-success',
    applied: 'badge-info',
    shortlisted: 'badge-warning',
    accepted: 'badge-success',
    rejected: 'badge-danger',
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-danger',
  };

  return <span className={`badge ${colorMap[status] || 'badge-default'}`}>{status}</span>;
};

export default StatusBadge;
