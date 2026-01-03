import { useMemo } from "react";
import UplotReact from "react-uplot";
import "uplot/dist/uPlot.min.css";

type Props = {
  prices?: number[];
  positive: boolean;
};

const MiniSparkline = ({ prices = [], positive }: Props) => {
  const data = useMemo(() => {
    if (prices.length < 2) return null;

    return [
      prices.map((_, i) => i), // x-axis (index)
      prices,                 // y-axis (price)
    ];
  }, [prices]);

  if (!data) return <div className="h-10 w-full" />;

  return (
    <div className="h-10 w-full">
      <UplotReact
        options={{
          width: 120,
          height: 40,
          scales: {
            x: { time: false },
          },
          axes: [], // hide axes
          series: [
            {},
            {
              stroke: positive ? "#22c55e" : "#ef4444",
              width: 2,
            },
          ],
          cursor: {
            show: false,
          },
        }}
        data={data}
      />
    </div>
  );
};

export default MiniSparkline;
