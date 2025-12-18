// components/coin-management/DeleteConfirmationModal.tsx - Enhanced version
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, AlertCircle, Link, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  hasNetworks?: boolean;
  networkCount?: number;
  isLoading?: boolean;
}

const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete the item.",
  itemName,
  hasNetworks = false,
  networkCount = 0,
  isLoading = false,
}: DeleteConfirmationModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>{description}</p>
            
            {itemName && (
              <div className="p-3 bg-muted rounded-md">
                <span className="font-semibold">{itemName}</span>
              </div>
            )}

            {hasNetworks && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Warning</span>
                </div>
                <p className="text-sm">
                  This coin is linked to {networkCount} network{networkCount !== 1 ? 's' : ''}. 
                  Deleting it will also remove all network associations.
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Network className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Network links will be permanently removed
                  </span>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Anyway"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;