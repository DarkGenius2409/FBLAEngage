import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useStudent } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface FollowingItemProps {
  studentId: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function FollowingItem({ studentId }: FollowingItemProps) {
  const { student } = useStudent(studentId);
  const navigate = useNavigate();

  if (!student) return null;

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
      <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-sm">
        {getInitials(student.name)}
      </Avatar>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{student.name}</h4>
        <p className="text-xs text-muted-foreground">
          {student.school_roles?.[0]?.role || 'Member'} • {student.school?.name || 'No Chapter'}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/profile/${studentId}`)}
      >
        <span className="text-xs">View</span>
      </Button>
    </div>
  );
}
