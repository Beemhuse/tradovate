import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, ChevronRight } from "lucide-react";

interface Exchange {
    id: string;
    name: string;
    logo: string; // URL or path to logo
    url: string;
    description?: string;
}

const exchanges: Exchange[] = [
    {
        id: "transak",
        name: "Transak",
        logo: "/images/exchanges/transak.png", // Placeholder path
        url: "https://global.transak.com/",
        description: "Buy crypto with card, bank transfer or local payment methods",
    },
    {
        id: "paybis",
        name: "Paybis",
        logo: "/images/exchanges/paybis.png",
        url: "https://paybis.com/",
        description: "Buy Bitcoin and other cryptocurrencies with credit card",
    },
    {
        id: "binance",
        name: "Binance",
        logo: "/images/exchanges/binance.png",
        url: "https://www.binance.com/en/buy-sell-crypto",
        description: "The world's largest crypto exchange",
    },
    {
        id: "huobi",
        name: "Huobi (HTX)",
        logo: "/images/exchanges/huobi.png",
        url: "https://www.htx.com/en-us/buy-crypto",
        description: "Buy crypto with 0 fees",
    },
    {
        id: "kraken",
        name: "Kraken",
        logo: "/images/exchanges/kraken.png",
        url: "https://www.kraken.com/buy-crypto",
        description: "Buy bitcoin & crypto instantly",
    },
    {
        id: "ramp",
        name: "Ramp",
        logo: "/images/exchanges/ramp.png",
        url: "https://ramp.network/buy",
        description: "Fast, secure crypto on-ramp",
    },
    {
        id: "banxa",
        name: "Banxa",
        logo: "/images/exchanges/banxa.png",
        url: "https://banxa.com/",
        description: "Fiat-to-crypto gateway",
    },
    {
        id: "simplex",
        name: "Simplex",
        logo: "/images/exchanges/simplex.png",
        url: "https://www.simplex.com/buy-crypto",
        description: "Fraudless payment processing",
    },
    {
        id: "crypto_com",
        name: "Crypto.com",
        logo: "/images/exchanges/crypto_com.png",
        url: "https://crypto.com/exchange",
        description: "The world's fastest growing crypto app",
    },
    {
        id: "coinbase",
        name: "Coinbase",
        logo: "/images/exchanges/coinbase.png",
        url: "https://www.coinbase.com/buy-crypto",
        description: "Buy & sell crypto",
    },
    {
        id: "okex",
        name: "OKX",
        logo: "/images/exchanges/okx.png",
        url: "https://www.okx.com/buy-crypto",
        description: "One-stop crypto exchange",
    },
];

const BuyCrypto = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredExchanges = exchanges.filter((exchange) =>
        exchange.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground">

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Buy Crypto</h1>
                    <p className="text-muted-foreground">Select an exchange to purchase cryptocurrency securely.</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        className="pl-10 h-12 bg-card/50 border-input"
                        placeholder="Search Cryptocurrencies or Exchanges"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Exchange List */}
                <div className="space-y-3">
                    {filteredExchanges.length > 0 ? (
                        filteredExchanges.map((exchange) => (
                            <a
                                key={exchange.id}
                                href={exchange.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                            >
                                <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:bg-accent/5">
                                    <CardContent className="flex items-center justify-between p-4 sm:p-6">
                                        <div className="flex items-center gap-4">
                                            {/* Logo Placeholder - In a real app, use <img src={exchange.logo} /> */}
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                                {/* Render actual image if available, else first letter */}
                                                {/* <img src={exchange.logo} alt={exchange.name} className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} /> */}
                                                <span className="font-bold text-lg text-primary">{exchange.name.substring(0, 1)}</span>
                                            </div>

                                            <div className="flex flex-col">
                                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{exchange.name}</h3>
                                                {/* <p className="text-sm text-muted-foreground hidden sm:block">{exchange.description}</p> */}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                            <span className="font-medium">Buy</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No exchanges found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyCrypto;
