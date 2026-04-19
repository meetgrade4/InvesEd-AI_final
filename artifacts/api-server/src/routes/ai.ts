import { Router } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const aiRouter = Router();

aiRouter.post("/ai/chat", async (req, res) => {
  const { messages, userContext } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    userContext?: {
      riskProfile?: { type: string; label: string; score: number };
      holdings?: { ticker: string; type: string; percentReturn: number; currentValue: number; sector?: string }[];
      watchlist?: string[];
      completedModules?: string[];
      totalReturn?: number;
      portfolioValue?: number;
      xp?: number;
      level?: number;
    };
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const buildSystemPrompt = () => {
    let prompt = `You are InvesEd AI Coach — a smart, friendly investing advisor for teenagers (ages 13–18) learning about the Indian stock market. You work inside the InvesEd app which teaches financial literacy through gamification.

Your personality:
- Clear, encouraging, and educational — never condescending
- Use simple language with relatable examples
- Ground every answer in Indian markets (NSE/BSE, INR, SEBI regulations, Indian tax laws like 80C, LTCG)
- You know about: stocks, mutual funds, SIP, PMS, FDs, NSC, P/E ratio, CAGR, diversification, risk management, market cycles, behavioural finance, portfolio construction
- When asked complex questions, break them down step by step
- You can discuss global markets too when relevant to India
- Use ₹ symbol for Indian currency amounts
- Keep responses concise but complete — use **bold** for key terms and bullet points for lists
- Be honest about risk — don't over-hype any investment
- Never provide financial advice as a licensed advisor — frame as education

`;

    if (userContext) {
      prompt += `\n=== THIS USER'S INVESTMENT PROFILE ===\n`;

      if (userContext.riskProfile) {
        prompt += `Risk Profile: ${userContext.riskProfile.label} (${userContext.riskProfile.type}) — Score: ${userContext.riskProfile.score}/10\n`;
      }

      if (userContext.level !== undefined) {
        prompt += `Learning Level: ${userContext.level} | XP earned: ${userContext.xp}\n`;
      }

      if (userContext.portfolioValue !== undefined) {
        prompt += `Virtual Portfolio Value: ₹${userContext.portfolioValue.toLocaleString("en-IN")}\n`;
      }

      if (userContext.totalReturn !== undefined) {
        prompt += `Total Portfolio Return: ${userContext.totalReturn >= 0 ? "+" : ""}${userContext.totalReturn.toFixed(2)}%\n`;
      }

      if (userContext.holdings && userContext.holdings.length > 0) {
        prompt += `\nCurrent Holdings:\n`;
        userContext.holdings.forEach((h) => {
          const returnStr = h.percentReturn >= 0 ? `+${h.percentReturn.toFixed(1)}%` : `${h.percentReturn.toFixed(1)}%`;
          prompt += `  - ${h.ticker} (${h.type === "stock" ? "Stock" : "Mutual Fund"}${h.sector ? `, ${h.sector}` : ""}) — ₹${h.currentValue.toLocaleString("en-IN")} | ${returnStr} return\n`;
        });
      }

      if (userContext.watchlist && userContext.watchlist.length > 0) {
        prompt += `\nWatchlist (Starred items): ${userContext.watchlist.join(", ")}\n`;
      }

      if (userContext.completedModules && userContext.completedModules.length > 0) {
        prompt += `\nCompleted Academy Modules: ${userContext.completedModules.join(", ")}\n`;
      }

      prompt += `\nIMPORTANT: When the user asks about their portfolio, performance, holdings, watchlist, or anything about "my" investments — reference the profile data above to give personalised insights. If they haven't invested yet, encourage them to start in the Simulator.`;
    }

    return prompt;
  };

  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    res.status(503).json({ error: "AI integration not configured" });
    return;
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      ...messages.slice(-20),
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

export default aiRouter;
