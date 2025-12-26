import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/config/api";

const CoinDetail: React.FC = () => {
  const { id } = useParams();

  const { data: coin, isLoading, error } = useQuery([
    "coin",
    id,
  ], async () => {
    if (!id) return null;
    return fetchData(`/market/coins/${id}`);
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading coin</div>;
  if (!coin) return <div>Coin not found</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{coin.name} ({coin.symbol})</h1>
        {coin.iconUrl && (
          <img src={coin.iconUrl} alt={coin.symbol} className="w-12 h-12" />
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Networks & Deposit QR</h2>
        <div className="grid grid-cols-1 gap-4">
          {coin.networks?.map((n: any) => (
            <div key={n.id} className="p-3 border rounded">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{n.network?.name}</div>
                  <div className="text-sm text-muted-foreground">{n.contractAddress}</div>
                </div>
                {n.qrCode && (
                  <img src={n.qrCode} alt="qr" className="w-28 h-28" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;
