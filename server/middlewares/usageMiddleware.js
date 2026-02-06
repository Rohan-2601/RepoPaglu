import { User } from "../model/user.model.js";

export const checkDailyUsage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if it's a new day
    if (user.usage.date !== today) {
      user.usage.date = today;
      user.usage.count = 0;
    }

    // Check limit
    if (user.usage.count >= 5) {
      return res.status(403).json({
        error: "Daily limit reached. You can only use this feature 5 times per day.",
      });
    }

    // Increment and save
    user.usage.count += 1;
    await user.save();

    next();
  } catch (err) {
    console.error("Usage Check Error:", err);
    return res.status(500).json({ error: "Server error during usage check." });
  }
};
