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

    setKycList((prevList) => {
      const existingIndex = prevList.findIndex(
        (item) => item.kycType === kycType
      );

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
