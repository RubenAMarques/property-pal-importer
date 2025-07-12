import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface CSVRow {
  property_url: string;
  property_features: string;
  address: string;
  price: string;
  year_built: string;
  area: string;
  bedrooms: string;
  garage: string;
  type: string;
  listing_type: string;
  primary_image: string;
  images: string;
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const rows = results.data as CSVRow[];
          const validRows = rows.filter(row => row.property_url?.trim());

          const listingsToInsert = validRows.map((row) => {
            // Build photo URLs array from primary_image and images
            const photoUrls: string[] = [];
            
            // Add primary_image if it exists
            if (row.primary_image?.trim()) {
              photoUrls.push(row.primary_image.trim());
            }
            
            // Split images on comma or semicolon and append
            if (row.images?.trim()) {
              const additionalImages = row.images
                .split(/[,;]/)
                .map(url => url.trim())
                .filter(url => url);
              photoUrls.push(...additionalImages);
            }

            return {
              property_url: row.property_url,
              description: row.property_features || null,
              address: row.address || null,
              price: row.price ? parseFloat(row.price.replace(/[^\d.-]/g, '')) : null,
              year_built: row.year_built || null,
              area_m2: row.area ? parseFloat(row.area) : null,
              rooms: row.bedrooms ? parseInt(row.bedrooms) : null,
              garage: row.garage || null,
              type: row.type || null,
              offer_type: row.listing_type || null,
              photo_urls: photoUrls.length > 0 ? photoUrls : null,
              status: 'pending',
            };
          });

          const { error } = await supabase
            .from('listings')
            .insert(listingsToInsert);

          if (error) {
            console.error('Import error:', error);
            toast({
              title: "Import failed",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Import complete!",
              description: `Successfully imported ${listingsToInsert.length} listings.`,
            });
            navigate('/dashboard');
          }
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          toast({
            title: "CSV parse error",
            description: "Failed to parse the CSV file.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Import Listings</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to import property listings into your dashboard.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload onFileSelect={setFile} disabled={loading} />
            
            <Button 
              onClick={handleImport} 
              disabled={!file || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Listings"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}