import { NextFunction, Response } from "express";
import { CustomRequest } from "../types.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { response } from "../utils/responseTemplate.js";
import { accountModel } from "../accounts/accounts.model.js";
import { transactionModel } from "../transactions/transaction.model.js";
function getMonthRange(year: number, month: number) {
  // month is 0-indexed (0 = Jan) — consistent with JS Date API
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0)); // exclusive upper bound
  return { start, end };
}
function getYearRange(year: number) {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1)); // exclusive
  return { start, end };
}
export const getDashboardSummary = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getUTCFullYear();
    const month =
      (parseInt(req.query.month as string) || now.getUTCMonth() + 1) - 1;
    const userId = req.user._id;
    const { start: curStart, end: curEnd } = getMonthRange(year, month);
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const { start: prevStart, end: prevEnd } = getMonthRange(
      prevYear,
      prevMonth,
    );
    const balanceResult = await accountModel.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: "$balance" } } }, // we use null here because we do not want to group according something just give the toal of matched documents.
    ]);
    const totalBalance = balanceResult?.[0]?.total ?? 0;
    const currentMonthStats = await transactionModel.aggregate([
      {
        $match: {
          userId: userId,
          status: "COMPLETED",
          transactionDate: { $gte: curStart, $lt: curEnd },
        },
      },
      {
        $facet: {
          income: [
            { $match: { type: "INCOME" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          expense: [
            { $match: { type: "EXPENSE" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
    ]);
    const curIncome = currentMonthStats?.[0]?.income?.[0]?.total ?? 0;
    const curExpenses = currentMonthStats?.[0]?.expense?.[0]?.total ?? 0;
    const curSavings = curIncome - curExpenses;
    //Previous month stats for % change calculation
    const prevMonthStats = await transactionModel.aggregate([
      {
        $match: {
          userId: userId,
          status: "COMPLETED",
          transactionDate: { $gte: prevStart, $lt: prevEnd },
        },
      },
      {
        $facet: {
          income: [
            { $match: { type: "INCOME" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
          expenses: [
            { $match: { type: "EXPENSE" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
    ]);

    const prevIncome = prevMonthStats?.[0]?.income?.[0]?.total ?? 0;
    const prevExpenses = prevMonthStats?.[0]?.expenses?.[0]?.total ?? 0;
    const prevSavings = prevIncome - prevExpenses;
    const pctChange = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100 * 10) / 10; // 1 decimal
    };
    const { start: yearStart, end: yearEnd } = getYearRange(year);
    const monthlyTrend = await transactionModel.aggregate([
      {
        $match: {
          userId: userId,
          status: "COMPLETED",
          transactionDate: { $gte: yearStart, $lt: yearEnd },
        },
      },
      {
        // $group by month number + type
        // _id has two fields so each bucket = unique (month, type) combo
        $group: {
          _id: {
            month: { $month: "$transactionDate" }, // 1–12
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);
    const monthlyMap: Record<number, { income: number; expenses: number }> = {};
    for (let m = 1; m <= 12; m++) monthlyMap[m] = { income: 0, expenses: 0 };
    for (const row of monthlyTrend) {
      const m = row._id.month;
      if (row._id.type === "INCOME") monthlyMap[m].income = row.total;
      else monthlyMap[m].expenses = row.total;
    }
    const monthlyChartData = Object.entries(monthlyMap).map(([m, v]) => ({
      month: parseInt(m),
      income: v.income,
      expenses: v.expenses,
    }));
    const spendingByCategory = await transactionModel.aggregate([
      {
        $match: {
          userId: userId,
          type: "EXPENSE",
          status: "COMPLETED",
          transactionDate: { $gte: curStart, $lt: curEnd },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } }, // largest slice first
      {
        // Rename _id → category for cleaner frontend consumption
        $project: { _id: 0, category: "$_id", total: 1 },
      },
    ]);
    res.status(200).json(
      response(true, "Dashboard summary fetched successfully", {
        totalBalance,
        currentMonth: {
          income: curIncome,
          expenses: curExpenses,
          savings: curSavings,
        },
        changes: {
          // Positive = increase, negative = decrease vs last month
          income: pctChange(curIncome, prevIncome),
          expenses: pctChange(curExpenses, prevExpenses),
          savings: pctChange(curSavings, prevSavings),
          // Balance change: compare current total balance to... we don't have
          // last-month balance snapshot so we approximate via savings delta
          balance: pctChange(
            totalBalance,
            totalBalance - (curSavings - prevSavings),
          ),
        },
        monthlyChart: monthlyChartData, // 12 items, for bar chart
        spendingByCategory, // N items, for donut chart
      }),
    );
  },
);
