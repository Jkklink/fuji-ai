import { defineHandler } from 'nitro';
import { requireAccess } from '../../utils/access';
export default defineHandler(event => {
  const config = requireAccess(event.req);
  return { providers: { openrouter: Boolean(config.openrouterApiKey), mistral: Boolean(config.mistralApiKey), groq: Boolean(config.groqApiKey), tavily: Boolean(config.tavilyApiKey) } };
});
