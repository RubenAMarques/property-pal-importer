import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { QualityBadge } from "@/components/QualityBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Listing {
  id: string;
  property_url: string;
  status: string;
  quality: string;
  created_at: string;
}

interface StatusCounts {
  ok: number;
  pending: number;
  review: number;
}

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    ok: 0,
    pending: 0,
    review: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, property_url, status, quality, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Error",
          description: "Failed to fetch listings.",
          variant: "destructive",
        });
        return;
      }

      setListings(data || []);

      // Calculate status counts
      const counts = (data || []).reduce(
        (acc, listing) => {
          if (listing.status === 'pending') {
            acc.pending++;
          }
          if (listing.quality === 'ok') {
            acc.ok++;
          }
          if (listing.quality === 'review') {
            acc.review++;
          }
          return acc;
        },
        { ok: 0, pending: 0, review: 0 }
      );
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your property listings and review their status.
            </p>
          </div>
          <Button onClick={() => navigate('/upload')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Import Listings
          </Button>
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{statusCounts.ok}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{statusCounts.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{statusCounts.review}</div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No listings found.</p>
                <Button onClick={() => navigate('/upload')}>
                  Import your first listings
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow 
                      key={listing.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate">
                          {listing.property_url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={listing.status === 'done' ? 'ok' : listing.status} />
                      </TableCell>
                      <TableCell>
                        <QualityBadge quality={listing.quality} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}