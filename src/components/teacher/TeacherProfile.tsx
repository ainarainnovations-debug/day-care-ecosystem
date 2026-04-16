import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Mail, Phone, Building2, Edit, Save, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTeacherProfile, updateTeacherProfile } from "@/lib/teacherService";
import type { TeacherProfile as TeacherProfileType } from "@/types/teacher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TeacherProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TeacherProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [newSpec, setNewSpec] = useState("");

  const displayName = user?.user_metadata?.display_name || "Teacher";
  const email = user?.email || "";

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const data = await getTeacherProfile(user.id);
    if (data) {
      setProfile(data);
      setBio(data.bio || "");
      setYearsExperience(data.years_experience || 0);
      setHourlyRate(data.hourly_rate || 0);
      setCertifications(data.certifications || []);
      setSpecializations(data.specializations || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    const updates = {
      bio,
      years_experience: yearsExperience,
      hourly_rate: hourlyRate,
      certifications,
      specializations,
    };

    const success = await updateTeacherProfile(user.id, updates);
    
    if (success) {
      toast({ title: "Profile updated! ✅" });
      setIsEditing(false);
      loadProfile();
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const addCertification = () => {
    if (newCert.trim()) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert("");
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addSpecialization = () => {
    if (newSpec.trim()) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec("");
    }
  };

  const removeSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">My Profile</h1>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setIsEditing(false);
              loadProfile();
            }}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Avatar + Basic Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-20 h-20 mb-3">
              <AvatarImage src={profile?.photo_url} />
              <AvatarFallback className="text-2xl">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="font-heading text-xl font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">Teacher</p>
            {profile?.employment_status && (
              <Badge variant="secondary" className="mt-2">
                {profile.employment_status}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{email}</p>
              </div>
            </div>

            {profile?.employment_start_date && (
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">
                    {new Date(profile.employment_start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your experience and credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Hourly Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    min="0"
                    step="0.50"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <Label>Certifications</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="Add certification..."
                    onKeyPress={(e) => e.key === "Enter" && addCertification()}
                  />
                  <Button type="button" size="icon" onClick={addCertification}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {certifications.map((cert, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeCertification(idx)}>
                      {cert} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <Label>Specializations</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    placeholder="Add specialization..."
                    onKeyPress={(e) => e.key === "Enter" && addSpecialization()}
                  />
                  <Button type="button" size="icon" onClick={addSpecialization}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specializations.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removeSpecialization(idx)}>
                      {spec} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {bio && (
                <div>
                  <Label>Bio</Label>
                  <p className="text-sm text-muted-foreground mt-1">{bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experience</Label>
                  <p className="text-sm font-medium">{yearsExperience} years</p>
                </div>
                <div>
                  <Label>Hourly Rate</Label>
                  <p className="text-sm font-medium">${hourlyRate}/hr</p>
                </div>
              </div>

              {certifications.length > 0 && (
                <div>
                  <Label>Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certifications.map((cert, idx) => (
                      <Badge key={idx} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {specializations.length > 0 && (
                <div>
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specializations.map((spec, idx) => (
                      <Badge key={idx} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default TeacherProfile;
