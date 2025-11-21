import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expired premium memberships every hour
crons.interval(
  "check premium expiration",
  { hours: 1 },
  internal.users.checkPremiumExpiration,
  {},
);

export default crons;
