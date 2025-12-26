import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
  studies?: string[];
  hideSideToolbar?: boolean;
  hideVolume?: boolean;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewChart = ({
  symbol = "BTCUSDT",
  height = 500,
  studies = ["STD;SMA"],
  hideSideToolbar = false,
  hideVolume = false
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}`,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          hide_side_toolbar: hideSideToolbar,
          allow_symbol_change: true,
          container_id: containerRef.current?.id || "tradingview_chart",
          studies: studies,
          hide_volume: hideVolume,
          height: height ? height : "100%",
        });
      }
    };

    if (!document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      document.head.appendChild(script);
    } else if (window.TradingView) {
      new window.TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}`,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#0a0a0a",
        enable_publishing: false,
        hide_side_toolbar: hideSideToolbar,
        allow_symbol_change: true,
        container_id: containerRef.current?.id || "tradingview_chart",
        studies: studies,
        hide_volume: hideVolume,
        height: height ? height : "100%",
      });
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, height]);

  return (
    <div
      ref={containerRef}
      id={`tradingview_${symbol}_${Date.now()}`}
      style={{ height: height ? `${height}px` : "100%" }}
      className="w-full"
    />
  );
};

export default TradingViewChart;
