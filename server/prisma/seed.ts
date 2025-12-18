import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  const coins = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
      networks: ["Bitcoin", "BEP20"],
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      networks: ["ERC20", "BEP20"],
    },
    {
      symbol: "USDT",
      name: "Tether",
      iconUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png",
      networks: ["TRC20", "ERC20", "BEP20", "SOL"],
    },
    {
      symbol: "BNB",
      name: "BNB",
      iconUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
      networks: ["BEP20", "BEP2"],
    },
    {
      symbol: "XRP",
      name: "XRP",
      iconUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
      networks: ["Ripple", "BEP20"],
    },
    {
      symbol: "DOGE",
      name: "Dogecoin",
      iconUrl: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
      networks: ["Dogecoin", "BEP20"],
    },
    {
      symbol: "LTC",
      name: "Litecoin",
      iconUrl: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
      networks: ["Litecoin", "BEP20"],
    },
    {
      symbol: "TRX",
      name: "TRON",
      iconUrl: "https://cryptologos.cc/logos/tron-trx-logo.png",
      networks: ["TRC20", "BEP20"],
    },
    {
      symbol: "BCH",
      name: "Bitcoin Cash",
      iconUrl: "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png",
      networks: ["Bitcoin Cash", "BEP20"],
    },
    {
      symbol: "FIL",
      name: "Filecoin",
      iconUrl: "https://cryptologos.cc/logos/filecoin-fil-logo.png",
      networks: ["Filecoin", "BEP20"],
    },
  ];

  for (const c of coins) {
    const coin = await prisma.coin.upsert({
      where: { symbol: c.symbol },
      update: {},
      create: {
        symbol: c.symbol,
        name: c.name,
        iconUrl: c.iconUrl,
        isActive: true,
      },
    });

    console.log(`Upserted Coin: ${coin.symbol}`);

    for (const netName of c.networks) {
      // Find or create network
      // Note: In a real app, networks might be a separate master list.
      // Here we assume name is unique enough or we just findFirst.
      let network = await prisma.network.findFirst({
        where: { name: netName },
      });
      if (!network) {
        network = await prisma.network.create({
          data: { name: netName, type: netName },
        });
        console.log(`  Created Network: ${network.name}`);
      }

      // Link
      await prisma.coinNetwork.upsert({
        where: {
          coinId_networkId: {
            coinId: coin.id,
            networkId: network.id,
          },
        },
        update: {},
        create: {
          coinId: coin.id,
          networkId: network.id,
          contractAddress: `0xMock${c.symbol}${netName}Contract...`,
        },
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
