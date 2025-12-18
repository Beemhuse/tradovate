// components/coin-management/CoinTabs.tsx

interface CoinTabsProps {
  activeTab: "active" | "inactive";
  onTabChange: (tab: "active" | "inactive") => void;
}

const CoinTabs = ({ activeTab, onTabChange }: CoinTabsProps) => {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="tablist" aria-label="Coin tabs">
      <button
        className={`px-3 py-2 rounded ${
          activeTab === "active"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
        onClick={() => onTabChange("active")}
        role="tab"
        aria-selected={activeTab === "active"}
      >
        Active
      </button>
      <button
        className={`px-3 py-2 rounded ${
          activeTab === "inactive"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
        onClick={() => onTabChange("inactive")}
        role="tab"
        aria-selected={activeTab === "inactive"}
      >
        Inactive
      </button>
    </div>
  );
};

export default CoinTabs;