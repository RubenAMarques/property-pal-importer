import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/StatusBadge";
import { QualityBadge } from "@/components/QualityBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeQuality } from "@/utils/normalizeQuality";

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

      // Normalize quality and status for all listings
      const processedListings = (data || []).map(listing => ({
        ...listing,
        quality: normalizeQuality(listing.quality),
        status: (listing.status ?? "").trim().toLowerCase()
      }));

      setListings(processedListings);

      // Calculate status counts using normalized values
      const counts = processedListings.reduce(
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
            <div className="flex justify-between items-center">
              <CardTitle>All Listings</CardTitle>
              <div className="text-xs text-muted-foreground">
                Listings are re-analysed automatically every 10 minutes.
              </div>
            </div>
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
                    <TableHead>Checking status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow 
                      key={listing.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      tabIndex={0}
                    >
                      <TableCell className="font-medium w-[260px]">
                        <div className="flex items-center gap-1">
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate max-w-[420px] text-gray-700 cursor-pointer">
                                  {listing.property_url}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[420px] break-all">
                                {listing.property_url}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <a
                            href={listing.property_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} className="shrink-0" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        <StatusBadge status={listing.status === 'done' ? 'ok' : listing.status} />
                      </TableCell>
                      <TableCell className="cursor-pointer">
                        <QualityBadge quality={listing.quality} />
                      </TableCell>
                      <TableCell className="text-muted-foreground cursor-pointer">
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