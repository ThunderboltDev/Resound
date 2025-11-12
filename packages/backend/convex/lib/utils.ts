export async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  async function listGoogleModels() {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await resp.json();
    return data;
  }

  listGoogleModels()
    .then((models) => {
      console.log("Available Google models:", models);
    })
    .catch((err) => {
      console.error("Error listing models:", err);
    });
}
