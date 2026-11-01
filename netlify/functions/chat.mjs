export default async (request) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is missing. Add it to your Netlify environment variables."
      );
    }

    const body = await request.json();

    const message =
      typeof body.message === "string" ? body.message : "";

    const mode = body.mode === "fix" ? "fix" : "chat";

    if (!message.trim()) {
      throw new Error("Please enter a message.");
    }

    const instructions =
      mode === "fix"
        ? "You are Junior AI, a careful coding assistant. Find errors in the user's code, provide a corrected version, and explain the important changes. Preserve the original programming language and intent."
        : "You are Junior AI, a friendly and helpful AI assistant. Answer clearly and accurately. Help with learning, ideas, questions, and programming.";

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: instructions,
          input: message
        })
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        result?.error?.message ||
        `OpenAI request failed (${response.status}).`;

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers }
      );
    }

    const reply =
      result.output_text ||
      "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ reply: reply }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Unexpected server error."
      }),
      { status: 500, headers }
    );
  }
};
