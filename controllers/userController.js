const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Developer
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Developer
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Developer
exports.createUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, username, password, role, isActive } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const user = await User.create({
            name,
            username: username.toLowerCase(),
            password,
            role: role || 'user',
            isActive: isActive !== undefined ? isActive : true,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Developer
exports.updateUser = async (req, res) => {
    try {
        const { name, password, role, isActive } = req.body;

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent updating the default developer account role
        if (user.username === 'sparkpair' && role && role !== 'developer') {
            return res.status(400).json({
                success: false,
                message: 'Cannot change role of the primary developer account'
            });
        }

        // If password is provided, hash it
        if (password) {
            user.name = name || user.name;
            user.role = role || user.role;
            user.isActive = isActive !== undefined ? isActive : user.isActive;
            user.password = password;
            await user.save();
        } else {
            user = await User.findByIdAndUpdate(
                req.params.id,
                {
                    name: name || user.name,
                    role: role || user.role,
                    isActive: isActive !== undefined ? isActive : user.isActive
                },
                { new: true, runValidators: true }
            );
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Developer
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting the default developer account
        if (user.username === 'sparkpair') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the primary developer account'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
