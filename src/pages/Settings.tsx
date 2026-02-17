import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { 
  MapPin, 
  User, 
  Bell, 
  Star, 
  Monitor, 
  Search,
  Crosshair,
  Plus,
  Cloud,
  Rocket,
  Sparkles,
  Loader2,
  Camera,
  Trash2,
  Key,
  Shield,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { useLocation } from "@/hooks/useLocation";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LocationPickerMap = lazy(() => 
  import("@/components/settings/LocationPickerMap").then(m => ({ default: m.LocationPickerMap }))
);

const settingsNav = [
  { section: "GENERAL", items: [
    { icon: User, label: "Account", id: "account" },
    { icon: MapPin, label: "Location & Conditions", id: "location" },
    { icon: Bell, label: "Notifications", id: "notifications" },
  ]},
  { section: "GEAR", items: [
    { icon: Star, label: "My Equipment", id: "equipment" },
    { icon: Monitor, label: "Display", id: "display" },
  ]},
];

const defaultAlerts = [
  { 
    icon: Cloud, 
    iconColor: "bg-primary", 
    title: "Clear Skies Forecast", 
    description: "Get notified when visibility probability exceeds 80%",
    enabled: true,
  },
  { 
    icon: Rocket, 
    iconColor: "bg-orange-500", 
    title: "ISS & Satellite Flyovers", 
    description: "Alert 15 mins before visible passes",
    enabled: false,
  },
  { 
    icon: Sparkles, 
    iconColor: "bg-purple-500", 
    title: "Meteor Showers", 
    description: "Reminders for peak nights",
    enabled: true,
  },
];

const SETTINGS_STORAGE_KEY = "starlogs-settings";

interface Equipment {
  name: string;
  type: string;
  aperture: string;
  focalLength: string;
  mountType: string;
  notes: string;
}

interface SettingsData {
  bortleScale: number;
  horizonVisibility: number;
  alertStates: boolean[];
  equipment: Equipment[];
  displayTheme: string;
  username: string;
  email: string;
  profileImage: string;
}

const defaultSettings: SettingsData = {
  bortleScale: 2,
  horizonVisibility: 15,
  alertStates: defaultAlerts.map(a => a.enabled),
  equipment: [], // New users start with empty equipment
  displayTheme: "dark",
  username: "Astronomer",
  email: "astronomer@starlogs.app",
  profileImage: "",
};

function loadSettings(): SettingsData {
  const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (saved) {
    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sectionFromUrl = searchParams.get("section");
  const [activeSection, setActiveSection] = useState(sectionFromUrl || "location");
  const { location, setLocation, detectLocation, isDetecting } = useLocation("Flagstaff, Arizona");
  const { theme, setTheme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<SettingsData>(loadSettings);
  const [cityInput, setCityInput] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Equipment>({
    name: "",
    type: "",
    aperture: "",
    focalLength: "",
    mountType: "",
    notes: ""
  });
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update active section when URL param changes
  useEffect(() => {
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  // Parse location into city and coordinates
  useEffect(() => {
    const parts = location.split(",").map(p => p.trim());
    if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
      setLatInput(parts[0]);
      setLonInput(parts[1]);
      setCityInput("");
    } else {
      setCityInput(location);
      setLatInput("");
      setLonInput("");
    }
  }, [location]);

  const handleSave = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    
    // Update location from inputs
    if (latInput && lonInput) {
      setLocation(`${latInput},${lonInput}`);
    } else if (cityInput) {
      setLocation(cityInput);
    }
    
    setHasChanges(false);
    toast.success("Settings saved successfully!");
  };

  const handleCancel = () => {
    setSettings(loadSettings());
    setHasChanges(false);
    toast.info("Changes discarded");
  };

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleAlert = (index: number) => {
    const newStates = [...settings.alertStates];
    newStates[index] = !newStates[index];
    updateSetting("alertStates", newStates);
  };

  const addEquipment = () => {
    if (newEquipment.name.trim()) {
      updateSetting("equipment", [...settings.equipment, { ...newEquipment, name: newEquipment.name.trim() }]);
      setNewEquipment({ name: "", type: "", aperture: "", focalLength: "", mountType: "", notes: "" });
      setShowAddEquipment(false);
    }
  };

  const resetEquipmentForm = () => {
    setNewEquipment({ name: "", type: "", aperture: "", focalLength: "", mountType: "", notes: "" });
    setShowAddEquipment(false);
  };

  const removeEquipment = (index: number) => {
    updateSetting("equipment", settings.equipment.filter((_, i) => i !== index));
  };

  const handleAutoDetect = () => {
    detectLocation();
    setHasChanges(true);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        updateSetting("profileImage", imageData);
        updateProfile({ avatar: imageData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    // Simulated password change
    toast.success("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    // Clear all local data
    localStorage.clear();
    sessionStorage.clear();
    logout();
    toast.success("Account deleted successfully");
    navigate("/auth");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your observation deck and instruments
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-border bg-card"
              onClick={handleCancel}
              disabled={!hasChanges}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-6">
              {settingsNav.map((group) => (
                <div key={group.section}>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    {group.section}
                  </h4>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left",
                          activeSection === item.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Section */}
            {activeSection === "account" && (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="glass-card card-glow rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">
                      Profile Settings
                    </h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/30">
                          {settings.profileImage ? (
                            <img 
                              src={settings.profileImage} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                              {(user?.username || settings.username || "A").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-primary-foreground" />
                        </button>
                        <input 
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Click camera to upload<br/>Max 5MB
                      </p>
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Display Name
                        </label>
                        <Input 
                          value={settings.username}
                          onChange={(e) => updateSetting("username", e.target.value)}
                          className="bg-muted border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Email
                        </label>
                        <Input 
                          type="email"
                          value={user?.email || settings.email}
                          onChange={(e) => updateSetting("email", e.target.value)}
                          className="bg-muted border-border"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Card */}
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-warning" />
                    <h3 className="font-display font-semibold text-foreground">
                      Security
                    </h3>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Change Password</span>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Current Password
                      </label>
                      <Input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-muted border-border"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        New Password
                      </label>
                      <Input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-muted border-border"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Confirm New Password
                      </label>
                      <Input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-muted border-border"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                {/* Session & Danger Zone */}
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-display font-semibold text-foreground">
                      Session
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Sign Out</h4>
                        <p className="text-xs text-muted-foreground">
                          Sign out from your current session
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="border-border"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="glass-card rounded-xl p-6 border-destructive/30">
                  <div className="flex items-center gap-2 mb-6">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <h3 className="font-display font-semibold text-destructive">
                      Danger Zone
                    </h3>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Delete Account</h4>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and all data. This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          className="flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data including observation logs, equipment, and settings.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}

            {/* Location Settings */}
            {activeSection === "location" && (
              <div className="glass-card card-glow rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">
                    Location Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        City / Region
                      </label>
                      <div className="relative">
                        <Input 
                          value={cityInput}
                          onChange={(e) => {
                            setCityInput(e.target.value);
                            setHasChanges(true);
                          }}
                          placeholder="Enter city name"
                          className="bg-muted border-border pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Latitude
                        </label>
                        <Input 
                          value={latInput}
                          onChange={(e) => {
                            setLatInput(e.target.value);
                            setHasChanges(true);
                          }}
                          placeholder="35.1983"
                          className="bg-muted border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Longitude
                        </label>
                        <Input 
                          value={lonInput}
                          onChange={(e) => {
                            setLonInput(e.target.value);
                            setHasChanges(true);
                          }}
                          placeholder="-111.6513"
                          className="bg-muted border-border"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className="flex items-center gap-2 text-primary text-sm hover:underline disabled:opacity-50"
                    >
                      {isDetecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Crosshair className="w-4 h-4" />
                      )}
                      {isDetecting ? "Detecting location..." : "Auto-detect my location"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Suspense fallback={
                      <div className="rounded-xl h-48 bg-muted flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    }>
                      <LocationPickerMap
                        lat={latInput ? parseFloat(latInput) : 35.1983}
                        lon={lonInput ? parseFloat(lonInput) : -111.6513}
                        onLocationChange={(newLat, newLon) => {
                          setLatInput(newLat.toFixed(4));
                          setLonInput(newLon.toFixed(4));
                          setCityInput("");
                          setHasChanges(true);
                        }}
                      />
                    </Suspense>
                    <p className="text-xs text-muted-foreground text-center">
                      Click on the map to select a location
                      {settings.bortleScale <= 3 && (
                        <span className="ml-2 bg-success/20 text-success px-2 py-0.5 rounded">
                          Dark Sky Site
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Bortle Scale */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Light Pollution (Bortle Scale)
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calibrate based on your observation site
                      </p>
                    </div>
                    <span className="text-primary font-display font-bold">
                      Class {settings.bortleScale}
                    </span>
                  </div>
                  <Slider
                    value={[settings.bortleScale]}
                    onValueChange={([value]) => updateSetting("bortleScale", value)}
                    min={1}
                    max={9}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 (Excellent)</span>
                    <span>5 (Suburban)</span>
                    <span>9 (City Center)</span>
                  </div>
                </div>

                {/* Horizon Visibility */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Minimum Horizon Visibility
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Filter events below this altitude
                      </p>
                    </div>
                    <span className="text-primary font-display font-bold">
                      {settings.horizonVisibility}°
                    </span>
                  </div>
                  <Slider
                    value={[settings.horizonVisibility]}
                    onValueChange={([value]) => updateSetting("horizonVisibility", value)}
                    min={0}
                    max={45}
                    step={1}
                  />
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="w-5 h-5 text-warning" />
                  <h3 className="font-display font-semibold text-foreground">
                    Active Alerts
                  </h3>
                </div>

                <div className="space-y-4">
                  {defaultAlerts.map((alert, index) => (
                    <div 
                      key={alert.title}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", alert.iconColor)}>
                        <alert.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {alert.description}
                        </p>
                      </div>
                      <Switch 
                        checked={settings.alertStates[index]}
                        onCheckedChange={() => toggleAlert(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Section */}
            {activeSection === "equipment" && (
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-foreground">
                      Registered Equipment
                    </h3>
                  </div>
                </div>

                {/* Empty state for new users */}
                {settings.equipment.length === 0 && !showAddEquipment && (
                  <div className="text-center py-8 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-medium text-foreground mb-2">No Equipment Registered</h4>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                      Add your telescopes, cameras, eyepieces, and other gear to track what you use during observations.
                    </p>
                    <Button onClick={() => setShowAddEquipment(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Equipment
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.equipment.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm">
                          {item.name}
                        </h4>
                        <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                          {item.type && <p>Type: {item.type}</p>}
                          {item.aperture && <p>Aperture: {item.aperture}</p>}
                          {item.focalLength && <p>Focal Length: {item.focalLength}</p>}
                          {item.mountType && <p>Mount: {item.mountType}</p>}
                          {item.notes && <p className="truncate">Notes: {item.notes}</p>}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeEquipment(index)}
                        className="opacity-0 group-hover:opacity-100 text-destructive text-xs hover:underline transition-opacity flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Equipment Form */}
                {showAddEquipment && (
                  <div className="mt-4 p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                    <h4 className="font-medium text-foreground text-sm">Add New Equipment</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Equipment Name *</label>
                        <Input
                          value={newEquipment.name}
                          onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Celestron NexStar 8SE"
                          className="bg-background border-border"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                        <select
                          value={newEquipment.type}
                          onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select type...</option>
                          <option value="Telescope">Telescope</option>
                          <option value="Binoculars">Binoculars</option>
                          <option value="Camera">Camera</option>
                          <option value="Eyepiece">Eyepiece</option>
                          <option value="Filter">Filter</option>
                          <option value="Mount">Mount</option>
                          <option value="Finder">Finder Scope</option>
                          <option value="Barlow">Barlow Lens</option>
                          <option value="Focuser">Focuser</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Aperture</label>
                        <Input
                          value={newEquipment.aperture}
                          onChange={(e) => setNewEquipment(prev => ({ ...prev, aperture: e.target.value }))}
                          placeholder="e.g., 203mm or 8 inches"
                          className="bg-background border-border"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Focal Length</label>
                        <Input
                          value={newEquipment.focalLength}
                          onChange={(e) => setNewEquipment(prev => ({ ...prev, focalLength: e.target.value }))}
                          placeholder="e.g., 2032mm or f/10"
                          className="bg-background border-border"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Mount Type</label>
                        <select
                          value={newEquipment.mountType}
                          onChange={(e) => setNewEquipment(prev => ({ ...prev, mountType: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select mount...</option>
                          <option value="Alt-Az">Alt-Azimuth</option>
                          <option value="Equatorial">Equatorial</option>
                          <option value="GoTo Alt-Az">GoTo Alt-Azimuth</option>
                          <option value="GoTo Equatorial">GoTo Equatorial</option>
                          <option value="Dobsonian">Dobsonian</option>
                          <option value="Tripod">Tripod</option>
                          <option value="N/A">Not Applicable</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                        <Input
                          value={newEquipment.notes}
                          onChange={(e) => setNewEquipment(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any additional details..."
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={resetEquipmentForm}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={addEquipment} disabled={!newEquipment.name.trim()}>
                        Add Equipment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add button when equipment exists */}
                {settings.equipment.length > 0 && !showAddEquipment && (
                  <button 
                    onClick={() => setShowAddEquipment(true)}
                    className="mt-4 flex items-center justify-center gap-2 w-full p-4 rounded-lg border border-dashed border-border hover:border-primary transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Add Equipment</span>
                  </button>
                )}
              </div>
            )}

            {/* Display Section */}
            {activeSection === "display" && (
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">
                    Display Settings
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Theme
                    </label>
                    <div className="flex gap-3">
                      {["dark", "light", "system"].map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-sm capitalize transition-colors",
                            theme === themeOption
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {themeOption}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select your preferred theme. System will follow your device settings.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </MainLayout>
  );
}
