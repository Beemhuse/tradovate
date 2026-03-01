import { API_URL } from "@/config/config";
import { CookieManager } from "@/utils/cookie-utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useKycImage = (userId?: string, filename?: string) => {
    
  const query = useQuery({
    queryKey: ["kyc-image", userId, filename],
    enabled: Boolean(userId && filename),
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/kyc/image/${userId}/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${CookieManager.get("tradovate-token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await res.blob(); // ✅ THIS IS THE KEY
      return URL.createObjectURL(blob); // ✅ STRING
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    return () => {
      if (query.data) {
        URL.revokeObjectURL(query.data);
      }
    };
  }, [query.data]);

  return query;
};
