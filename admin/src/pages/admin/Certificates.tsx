import { useEffect, useState } from "react";
import { useCreateData, useFetchData, useDeleteData } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Trash2, Upload, Loader2 } from "lucide-react";
import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";
import { API_URL } from "@/config/config";

interface Certificate {
  id: string;
  image: string; // encrypted filename
  createdAt: string;
}

const AdminUploadCertificatesPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  /* ---------------- API ---------------- */

  const uploadCertificates = useCreateData<void, FormData>(
    "/certificates/admin",
    ["admin-certificates"],
    true
  );

  const { data, isLoading } = useFetchData<{
    success: boolean;
    certificates: Certificate[];
  }>("/certificates", "admin-certificates");

  const deleteCertificate = useDeleteData<void>(
    (id: string) => `/certificates/${id}`,
    ["admin-certificates"]
  );

  const certificates = data?.certificates ?? [];

  /* ---------------- HELPERS ---------------- */

  const fetchCertificateImage = async (filename: string) => {
    try {
      setIsPreviewLoading(true);
      setPreviewUrl(null);

      const token = CookieManager.get("tradovate-token");

      const response = await axios.get(
        `${API_URL}/certificates/image/${filename}`,
        {
          responseType: "blob",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      setPreviewUrl(blobUrl);
    } catch (err) {
      toast.error("Failed to load certificate image");
    } finally {
      setIsPreviewLoading(false);
    }
  };
  useEffect(() => {
    if (previewFilename) {
      fetchCertificateImage(previewFilename);
    }

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewFilename]);

  /* ---------------- HANDLERS ---------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one certificate image");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("certificates", file));

    try {
      await uploadCertificates.mutateAsync(formData);
      toast.success("Certificates uploaded successfully");
      setFiles([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this certificate permanently?");
    if (!confirmed) return;

    try {
      await deleteCertificate.mutateAsync(id);
      toast.success("Certificate deleted");
    } catch {
      toast.error("Failed to delete certificate");
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={18} /> Upload Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />

          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {files.length} file(s) selected
            </p>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploadCertificates.isPending}
            className="w-full"
          >
            {uploadCertificates.isPending ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p className="text-muted-foreground">No certificates uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div>
                    <p className="text-sm font-medium truncate max-w-[220px]">
                      {cert.image}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cert.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setPreviewFilename(cert.image)}
                    >
                      <Eye size={16} />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal (AUTHENTICATED FETCH) */}
      <Dialog
        open={!!previewFilename}
        onOpenChange={() => {
          setPreviewFilename(null);
          setPreviewUrl(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>

          {isPreviewLoading && (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {!isPreviewLoading && previewUrl && (
            <img
              src={previewUrl}
              alt="Certificate preview"
              className="w-full max-h-[70vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUploadCertificatesPage;