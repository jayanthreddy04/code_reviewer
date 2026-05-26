import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';
import config from '../config/index.js';

process.env.LANGSMITH_PROJECT ||= config.langsmith.project;

const langsmithClient = new Client({});

const redactMessageContent = (message) => ({
  ...message,
  content: `[redacted: ${message.content?.length || 0} chars]`,
});

const buildTraceInputs = ({ request, language, fileName, codeLength, contextLength }) => ({
  language,
  fileName,
  codeLength,
  contextLength,
  model: request.model,
  temperature: request.temperature,
  maxTokens: request.max_tokens,
  messages: config.langsmith.traceCode
    ? request.messages
    : request.messages.map(redactMessageContent),
});

const buildTraceOutputs = (completion) => {
  const choice = completion.choices?.[0];
  const content = choice?.message?.content || '';

  return {
    id: completion.id,
    model: completion.model,
    usage: completion.usage,
    finishReason: choice?.finish_reason,
    content: config.langsmith.traceCode ? content : `[redacted: ${content.length} chars]`,
  };
};

export const createTracedGroqCompletion = traceable(
  async ({ client, request }) => client.chat.completions.create(request),
  {
    client: langsmithClient,
    name: 'Groq Code Review',
    run_type: 'llm',
    tags: ['groq', 'code-review'],
    metadata: {
      provider: 'groq',
      feature: 'automated-code-review',
    },
    getInvocationParams: ({ request }) => ({
      ls_provider: 'groq',
      ls_model_name: request.model,
      ls_model_type: 'chat',
      ls_temperature: request.temperature,
      ls_max_tokens: request.max_tokens,
      ls_invocation_params: {
        response_format: request.response_format,
      },
    }),
    processInputs: buildTraceInputs,
    processOutputs: buildTraceOutputs,
  }
);

export const flushLangSmithTraces = async () => {
  if (!config.langsmith.tracing) {
    return;
  }

  try {
    await langsmithClient.awaitPendingTraceBatches();
  } catch (error) {
    console.warn(`LangSmith trace flush failed: ${error.message}`);
  }
};
