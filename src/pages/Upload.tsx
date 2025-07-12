import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CSVRow {
  property_url: string;
  property_features: string;
  address: string;
  price: string;
  year_built: string;
  area_m2: string;
  rooms: string;
  garage: string;
  type: string;
  offer_type: string;
  [key: string]: string; // for photo_* columns
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
            // Collect all photo URLs from photo_* columns
            const photoUrls = Object.keys(row)
              .filter(key => key.startsWith('photo_'))
              .map(key => row[key])
              .filter(url => url?.trim());

            return {
              property_url: row.property_url,
              description: row.property_features || null,
              address: row.address || null,
              price: row.price ? parseFloat(row.price.replace(/[^\d.-]/g, '')) : null,
              year_built: row.year_built || null,
              area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
              rooms: row.rooms ? parseInt(row.rooms) : null,
              garage: row.garage || null,
              type: row.type || null,
              offer_type: row.offer_type || null,
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