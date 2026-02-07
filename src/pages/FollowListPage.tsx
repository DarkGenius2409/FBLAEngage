import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useFollows, useStudent } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FollowListPage() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const pathname = window.location.pathname;
  const listType: "followers" | "following" = pathname.endsWith("/followers")
    ? "followers"
    : "following";

  const { student: profileStudent } = useStudent(studentId || null);
  const { followers, following, loading } = useFollows(studentId || null);

  const ids = listType === "followers" ? followers : following;
  const title =
    listType === "followers" ? "Followers" : "Following";
  const profileName = profileStudent?.name || "User";

  if (!studentId) {
    navigate("/profile", { replace: true });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{profileName}</h1>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>

      {/* List */}
      <Card className="divide-y">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : ids.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {listType === "followers"
                ? "No followers yet"
                : "Not following anyone yet"}
            </p>
          </div>
        ) : (
          ids.map((id) => <FollowListItem key={id} studentId={id} />)
        )}
      </Card>
    </div>
  );
}

function FollowListItem({ studentId }: { studentId: string }) {
  const { student } = useStudent(studentId);
  const navigate = useNavigate();

  if (!student) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => navigate(`/profile/${studentId}`)}
      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 active:bg-muted transition-colors"
    >
      <Avatar className="w-10 h-10 bg-primary text-primary-foreground text-sm shrink-0">
        {student.image ? (
          <AvatarImage src={student.image} alt={student.name} />
        ) : null}
        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{student.name}</h4>
        <p className="text-xs text-muted-foreground truncate">
          {student.school_roles?.[0]?.role || "Member"} •{" "}
          {student.school?.name || "No Chapter"}
        </p>
      </div>
    </button>
  );
}
