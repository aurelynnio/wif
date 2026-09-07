import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    suspended: 'bg-surface-secondary text-text-secondary',
    banned: 'bg-destructive/10 text-destructive',
  };


  const getLabel = s => {
    switch (s) {
      case 'active':
        return 'Hoạt động';
      case 'pending':
        return 'Chờ duyệt';
      case 'suspended':
        return 'Tạm ngưng';
      case 'banned':
        return 'Bị chặn';
      default:
        return s;
    }
  };

  return (
    <Badge className={styles[status] || styles.active}>{getLabel(status)}</Badge>

  );
};

export default StatusBadge;
