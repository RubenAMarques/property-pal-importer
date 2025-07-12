import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, FileText, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Auth Header */}
      <div className="flex justify-end p-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button onClick={() => signOut()} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button onClick={() => navigate('/auth')} variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary-glow/5 border-b">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Property Pal Importer
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Import, manage, and review your property listings with ease. 
              Upload CSV files and track the status of each property.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => user ? navigate('/upload') : navigate('/auth')} 
                size="lg"
                className="bg-gradient-to-r from-primary to-primary-glow shadow-lg hover:shadow-xl transition-all"
              >
                <Upload className="mr-2 h-5 w-5" />
                Import Listings
              </Button>
              <Button 
                onClick={() => user ? navigate('/dashboard') : navigate('/auth')} 
                variant="outline" 
                size="lg"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple steps to manage your property data efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Upload CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Import your property listings from a CSV file with all the necessary details.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. Review Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View all your listings in a clean dashboard with status tracking and counters.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>3. Manage Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Review individual listings, add notes, and mark them as approved or for review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
