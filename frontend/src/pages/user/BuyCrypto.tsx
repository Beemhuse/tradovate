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
        logo: "/exchanges/transak.png",
        url: "https://global.transak.com/",
        description: "Buy crypto with card, bank transfer or local payment methods",
    },
    {
        id: "paybis",
        name: "Paybis",
        logo: "/exchanges/paybis.png",
        url: "https://paybis.com/",
        description: "Buy Bitcoin and other cryptocurrencies with credit card",
    },
    {
        id: "binance",
        name: "Binance",
        logo: "/exchanges/binance.png",
        url: "https://www.binance.com/en/buy-sell-crypto",
        description: "The world's largest crypto exchange",
    },
    {
        id: "huobi",
        name: "Huobi (HTX)",
        logo: "/exchanges/huobi.png",
        url: "https://www.htx.com/en-us/buy-crypto",
        description: "Buy crypto with 0 fees",
    },
    {
        id: "kraken",
        name: "Kraken",
        logo: "/exchanges/kraken.png",
        url: "https://www.kraken.com/buy-crypto",
        description: "Buy bitcoin & crypto instantly",
    },
    {
        id: "ramp",
        name: "Ramp",
        logo: "/exchanges/ramp.png",
        url: "https://ramp.network/buy",
        description: "Fast, secure crypto on-ramp",
    },
    {
        id: "banxa",
        name: "Banxa",
        logo: "/exchanges/banx.png",
        url: "https://banxa.com/",
        description: "Fiat-to-crypto gateway",
    },
    {
        id: "simplex",
        name: "Simplex",
        logo: "/exchanges/simplex.png",
        url: "https://www.simplex.com/buy-crypto",
        description: "Fraudless payment processing",
    },
    {
        id: "crypto_com",
        name: "Crypto.com",
        logo: "/exchanges/crypto.png",
        url: "https://crypto.com/exchange",
        description: "The world's fastest growing crypto app",
    },
    {
        id: "coinbase",
        name: "Coinbase",
        logo: "/exchanges/coinbase.png",
        url: "https://www.coinbase.com/buy-crypto",
        description: "Buy & sell crypto",
    },
    {
        id: "okex",
        name: "OKX",
        logo: "/exchanges/okex.png",
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
        <div className="bg-background text-foreground">

            <div className="container mx-auto px-4 py-8">
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
                <div className="">
                    {filteredExchanges.length > 0 ? (
                        filteredExchanges.map((exchange) => (
                            <a
                                key={exchange.id}
                                href={exchange.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                            >
                                <Card className="transition-all duration-300 border-0 border-t-2 border-t-card bg-transparent hover:bg-card hover:border-t-2 hover:border-t-primary/40 rounded-none">
                                    <CardContent className="flex items-center justify-between p-4 sm:p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-fit flex items-center justify-center shrink-0">
                                                <img src={exchange.logo} alt={exchange.name} className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
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
