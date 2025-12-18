// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/contexts/AuthContext";

// export interface KYCDocument {
//   id: string;
//   user_id: string;
//   document_type: string;
//   document_url: string;
//   status: string;
//   rejection_reason: string | null;
//   reviewed_by: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export const useUserKYC = () => {
//   const { user } = useAuth();

//   return useQuery({
//     queryKey: ["kyc", user?.id],
//     queryFn: async () => {
//       if (!user) return [];
//       const { data, error } = await supabase
//         .from("kyc_documents")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data as KYCDocument[];
//     },
//     enabled: !!user,
//   });
// };

// export const useAllKYC = () => {
//   return useQuery({
//     queryKey: ["all-kyc"],
//     queryFn: async () => {
//       // First get all KYC documents
//       const { data: kycData, error: kycError } = await supabase
//         .from("kyc_documents")
//         .select("*")
//         .order("created_at", { ascending: false });
//       if (kycError) throw kycError;

//       // Get all user profiles
//       const { data: profiles, error: profilesError } = await supabase
//         .from("profiles")
//         .select("user_id, full_name, email");
//       if (profilesError) throw profilesError;

//       // Join manually
//       return kycData.map((doc) => ({
//         ...doc,
//         profiles: profiles.find((p) => p.user_id === doc.user_id) || null,
//       }));
//     },
//   });
// };

// export const useSubmitKYC = () => {
//   const { user } = useAuth();
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ documentType, file }: { documentType: string; file: File }) => {
//       if (!user) throw new Error("No user");

//       // Upload file to storage
//       const filePath = `${user.id}/${Date.now()}-${file.name}`;
//       const { error: uploadError } = await supabase.storage
//         .from("kyc-documents")
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       // Get public URL
//       const { data: urlData } = supabase.storage
//         .from("kyc-documents")
//         .getPublicUrl(filePath);

//       // Insert KYC document record
//       const { error } = await supabase.from("kyc_documents").insert({
//         user_id: user.id,
//         document_type: documentType,
//         document_url: urlData.publicUrl,
//         status: "pending",
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["kyc"] });
//     },
//   });
// };

// export const useUpdateKYCStatus = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       id,
//       status,
//       rejectionReason,
//       reviewedBy,
//     }: {
//       id: string;
//       status: "approved" | "rejected";
//       rejectionReason?: string;
//       reviewedBy: string;
//     }) => {
//       const { error } = await supabase
//         .from("kyc_documents")
//         .update({
//           status,
//           rejection_reason: rejectionReason || null,
//           reviewed_by: reviewedBy,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", id);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["all-kyc"] });
//     },
//   });
// };



import { useState } from "react";

interface KycItem {
  kycType: string;
  file: File;
  previewUrl: string;
}

export default function useKyc() {
  const [kycList, setKycList] = useState<KycItem[]>([]);

  // Function that updates or adds a new kyc item
  function updateKyc(kycType: string, file: File) {
    const previewUrl = URL.createObjectURL(file);

    setKycList(prevList => {
      const existingIndex = prevList.findIndex(item => item.kycType === kycType);

      // If kycType already exists → update file + preview
      if (existingIndex !== -1) {
        const updated = [...prevList];
        updated[existingIndex] = {
          kycType,
          file,
          previewUrl,
        };
        return updated;
      }

      // Else → add new item
      return [
        ...prevList,
        {
          kycType,
          file,
          previewUrl,
        },
      ];
    });
  }

  return {
    kycList,
    updateKyc,
  };
}

