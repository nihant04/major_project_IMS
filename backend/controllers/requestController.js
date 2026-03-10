import Request from '../models/Request.js';
import User from '../models/User.js';

// Create Request
export const createRequest = async (req, res) => {
    try {
        const { userId, role, type, subject, description, department } = req.body;

        if (!userId || !role || !type || !subject || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newRequest = await Request.create({
            userId,
            role,
            type,
            subject,
            description,
            department,
            status: 'Pending'
        });

        res.status(201).json({
            message: 'Request submitted successfully',
            request: newRequest
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get My Requests (for specific user)
export const getMyRequests = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const requests = await Request.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Requests (Admin only - with filters)
export const getAllRequests = async (req, res) => {
    try {
        const { role, status } = req.query;
        let whereClause = {};

        if (role && role !== 'All') whereClause.role = role;
        if (status && status !== 'All') whereClause.status = status;

        const requests = await Request.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'avatar']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Request Status (Admin approval/rejection)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComment } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const request = await Request.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        if (adminComment) request.adminComment = adminComment;

        await request.save();

        res.json({
            message: `Request ${status.toLowerCase()}`,
            request
        });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Request (Creator only)
export const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        await request.destroy();

        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
