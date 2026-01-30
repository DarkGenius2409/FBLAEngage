'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Award {
  id: string;
  title: string;
  event: string;
  icon: string;
}

export interface ProfileData {
  bio: string;
  school: string | null;
  interests: string[];
  awards: Award[];
}

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ProfileData;
  schools?: string[];
  onSave?: (data: ProfileData) => Promise<void> | void;
}

const defaultProfileData: ProfileData = {
  bio: '',
  school: null,
  interests: [],
  awards: [],
};

export function EditProfileModal({
  open,
  onOpenChange,
  initialData = defaultProfileData,
  schools = [],
  onSave,
}: EditProfileModalProps) {
  const [bio, setBio] = React.useState(initialData.bio);
  const [school, setSchool] = React.useState<string | null>(initialData.school);
  const [interests, setInterests] = React.useState<string[]>(initialData.interests);
  const [awards, setAwards] = React.useState<Award[]>(initialData.awards);
  const [newInterest, setNewInterest] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (open) {
      setBio(initialData.bio);
      setSchool(initialData.school);
      setInterests(initialData.interests);
      setAwards(initialData.awards);
      setNewInterest('');
    }
  }, [open, initialData]);

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const addAward = () => {
    const newAward: Award = {
      id: crypto.randomUUID(),
      title: '',
      event: '',
      icon: '',
    };
    setAwards([...awards, newAward]);
  };

  const updateAward = (id: string, field: keyof Omit<Award, 'id'>, value: string) => {
    setAwards(
      awards.map((award) =>
        award.id === id ? { ...award, [field]: value } : award
      )
    );
  };

  const removeAward = (id: string) => {
    setAwards(awards.filter((award) => award.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.({
        bio,
        school,
        interests,
        awards,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl p-0 gap-0 fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 translate-y-0 overflow-hidden border-border m-0 sm:m-4">
        {/* Drag Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        <DialogHeader className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 shrink-0">
          <DialogTitle className="text-lg text-foreground mb-2">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update your profile information, bio, school, interests, and awards.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 space-y-8">
          {/* Bio */}
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-base sm:text-sm text-foreground font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="text-base sm:text-sm min-h-[120px] border-input bg-background"
            />
          </div>

          {/* School */}
          <div className="space-y-3">
            <Label htmlFor="school" className="text-base sm:text-sm text-foreground font-medium">
              School
            </Label>
            <Select
              value={school ?? 'none'}
              onValueChange={(value) => setSchool(value === 'none' ? null : value)}
            >
              <SelectTrigger
                id="school"
                className="w-full h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
              >
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No School</SelectItem>
                {schools.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label
              htmlFor="interest-input"
              className="text-base sm:text-sm text-foreground font-medium"
            >
              Interests
            </Label>
            <div className="flex gap-3">
              <Input
                id="interest-input"
                placeholder="Add an interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
              />
              <Button
                type="button"
                size="icon"
                onClick={addInterest}
                className="size-12 sm:size-10 shrink-0"
              >
                <Plus className="size-5 sm:size-4" />
                <span className="sr-only">Add interest</span>
              </Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-4">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 sm:px-3 sm:py-1 text-base sm:text-sm text-foreground"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/10 active:bg-secondary-foreground/20"
                    >
                      <X className="size-4 sm:size-3" />
                      <span className="sr-only">Remove {interest}</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Awards */}
          <div className="space-y-4">
            <Label className="text-base sm:text-sm text-foreground font-medium">Awards</Label>
            <Button
              type="button"
              variant="outline"
              onClick={addAward}
              className="h-12 sm:h-10 text-base sm:text-sm border-border bg-transparent hover:bg-muted"
            >
              Add Award
            </Button>
            {awards.length > 0 && (
              <div className="mt-4 space-y-4">
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-3 rounded-xl sm:rounded-md border border-border p-4 sm:p-4 bg-background"
                  >
                    <Input
                      placeholder="Title"
                      value={award.title}
                      onChange={(e) => updateAward(award.id, 'title', e.target.value)}
                      className="flex-1 h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
                    />
                    <Input
                      placeholder="Event"
                      value={award.event}
                      onChange={(e) => updateAward(award.id, 'event', e.target.value)}
                      className="flex-1 h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
                    />
                    <div className="flex gap-3">
                      <Input
                        placeholder="Icon"
                        value={award.icon}
                        onChange={(e) => updateAward(award.id, 'icon', e.target.value)}
                        className="w-20 sm:w-16 h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
                        maxLength={2}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAward(award.id)}
                        className="size-12 sm:size-10 shrink-0"
                      >
                        <X className="size-5 sm:size-4" />
                        <span className="sr-only">Remove award</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row gap-4 px-6 py-5 sm:px-8 sm:py-6 border-t border-border shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm border-border bg-transparent hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
