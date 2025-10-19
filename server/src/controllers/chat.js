const ChatMessage = require('../models/ChatMessage');
const Project = require('../models/Project');
const { analyzeWithLLM } = require('../utils/llmUtils');

// @desc    Get chat history for a project
// @route   GET /api/projects/:projectId/chats
// @access  Private
exports.getChatHistory = async(req, res) => {
    try {
        const messages = await ChatMessage.find({
            projectId: req.params.projectId,
            userId: req.user._id
        }).sort({ timestamp: 1 });

        res.status(200).json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history'
        });
    }
};

// @desc    Send a new chat message
// @route   POST /api/projects/:projectId/chats
// @access  Private
exports.sendMessage = async(req, res) => {
    try {
        const { content } = req.body;
        const projectId = req.params.projectId;
        const userId = req.user._id;

        // Get project and its latest scan
        const project = await Project.findById(projectId)
            .populate('latestScan')
            .populate('user');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Create user message
        const userMessage = await ChatMessage.create({
            projectId,
            userId,
            content,
            role: 'user',
            metadata: {
                scanId: project.latestScan ? project.latestScan._id : null,
                filePath: null,
                vulnerabilityId: null
            }
        });

        // Update project's last chat activity
        project.lastChatActivity = new Date();
        await project.save();

        // Get AI response
        const aiResponse = await analyzeWithLLM({
            content,
            project,
            scan: project.latestScan
        });

        // Create AI message
        const aiMessage = await ChatMessage.create({
            projectId,
            userId,
            content: aiResponse,
            role: 'system',
            metadata: {
                scanId: project.latestScan ? project.latestScan._id : null,
                filePath: null,
                vulnerabilityId: null
            }
        });

        res.status(201).json({
            success: true,
            data: {
                message: aiMessage
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};