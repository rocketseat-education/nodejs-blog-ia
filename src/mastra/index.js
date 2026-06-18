import { Mastra } from '@mastra/core'
import { postWriterAgent } from './agents/post-writer-agent.js'

export const mastra = new Mastra({
  agents: { postWriterAgent },
})
