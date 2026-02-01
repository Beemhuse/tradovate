import { Resend } from "resend";
import dotenv from "dotenv";
import { AdminTradePlacedEmail } from "../email/adminTradePlace";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY); // must be set in env
export const sendAdminTradeMail = async (order: any) => {
  await resend.emails.send({
    from: "Trading Engine <no-reply@tradovatefutures.com>",
    to: [process.env.ADMIN_EMAIL!],
    subject: "📊 New Trade Placed",
    html: AdminTradePlacedEmail({
      orderId: order.id,
      userId: order.userId,
      pair: order.marketPairId,
      direction: order.direction,
      stake: order.stake,
      period: order.tradeConfig?.period ?? "N/A",
      expiresAt: order.expiresAt,
    }),
  });
};
