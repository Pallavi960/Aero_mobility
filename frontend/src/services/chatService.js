import { API } from "../constants/appConstants";

/**
 * Sends a chat prompt and real AeroMobility context to the backend /api/chat endpoint.
 *
 * @param {string} message - User's query.
 * @param {object} context - Current AeroMobility journey, route, AQI, weather, and profile telemetry.
 * @param {Array} history - Short recent conversation history for follow-up questions.
 * @returns {Promise<{success: boolean, reply: string}>}
 */
export async function sendChatMessage(message, context = {}, history = []) {
  try {
    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        context,
        history,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      reply: data.reply || "I couldn't retrieve an answer right now. Please try again.",
    };
  } catch (err) {
    console.error("AeroMobility Assistant API communication error:", err);
    return {
      success: false,
      reply: "Sorry, I couldn't connect to the assistant right now. Please try again.",
    };
  }
}
