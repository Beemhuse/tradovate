// emails/AdminTradePlaced.tsx
type Props = {
  orderId: string;
  userId: string;
  pair: string;
  direction: string;
  stake: number;
  period: string;
  expiresAt: Date;
};

export const AdminTradePlacedEmail = ({
  orderId,
  userId,
  pair,
  direction,
  stake,
  period,
  expiresAt,
}: Props) => `
  <div style="font-family: Arial, sans-serif; background:#0f172a; padding:24px; color:#e5e7eb;">
    <div style="max-width:600px; margin:auto; background:#020617; border-radius:8px; padding:24px;">
      <h2 style="color:#38bdf8;">📈 New Trade Placed</h2>

      <p style="margin:16px 0;">
        A new trade has just been placed on the platform.
      </p>

      <table style="width:100%; border-collapse:collapse;">
        <tr><td>Order ID</td><td>${orderId}</td></tr>
        <tr><td>User ID</td><td>${userId}</td></tr>
        <tr><td>Pair</td><td>${pair}</td></tr>
        <tr><td>Direction</td><td><b>${direction}</b></td></tr>
        <tr><td>Stake</td><td>${stake} USDT</td></tr>
        <tr><td>Period</td><td>${period}</td></tr>
        <tr><td>Expires At</td><td>${expiresAt.toUTCString()}</td></tr>
      </table>

      <p style="margin-top:24px; font-size:12px; color:#94a3b8;">
        Trading Engine · Automated Notification
      </p>
    </div>
  </div>
`;
