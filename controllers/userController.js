const UserQuery = require('../db/user.query');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Developer
exports.getUsers = async (req, res) => {
  try {
    const users = UserQuery.getAll();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
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
    const user = UserQuery.findById(req.params.id);

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
    console.error('Get User Error:', error);
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
    const existingUser = UserQuery.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const user = await UserQuery.create({
      name,
      username,
      password,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Create User Error:', error);
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

    let user = UserQuery.findById(req.params.id);

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

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    user = await UserQuery.update(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Update User Error:', error);
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
    const user = UserQuery.findById(req.params.id);

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

    UserQuery.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};