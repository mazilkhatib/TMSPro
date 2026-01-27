"use client";

import { useMutation } from "@apollo/client/react";
import { FLAG_SHIPMENT } from "@/graphql/mutations";
import { GET_SHIPMENTS } from "@/graphql/queries";
import { Button } from "@/components/ui/button";
import { Flag, FlagOff } from "lucide-react";

interface FlagButtonProps {
  shipmentId: string;
  isFlagged: boolean;
  onRefetch?: () => void;
}

export function FlagButton({ shipmentId, isFlagged, onRefetch }: FlagButtonProps) {
  const [flagShipment, { loading }] = useMutation(FLAG_SHIPMENT, {
    refetchQueries: [{ query: GET_SHIPMENTS }],
    awaitRefetchQueries: true,
  });

  const handleToggleFlag = async () => {
    try {
      await flagShipment({
        variables: {
          id: shipmentId,
          flagged: !isFlagged,
        },
      });
      onRefetch?.();
    } catch (error) {
      console.error("Error toggling flag:", error);
    }
  };

  return (
    <Button
      variant={isFlagged ? "destructive" : "outline"}
      size="sm"
      onClick={handleToggleFlag}
      disabled={loading}
      className="gap-2"
    >
      {isFlagged ? (
        <>
          <FlagOff className="h-4 w-4" />
          Unflag
        </>
      ) : (
        <>
          <Flag className="h-4 w-4" />
          Flag
        </>
      )}
    </Button>
  );
}
