"use client";

import { useMutation } from "@apollo/client/react";
import { DELETE_SHIPMENT } from "@/graphql/mutations";
import { GET_SHIPMENTS } from "@/graphql/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  shipmentNumber: string;
  onSuccess?: () => void;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  shipmentId,
  shipmentNumber,
  onSuccess,
}: DeleteConfirmationProps) {
  const [deleteShipment, { loading }] = useMutation(DELETE_SHIPMENT, {
    refetchQueries: [{ query: GET_SHIPMENTS }],
    awaitRefetchQueries: true,
  });

  const handleDelete = async () => {
    try {
      await deleteShipment({
        variables: { id: shipmentId },
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting shipment:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[200]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg">Delete Shipment</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete shipment <strong>{shipmentNumber}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Shipment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
