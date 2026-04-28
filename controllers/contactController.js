const ContactMessage = require('../models/ContactMessage');
require('express-async-errors');

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
const getMessages = async (req, res) => {
    const messages = await ContactMessage.find()
        .sort({ createdAt: -1 });

    const unreadCount = await ContactMessage.countDocuments({ isRead: false });

    res.status(200).json({
        success: true,
        count: messages.length,
        unreadCount,
        data: messages,
    });
};

// @desc    Create new contact message (from public contact form)
// @route   POST /api/contact
// @access  Public
const createMessage = async (req, res) => {
    const message = await ContactMessage.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
    });
};

// @desc    Toggle read status
// @route   PUT /api/contact/:id/read
// @access  Private (Admin)
const toggleReadStatus = async (req, res) => {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
        return res.status(404).json({
            success: false,
            message: 'Message not found',
        });
    }

    message.isRead = !message.isRead;
    await message.save();

    res.status(200).json({
        success: true,
        data: message,
    });
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteMessage = async (req, res) => {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
        return res.status(404).json({
            success: false,
            message: 'Message not found',
        });
    }

    await message.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
    });
};

module.exports = {
    getMessages,
    createMessage,
    toggleReadStatus,
    deleteMessage,
};
