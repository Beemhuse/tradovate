import { useEffect, useState } from "react";
import { useFetchData } from "@/hooks/use-api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Loader2, FileCheck } from "lucide-react";
import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";
import { API_URL } from "@/config/config";
import { Button } from "@/components/ui/button";

interface Certificate {
    id: string;
    image: string; // encrypted filename
    createdAt: string;
}

const UserCertificatesPage = () => {
    const [previewFilename, setPreviewFilename] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    /* ---------------- API ---------------- */
    
    const { data, isLoading } = useFetchData<{
        success: boolean;
        certificates: Certificate[];
    }>("/certificates", "user-certificates");

    const certificates = data?.certificates ?? [];

    /* ---------------- HELPERS ---------------- */

    const fetchCertificateImage = async (filename: string) => {
        try {
            setIsPreviewLoading(true);
            setPreviewUrl(null);

            const token = CookieManager.get("travodate-token");

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

    /* ---------------- RENDER ---------------- */

    return (
        <div className="container mx-auto py-10 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck size={24} className="text-primary" /> My Certificates
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : certificates.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No certificates found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {certificates.map((cert) => (
                                <div
                                    key={cert.id}
                                    className="flex items-center justify-between border rounded p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex gap-3 items-center">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <FileCheck size={20} className="text-primary" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]" title={cert.image}>
                                                Certificate
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(cert.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setPreviewFilename(cert.image)}
                                        title="View Certificate"
                                    >
                                        <Eye size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Image Preview Modal (AUTHENTICATED FETCH) */}
            <Dialog
                open={!!previewFilename}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewFilename(null);
                        setPreviewUrl(null);
                    }
                }}
            >
                <DialogContent className="max-w-3xl w-full">
                    <DialogHeader>
                        <DialogTitle>Certificate Preview</DialogTitle>
                    </DialogHeader>

                    {isPreviewLoading && (
                        <div className="flex items-center justify-center h-[300px]">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    )}

                    {!isPreviewLoading && previewUrl && (
                        <div className="bg-muted/30 rounded-lg p-2 flex justify-center">
                            <img
                                src={previewUrl}
                                alt="Certificate preview"
                                className="max-w-full max-h-[70vh] object-contain rounded shadow-sm"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserCertificatesPage;
