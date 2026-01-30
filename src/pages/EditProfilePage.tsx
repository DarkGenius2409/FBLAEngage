import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent, useSchools } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import type { StudentWithRelations } from "@/lib/models";

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

function studentToProfileData(student: StudentWithRelations): ProfileData {
  return {
    bio: student.bio ?? "",
    school: student.school?.name ?? null,
    interests: student.interests ?? [],
    awards: (student.awards ?? []).map((a) => ({
      id: crypto.randomUUID(),
      title: a.title,
      event: a.event,
      icon: a.icon ?? "",
    })),
  };
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    student,
    loading: studentLoading,
    updateStudent,
  } = useStudent(user?.id ?? null);
  const { schools: schoolsFromApi, loading: schoolsLoading } = useSchools();

  const schools = useMemo(
    () => schoolsFromApi.map((s) => s.name),
    [schoolsFromApi],
  );

  const [bio, setBio] = useState("");
  const [school, setSchool] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) {
      const profileData = studentToProfileData(student);
      setBio(profileData.bio);
      setSchool(profileData.school);
      setInterests(profileData.interests);
      setAwards(profileData.awards);
    }
  }, [student]);

  const addInterest = useCallback(() => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setNewInterest("");
    }
  }, [newInterest, interests]);

  const removeInterest = useCallback((interest: string) => {
    setInterests((prev) => prev.filter((i) => i !== interest));
  }, []);

  const addAward = useCallback(() => {
    const newAward: Award = {
      id: crypto.randomUUID(),
      title: "",
      event: "",
      icon: "🏅",
    };
    setAwards((prev) => [...prev, newAward]);
  }, []);

  const updateAward = useCallback(
    (id: string, field: keyof Omit<Award, "id">, value: string) => {
      setAwards((prev) =>
        prev.map((award) =>
          award.id === id ? { ...award, [field]: value } : award,
        ),
      );
    },
    [],
  );

  const removeAward = useCallback((id: string) => {
    setAwards((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  const handleSave = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const schoolId =
        school == null || school === ""
          ? null
          : (schoolsFromApi.find((s) => s.name === school)?.id ?? null);
      const updates = {
        bio: bio.trim() || null,
        school_id: schoolId,
        interests,
        awards: awards
          .filter((a) => a.title.trim() && a.event.trim())
          .map(({ id: _id, ...a }) => a),
      };
      const { error } = await updateStudent(updates);
      if (error) {
        toast.error("Failed to update profile", { description: error.message });
        return;
      }
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      toast.error("Failed to update profile", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => navigate("/profile");

  if (studentLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground">Profile not found</p>
        <Button variant="outline" onClick={goBack} className="mt-4">
          Back to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full h-full bg-background flex flex-col">
      {/* Page title (back is in Layout brand bar) */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Accessibility Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your app experience to match your accessibility needs.
        </p>
      </div>

      {/* Content - extra top padding to move content down */}
      <main className="flex-1 overflow-y-auto mt-8 px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-base sm:text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="text-base sm:text-sm min-h-[120px] resize-none"
            />
          </div>

          {/* School */}
          <div className="space-y-2">
            <Label
              htmlFor="school"
              className="text-base sm:text-sm font-medium"
            >
              School
            </Label>
            <Select
              value={school ?? "none"}
              onValueChange={(value) =>
                setSchool(value === "none" ? null : value)
              }
            >
              <SelectTrigger
                id="school"
                className="w-full h-12 sm:h-10 text-base sm:text-sm"
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
              className="text-base sm:text-sm font-medium"
            >
              Interests
            </Label>
            <div className="flex gap-2">
              <Input
                id="interest-input"
                placeholder="Add an interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
              <Button
                type="button"
                onClick={addInterest}
                className="h-12 sm:h-10 shrink-0 px-5 sm:px-6"
              >
                <Plus className="size-5 sm:size-4 shrink-0 mr-1.5" />
                Add interest
              </Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 sm:px-3 sm:py-1.5 text-base sm:text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-secondary-foreground/10 active:bg-secondary-foreground/20"
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
          <div className="space-y-3">
            <Label className="text-base sm:text-sm font-medium">Awards</Label>
            <Button
              type="button"
              variant="outline"
              onClick={addAward}
              className="h-12 sm:h-10 text-base sm:text-sm bg-transparent"
            >
              <Plus className="size-4 mr-2" />
              Add Award
            </Button>
            {awards.length > 0 && (
              <div className="space-y-3 mt-3">
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="flex flex-col gap-3 rounded-xl border p-4"
                  >
                    <Input
                      placeholder="Award title"
                      value={award.title}
                      onChange={(e) =>
                        updateAward(award.id, "title", e.target.value)
                      }
                      className="h-12 sm:h-10 text-base sm:text-sm"
                    />
                    <Input
                      placeholder="Event name"
                      value={award.event}
                      onChange={(e) =>
                        updateAward(award.id, "event", e.target.value)
                      }
                      className="h-12 sm:h-10 text-base sm:text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Icon"
                        value={award.icon}
                        onChange={(e) =>
                          updateAward(award.id, "icon", e.target.value)
                        }
                        className="w-20 h-12 sm:h-10 text-base sm:text-sm text-center"
                        maxLength={2}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeAward(award.id)}
                        className="h-12 sm:h-10 text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Actions */}
      <div
        className="sticky bottom-0 bg-background border-t p-4 sm:p-6 shrink-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={goBack}
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
