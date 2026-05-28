const express = require('express');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/diagnose', protect, async (req, res) => {
    const { errorLogs } = req.body;

    if (!errorLogs) {
        return res.status(400).json({ message: 'errorLogs field is required' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });

    try {
        res.write(`data: ${JSON.stringify({ text: "[ENGINE: VELORA_AI_ANALYZING]\n\n" })}\n\n`);

        const { analyzeLogsWithAI } = require('../services/logAnalysisService');
        const result = await analyzeLogsWithAI(errorLogs, 'mistral');

        let text = '';
        if (typeof result === 'string') {
            text = result;
        } else if (result?.markdown) {
            text = result.markdown;
        } else {
            text = `### Root Cause Analysis\n${result?.rootCause || 'No specific root cause identified.'}\n\n`;
            if (Array.isArray(result?.stepByStepFix) && result.stepByStepFix.length > 0) {
                text += '### How to Fix\n';
                result.stepByStepFix.forEach((step, idx) => {
                    text += `${idx + 1}. ${step}\n`;
                });
                text += '\n';
            }
            if (Array.isArray(result?.securityFlags) && result.securityFlags.length > 0) {
                text += '### Security Warnings\n';
                result.securityFlags.forEach((flag) => {
                    text += `- ${flag}\n`;
                });
                text += '\n';
            }
        }

        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('AI Streaming Error:', error);
        res.write(`data: ${JSON.stringify({ text: "\n\n### SYSTEM_ERROR\nAI diagnostics failed. Please verify your configured AI provider API keys." })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

// @desc    General AI Chat for debugging and questions
router.post('/chat', protect, async (req, res) => {
    const { message, context } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'message field is required' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    try {
        const { PromptTemplate } = require('@langchain/core/prompts');
        const { ChatMistralAI } = require('@langchain/mistralai');
        
        // Switching to Mistral for stability as requested
        const model = new ChatMistralAI({
            apiKey: process.env.MISTRAL_API_KEY,
            model: 'mistral-large-latest',
            temperature: 0.5
        });

        const promptTemplate = PromptTemplate.fromTemplate(`
            You are Velora AI, a friendly and expert Cloud Assistant. 
            
            TONE: 
            - Conversational, clear, and very helpful. 
            - Explain things like you are talking to a friend who is a developer.
            - Use simple language (Layman's terms) for complex errors.
            
            STRICT RULES:
            1. Be CONCISE but don't be robotic. 
            2. Do NOT repeat the user's question.
            3. If the user says 'hlw', 'hi', or 'hello', just respond with a friendly greeting and ask how you can help.
            4. Use Markdown for structure only where it makes things easier to read.
            
            Context Logs: {context}
            User Question: {question}
        `);

        const logsText = Array.isArray(context) ? context.join('\n') : context;
        const chain = promptTemplate.pipe(model);
        
        const stream = await chain.stream({
            context: logsText || "No logs available",
            question: message
        });

        for await (const chunk of stream) {
            if (chunk?.content) {
                res.write(`data: ${JSON.stringify({ text: chunk.content })}\n\n`);
            }
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.write(`data: ${JSON.stringify({ text: "I'm having trouble connecting to my brain right now. Please try again later." })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

module.exports = router;
