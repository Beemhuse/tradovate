export type CoinGeckoCoin = {
    name: string;
    market_cap: number;
    symbol: string;
    image: string;
    id: string;
};

export async function getCoins(): Promise<CoinGeckoCoin[]> {
    try {
        const response: Response = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch coins data");
        }

        const data = await response.json();
        const coins: CoinGeckoCoin[] = data.map((coin: any) => ({
            name: coin?.name,
            market_cap: coin?.market_cap,
            symbol: coin?.symbol,
            image: coin?.image,
            id: coin?.id,
        }));
        return coins;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching coins:", error.message);
        } else {
            console.error("Unknown error fetching coins");
        }
        return [];
    }
}