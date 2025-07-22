import { useCallback, useState } from "react";
import { Upload, FileCheck, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  uploadProgress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface DropZoneProps {
  onUploadComplete?: (files: any[]) => void;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export function DropZone({ 
  onUploadComplete, 
  maxFiles = 10, 
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf', 'text/*']
}: DropZoneProps) {
  // Use the new CustomDropZone component
  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <p className="text-sm text-muted-foreground mb-4">
        This component has been replaced. Please use CustomDropZone for better functionality.
      </p>
    </div>
  );
}