export function safeJsonParse(text) {
  if (!text) throw new Error("Empty AI response");

  const startObj = text.indexOf("{");
  const endObj = text.lastIndexOf("}");
  const startArr = text.indexOf("[");
  const endArr = text.lastIndexOf("]");

  let extracted = null;

  if (startArr !== -1 && endArr !== -1) {
    extracted = text.slice(startArr, endArr + 1);
  } else if (startObj !== -1 && endObj !== -1) {
    extracted = text.slice(startObj, endObj + 1);
  }

  if (!extracted) {
    throw new Error("No JSON found in AI response");
  }

  return JSON.parse(extracted);
}