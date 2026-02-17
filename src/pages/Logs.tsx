import { useState, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Calendar, Star, MapPin, Clock, Pencil, Trash2, Download, FileText, Search, X, CalendarIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewSessionDialog, LogSession } from "@/components/NewSessionDialog";
import { EditSessionDialog } from "@/components/EditSessionDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { ObservationCharts } from "@/components/ObservationCharts";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { exportToCSV, exportToPDF } from "@/utils/exportLogs";
import { toast } from "sonner";
import { format, parse, isWithinInterval, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const STORAGE_KEY = "starlogs_observation_logs";
const FIRST_VISIT_KEY = "starlogs_first_visit_logs";

// Helper to parse date strings like "Oct 23, 2023"
const parseEntryDate = (dateStr: string): Date | null => {
  try {
    const parsed = parse(dateStr, "MMM d, yyyy", new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export default function Logs() {
  // Load from localStorage - new users start with empty logs
  const [logEntries, setLogEntries] = useState<LogSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load logs from localStorage:", e);
    }
    return []; // New users start with empty logs
  });

  // Persist to localStorage whenever logEntries changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logEntries));
    } catch (e) {
      console.error("Failed to save logs to localStorage:", e);
    }
  }, [logEntries]);

  const [editSession, setEditSession] = useState<LogSession | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [bortleFilter, setBortleFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Get unique locations and bortle classes for filter options
  const locations = useMemo(() => {
    const unique = [...new Set(logEntries.map(e => e.location))];
    return unique.sort();
  }, [logEntries]);

  const bortleClasses = useMemo(() => {
    const unique = [...new Set(logEntries.map(e => e.bortle))];
    return unique.sort();
  }, [logEntries]);

  // Calculate dynamic statistics
  const stats = useMemo(() => {
    // Total time calculation
    let totalMinutes = 0;
    logEntries.forEach(entry => {
      const timeMatch = entry.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const startHour = parseInt(timeMatch[1]);
        const startMin = parseInt(timeMatch[2]);
        const endHour = parseInt(timeMatch[3]);
        const endMin = parseInt(timeMatch[4]);
        
        let startTotal = startHour * 60 + startMin;
        let endTotal = endHour * 60 + endMin;
        
        // Handle overnight sessions (e.g., 23:45 - 02:30)
        if (endTotal < startTotal) {
          endTotal += 24 * 60;
        }
        
        totalMinutes += endTotal - startTotal;
      }
    });
    
    const totalHours = Math.round(totalMinutes / 60);
    
    // Unique objects count
    const allObjects = logEntries.flatMap(e => e.objects);
    const uniqueObjects = new Set(allObjects);
    
    // Unique locations count
    const uniqueLocations = new Set(logEntries.map(e => e.location));
    
    // Total sessions
    const totalSessions = logEntries.length;
    
    return {
      totalHours,
      objectsLogged: uniqueObjects.size,
      locations: uniqueLocations.size,
      sessions: totalSessions,
    };
  }, [logEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return logEntries.filter(entry => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        entry.location.toLowerCase().includes(searchLower) ||
        entry.notes.toLowerCase().includes(searchLower) ||
        entry.objects.some(obj => obj.toLowerCase().includes(searchLower)) ||
        entry.date.toLowerCase().includes(searchLower);

      // Location filter
      const matchesLocation = locationFilter === "all" || entry.location === locationFilter;

      // Bortle filter
      const matchesBortle = bortleFilter === "all" || entry.bortle === bortleFilter;

      // Date range filter
      let matchesDateRange = true;
      if (startDate || endDate) {
        const entryDate = parseEntryDate(entry.date);
        if (entryDate) {
          if (startDate && endDate) {
            matchesDateRange = isWithinInterval(entryDate, { start: startDate, end: endDate });
          } else if (startDate) {
            matchesDateRange = entryDate >= startDate;
          } else if (endDate) {
            matchesDateRange = entryDate <= endDate;
          }
        } else {
          matchesDateRange = false; // Exclude entries with unparseable dates when filtering
        }
      }

      return matchesSearch && matchesLocation && matchesBortle && matchesDateRange;
    });
  }, [logEntries, searchQuery, locationFilter, bortleFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("all");
    setBortleFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasActiveFilters = searchQuery || locationFilter !== "all" || bortleFilter !== "all" || startDate || endDate;

  const handleAddSession = (session: LogSession) => {
    setLogEntries([session, ...logEntries]);
    toast.success("Session logged");
  };

  const handleEditSession = (session: LogSession) => {
    setLogEntries(logEntries.map(e => e.id === session.id ? session : e));
    toast.success("Session updated");
  };

  const handleDeleteSession = () => {
    if (deleteId) {
      setLogEntries(logEntries.filter(e => e.id !== deleteId));
      toast.success("Session deleted");
      setDeleteId(null);
    }
  };

  const openEdit = (session: LogSession) => {
    setEditSession(session);
    setEditOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Observation Logs
            </h1>
            <p className="text-muted-foreground">
              Track and catalog your stargazing sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border bg-card">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  exportToCSV(logEntries);
                  toast.success("Exported to CSV");
                }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  exportToPDF(logEntries);
                  toast.success("Exported to PDF");
                }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <NewSessionDialog onAddSession={handleAddSession} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <span className="font-display text-2xl font-bold text-foreground block">{stats.totalHours}h</span>
            <span className="text-xs text-muted-foreground">Total Time</span>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-warning mx-auto mb-2" />
            <span className="font-display text-2xl font-bold text-foreground block">{stats.objectsLogged}</span>
            <span className="text-xs text-muted-foreground">Objects Logged</span>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <MapPin className="w-5 h-5 text-success mx-auto mb-2" />
            <span className="font-display text-2xl font-bold text-foreground block">{stats.locations}</span>
            <span className="text-xs text-muted-foreground">Locations</span>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Calendar className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <span className="font-display text-2xl font-bold text-foreground block">{stats.sessions}</span>
            <span className="text-xs text-muted-foreground">Sessions</span>
          </div>
        </div>

        {/* Charts */}
        <ObservationCharts logEntries={logEntries} />

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[160px] bg-card border-border">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={bortleFilter} onValueChange={setBortleFilter}>
                <SelectTrigger className="w-[140px] bg-card border-border">
                  <Star className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Bortle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bortle</SelectItem>
                  {bortleClasses.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[150px] justify-start text-left font-normal bg-card border-border",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[150px] justify-start text-left font-normal bg-card border-border",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredEntries.length} of {logEntries.length} entries
          </p>
        )}

        {/* Log Entries */}
        <div className="space-y-4">
          {/* Empty state for new users */}
          {logEntries.length === 0 && !hasActiveFilters && (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Start Your Observation Journey
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Log your first stargazing session to track celestial objects, viewing conditions, and build your personal astronomy journal.
              </p>
              <NewSessionDialog onAddSession={handleAddSession} />
            </div>
          )}

          {filteredEntries.length === 0 && hasActiveFilters ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">No matching entries</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : null}
          
          {filteredEntries.map((entry) => (
            <div 
              key={entry.id}
              className="glass-card card-glow rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display font-semibold text-foreground">
                      {entry.date}
                    </span>
                    <span className="text-sm text-muted-foreground">{entry.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{entry.location}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-primary">{entry.bortle}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>Seeing: {entry.seeing}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); openEdit(entry); }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); openDelete(entry.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {entry.objects.map((obj) => (
                  <span 
                    key={obj}
                    className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full"
                  >
                    {obj}
                  </span>
                ))}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {entry.notes}
              </p>

              {/* Photo Thumbnails */}
              {entry.photos && entry.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {entry.photos.slice(0, 4).map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      className="rounded-lg border border-border overflow-hidden hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxPhotos(entry.photos || []);
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                      aria-label={`Open photo ${index + 1}`}
                    >
                      <img
                        src={photo}
                        alt={`Observation ${index + 1}`}
                        className="w-12 h-12 object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                  {entry.photos.length > 4 && (
                    <button
                      type="button"
                      className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxPhotos(entry.photos || []);
                        setLightboxIndex(4);
                        setLightboxOpen(true);
                      }}
                      aria-label={`Open remaining ${entry.photos.length - 4} photos`}
                    >
                      <span className="text-xs text-muted-foreground">+{entry.photos.length - 4}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State Prompt */}
        <div className="glass-card rounded-xl p-8 mt-6 border-dashed text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-2">Log Your Next Session</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Record what you observed, conditions, and notes for future reference.
          </p>
          <NewSessionDialog onAddSession={handleAddSession} />
        </div>

        {/* Edit Dialog */}
        <EditSessionDialog
          session={editSession}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleEditSession}
        />

        <PhotoLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          photos={lightboxPhotos}
          initialIndex={lightboxIndex}
        />

        {/* Delete Confirmation */}
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteSession}
        />

        <Footer />
      </div>
    </MainLayout>
  );
}
