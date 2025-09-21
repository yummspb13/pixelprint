"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Save, 
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Mock user data - в реальном приложении это будет загружаться из API
const initialUserData = {
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "+44 20 7123 4567",
  address: "123 Business Street, London EC1A 4HD",
  company: "Smith & Associates",
  jobTitle: "Managing Director",
  website: "https://smithassociates.com",
  notes: "Preferred contact method: Email. Special requirements: Rush orders only."
};

export default function ProfilePage() {
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUserData(initialUserData);
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
        <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-px-fg mb-2">Profile</h1>
          <p className="text-lg text-px-muted">Manage your account information</p>
        </div>

        {/* Profile Picture & Basic Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-px-cyan" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-px-fg text-xl">{userData.name}</h3>
                <p className="text-px-muted">{userData.jobTitle}</p>
                <p className="text-px-muted text-sm">{userData.company}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-px-cyan" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-px-fg">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-px-fg">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-px-fg">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-px-fg">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={userData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>
              </div>

              {/* Job Title & Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-medium text-px-fg">
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={userData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    disabled={!isEditing}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-px-fg">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={userData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-px-fg">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={userData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  rows={3}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-px-fg">
                  Special Notes
                </Label>
                <Textarea
                  id="notes"
                  value={userData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={!isEditing}
                  className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  rows={3}
                  placeholder="Any special requirements or preferences..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
