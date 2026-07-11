const Household = require("../models/Household");
const Rule = require("../models/Rule");
const PointLog = require("../models/PointLog");

// Called every time a household disposes at a bin
const checkAndAwardPoints = async (household) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const lastDate = household.streak.lastDisposalDate
    ? new Date(
        household.streak.lastDisposalDate.getFullYear(),
        household.streak.lastDisposalDate.getMonth(),
        household.streak.lastDisposalDate.getDate()
      )
    : null;

  const awarded = [];

  // ── Update consecutive streak ──────────────────────────────────────────────
  if (!lastDate) {
    // First ever disposal
    household.streak.currentStreak = 1;
  } else {
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already disposed today — don't increment streak or re-award
      return awarded;
    } else if (diffDays === 1) {
      // Consecutive day
      household.streak.currentStreak += 1;
    } else {
      // Streak broken — reset
      household.streak.currentStreak = 1;
      household.streak.awardedStreaks = []; // reset awarded streaks so they can earn again
    }
  }

  household.streak.lastDisposalDate = now;
  const currentStreak = household.streak.currentStreak;

  // ── Fetch all auto rules ───────────────────────────────────────────────────
  const autoRules = await Rule.find({ auto: true });

  for (const rule of autoRules) {
    const points = parseInt(rule.points) || 0;

    // ── Per Streak rules ────────────────────────────────────────────────────
    if (rule.freq === "per streak" && rule.streakDays) {
      const alreadyAwarded = household.streak.awardedStreaks.includes(rule.streakDays);

      if (currentStreak >= rule.streakDays && !alreadyAwarded) {
        household.points.total += points;
        household.points.thisMonth += points;
        household.streak.awardedStreaks.push(rule.streakDays);

        await PointLog.create({
          household: household._id,
          rule: rule._id,
          points,
          reason: `${rule.streakDays}-day streak achieved — ${rule.name}`,
        });

        awarded.push({ rule: rule.name, points, reason: `${rule.streakDays}-day streak` });
      }
    }

    // ── Weekly rules (every 7 days) ─────────────────────────────────────────
    if (rule.freq === "Weekly") {
      const lastWeekly = household.streak.lastWeeklyAward;
      const daysSinceWeekly = lastWeekly
        ? Math.floor((today - new Date(lastWeekly)) / (1000 * 60 * 60 * 24))
        : 999;

      if (currentStreak >= 7 && daysSinceWeekly >= 7) {
        household.points.total += points;
        household.points.thisMonth += points;
        household.streak.lastWeeklyAward = now;

        await PointLog.create({
          household: household._id,
          rule: rule._id,
          points,
          reason: `Weekly consistency streak — ${rule.name}`,
        });

        awarded.push({ rule: rule.name, points, reason: "Weekly streak" });
      }
    }

    // ── Monthly rules (every 30 days) ───────────────────────────────────────
    if (rule.freq === "Monthly") {
      const lastMonthly = household.streak.lastMonthlyAward;
      const daysSinceMonthly = lastMonthly
        ? Math.floor((today - new Date(lastMonthly)) / (1000 * 60 * 60 * 24))
        : 999;

      if (currentStreak >= 30 && daysSinceMonthly >= 30) {
        household.points.total += points;
        household.points.thisMonth += points;
        household.streak.lastMonthlyAward = now;

        await PointLog.create({
          household: household._id,
          rule: rule._id,
          points,
          reason: `Monthly consistency streak — ${rule.name}`,
        });

        awarded.push({ rule: rule.name, points, reason: "Monthly streak" });
      }
    }
  }

  await household.save();
  return awarded;
};

module.exports = { checkAndAwardPoints };