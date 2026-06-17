import Groq from "groq-sdk";
import { env } from "./env.config";

const client = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export default client;
