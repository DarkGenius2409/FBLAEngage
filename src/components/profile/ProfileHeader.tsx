import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Briefcase, MapPin, Settings } from 'lucide-react';
import type { StudentWithSchool } from '@/lib/models';

interface ProfileHeaderProps {
  student: StudentWithSchool;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function ProfileHeader({ student }: ProfileHeaderProps) {
  const role = student.school_roles?.[0]?.role || 'Member';
  const schoolName = student.school?.name || 'No Chapter';

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center text-xl rounded-full">
            {getInitials(student.name)}
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold mb-1">{student.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
              <Briefcase className="h-3 w-3" />
              {role} • {schoolName}
            </p>
            {student.school && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {student.school.city || ''} {student.school.state || ''}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          {student.bio || 'No bio yet. Add one to tell others about yourself!'}
        </p>
        {student.interests && student.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {student.interests.map((interest, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
