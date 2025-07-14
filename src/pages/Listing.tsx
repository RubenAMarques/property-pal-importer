import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { QualityBadge } from "@/components/QualityBadge";
import { QualityChecklist } from "@/components/QualityChecklist";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, ExternalLink, Save, RefreshCw } from "lucide-react";

interface ListingData {
  id: string;
  property_url: string;
  description?: string;
  address?: string;
  price?: number;
  year_built?: string;
  area_m2?: number;
  rooms?: number;
  garage?: string;
  type?: string;
  offer_type?: string;
  photo_urls?: any;
  status: string;
  quality: string;
  score_json?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Listing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: "Error",
          description: "Failed to fetch listing details.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setListing(data);
      setNotes(data.notes || "");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsOK = async () => {
    if (!listing) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'done', 
          quality: 'ok',
          notes: notes
        })
        .eq('id', listing.id);

      if (error) {
        console.error('Error updating listing:', error);
        toast({
          title: "Error",
          description: "Failed to update listing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing marked as OK.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!listing) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ notes })
        .eq('id', listing.id);

      if (error) {
        console.error('Error saving notes:', error);
        toast({
          title: "Error",
          description: "Failed to save notes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Notes saved successfully.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReAnalyse = async () => {
    if (!listing) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'pending' })
        .eq('id', listing.id);

      if (error) {
        console.error('Error updating listing:', error);
        toast({
          title: "Error",
          description: "Failed to re-analyse listing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Listing queued for re-analysis.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Listing not found.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const cleanDescription =
    (() => {
      const desc = listing.description?.trim() ?? '';
      if (!desc) return '(no text)';
      if (desc.startsWith('{')) {
        try {
          const obj = JSON.parse(desc);
          return obj.text ?? obj.name ?? obj.description ?? '(no text)';
        } catch {
          return '(no text)';
        }
      }
      return desc;          // plain string description
    })();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Listing Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                Property Information
                <div className="flex gap-2">
                  <StatusBadge status={listing.status} variant="secondary" />
                  <QualityBadge quality={listing.quality} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Property URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href={listing.property_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm break-all"
                  >
                    {listing.property_url}
                  </a>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {listing.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-sm mt-1">{listing.address}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">
                  {cleanDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {listing.price && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <p className="text-sm mt-1">€{listing.price.toLocaleString()}</p>
                  </div>
                )}

                {listing.area_m2 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Area</label>
                    <p className="text-sm mt-1">{listing.area_m2} m²</p>
                  </div>
                )}

                {listing.rooms && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rooms</label>
                    <p className="text-sm mt-1">{listing.rooms}</p>
                  </div>
                )}

                {listing.year_built && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Year Built</label>
                    <p className="text-sm mt-1">{listing.year_built}</p>
                  </div>
                )}

                {listing.type && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm mt-1">{listing.type}</p>
                  </div>
                )}

                {listing.offer_type && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Offer Type</label>
                    <p className="text-sm mt-1">{listing.offer_type}</p>
                  </div>
                )}
              </div>

              {listing.garage && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Garage</label>
                  <p className="text-sm mt-1">{listing.garage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions and Notes */}
          <div className="space-y-6">
            {/* Quality Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <QualityChecklist scoreJson={listing.score_json} />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add your notes about this listing..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={saving}
                  variant="outline"
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleMarkAsOK} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Mark as OK
                </Button>
                <Button 
                  onClick={handleReAnalyse} 
                  disabled={saving}
                  variant="secondary"
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Re-analyse
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}