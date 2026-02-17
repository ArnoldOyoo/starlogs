import { useState, useEffect, useRef, type KeyboardEvent, type FormEvent, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Camera } from "lucide-react";
import { toast } from "sonner";
import { LogSession } from "./NewSessionDialog";

interface EditSessionDialogProps {
  session: LogSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (session: LogSession) => void;
}

export function EditSessionDialog({ session, open, onOpenChange, onSave }: EditSessionDialogProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [bortle, setBortle] = useState("");
  const [seeing, setSeeing] = useState("");
  const [notes, setNotes] = useState("");
  const [objectInput, setObjectInput] = useState("");
  const [objects, setObjects] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      // Parse the date back to input format
      const parsedDate = new Date(session.date);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate.toISOString().split('T')[0]);
      } else {
        setDate("");
      }
      
      // Parse time range
      if (session.time.includes(" - ")) {
        const [start, end] = session.time.split(" - ");
        setStartTime(start || "");
        setEndTime(end || "");
      } else {
        setStartTime(session.time || "");
        setEndTime("");
      }
      
      setLocation(session.location);
      setBortle(session.bortle);
      setSeeing(session.seeing);
      setNotes(session.notes);
      setObjects(session.objects);
      setPhotos(session.photos || []);
    }
  }, [session]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select only image files');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be under 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addObject = () => {
    const value = objectInput.trim();
    if (!value) return;
    if (objects.includes(value)) return;
    setObjects((prev) => [...prev, value]);
    setObjectInput("");
  };

  const removeObject = (obj: string) => {
    setObjects((prev) => prev.filter((o) => o !== obj));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addObject();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start && !end) return "";
    if (start && !end) return start;
    if (!start && end) return end;
    return `${start} - ${end}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!date || !location || !bortle || !seeing) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!session) return;

    const updatedSession: LogSession = {
      id: session.id,
      date: formatDate(date),
      time: formatTimeRange(startTime, endTime),
      location: location.trim(),
      bortle,
      objects,
      seeing,
      notes: notes.trim(),
      photos: photos.length > 0 ? photos : undefined,
    };

    onSave(updatedSession);
    toast.success("Session updated!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Time Range</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background border-border"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Location *</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Joshua Tree, CA"
              className="bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bortle Class *</Label>
              <Select value={bortle} onValueChange={setBortle}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class 1">Class 1 - Excellent</SelectItem>
                  <SelectItem value="Class 2">Class 2 - Typical Dark</SelectItem>
                  <SelectItem value="Class 3">Class 3 - Rural Sky</SelectItem>
                  <SelectItem value="Class 4">Class 4 - Rural/Suburban</SelectItem>
                  <SelectItem value="Class 5">Class 5 - Suburban</SelectItem>
                  <SelectItem value="Class 6">Class 6 - Bright Suburban</SelectItem>
                  <SelectItem value="Class 7">Class 7 - Suburban/Urban</SelectItem>
                  <SelectItem value="Class 8">Class 8 - City Sky</SelectItem>
                  <SelectItem value="Class 9">Class 9 - Inner-City</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Seeing *</Label>
              <Select value={seeing} onValueChange={setSeeing}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Rate seeing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5/5">5/5 - Excellent</SelectItem>
                  <SelectItem value="4/5">4/5 - Good</SelectItem>
                  <SelectItem value="3/5">3/5 - Average</SelectItem>
                  <SelectItem value="2/5">2/5 - Poor</SelectItem>
                  <SelectItem value="1/5">1/5 - Very Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-objects">Objects Observed</Label>
            <div className="flex gap-2">
              <Input
                id="edit-objects"
                value={objectInput}
                onChange={(e) => setObjectInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type an object and press Enter"
                className="bg-background border-border"
              />
              <Button type="button" variant="outline" onClick={addObject} className="shrink-0">
                Add
              </Button>
            </div>

            {objects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {objects.map((obj) => (
                  <span
                    key={obj}
                    className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    {obj}
                    <button
                      type="button"
                      onClick={() => removeObject(obj)}
                      className="hover:text-primary/80"
                      aria-label={`Remove ${obj}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conditions, equipment, highlights..."
              className="bg-background border-border min-h-[100px]"
            />
          </div>

          {/* Photo Attachments */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={photo} 
                    alt={`Observation ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Add</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">Max 2MB per image. Stored locally.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
