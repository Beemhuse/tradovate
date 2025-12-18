import React from "react";

export type KycStatus = "PENDING" | "REJECTED" | "APPROVED";

type Props = {
  status: KycStatus | string | null | undefined;
};

const getClasses = (status?: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-success/10 text-success";
    case "REJECTED":
      return "bg-danger/10 text-danger";
    case "PENDING":
    default:
      return "bg-primary/10 text-primary";
  }
};

const getLabel = (status?: string) => {
  if (!status) return "UNKNOWN";
  return status.toUpperCase();
};

const KycBadge: React.FC<Props> = ({ status }) => {
  const classes = getClasses(status);
  const label = getLabel(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}
      role="status"
      aria-label={`KYC status: ${label}`}
    >
      {label}
    </span>
  );
};

export default KycBadge;
export type { KycStatus };
