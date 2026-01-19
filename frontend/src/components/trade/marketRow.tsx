type Props = {
  pair: any;
  live?: {
    price: number;
    change: number;
  };
  history?: number[];
  onClick: () => void;
};

const MarketRow = ({ pair, live, history, onClick }: Props) => {
  const isPositive = (live?.change ?? 0) >= 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-lg bg-[#2e3336] hover:bg-[#3a3f42] cursor-pointer"
    >
      {/* Left */}
      <div className="flex items-center gap-3 w-[35%]">
        <img
          src={pair.baseCoin.iconUrl}
          className="w-8 h-8 rounded-full"
          alt={pair.baseCoin.symbol}
        />
        <div>
          <p className="text-white font-medium">{pair.baseCoin.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{pair.symbol}</p>
            {pair.network && (
              <>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-primary font-medium">
                  {pair.network.name} ({pair.network.type || "Mainnet"})
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {/* <div className="w-[30%]">
        <MiniSparkline
          prices={history}
          positive={isPositive}
        />
      </div> */}

      {/* Right */}
      <div className="text-right w-[25%]">
        <p className="text-white font-medium">
          ${live?.price?.toFixed(4) ?? "--"}
        </p>
        <p
          className={`text-sm ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {live?.change?.toFixed(2) ?? "--"}% 24Hrs
        </p>
      </div>
    </div>
  );
};

export default MarketRow;
