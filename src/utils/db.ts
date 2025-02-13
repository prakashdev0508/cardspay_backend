import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model === "Transaction" && params.action === "update") {
    const transactionId = params.args.where.id;

    // Fetch previous state of the transaction
    const previousTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!previousTransaction) {
      return next(params);
    }

    const updatedTransaction = params.args.data;
    let history: any[] = Array.isArray(previousTransaction.transactionHistory)
      ? previousTransaction.transactionHistory
      : [];

    const updatedBy = updatedTransaction.lastUpdatedBy || "system";

    (
      Object.keys(updatedTransaction) as Array<keyof typeof previousTransaction>
    ).forEach((field) => {
      if (
        field !== "updatedAt" &&
        field !== "transactionHistory" &&
        field !== "lastUpdatedBy" &&
        previousTransaction[field] !== updatedTransaction[field]
      ) {
        history.push({
          field,
          old_value: previousTransaction[field],
          new_value: updatedTransaction[field],
          updated_by: updatedBy, // Set from verifyToken middleware
          updated_at: new Date().toISOString(),
        });
      }
    });

    if (history.length > 0) {
      params.args.data.transactionHistory = history;
    }
  }

  return next(params);
});
