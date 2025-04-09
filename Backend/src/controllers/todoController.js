const Todo = require('../models/Todo');

// Get all todos with pagination
exports.getTodos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const todos = await Todo.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalTodos = await Todo.countDocuments();
    const totalPages = Math.ceil(totalTodos / limit);
    
    res.status(200).json({
      success: true,
      count: todos.length,
      pagination: {
        totalTodos,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single todo
exports.getTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new todo
exports.createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Create todo with default values if not provided
    const todo = await Todo.create({
      title: title || 'New Additions',
      description: description || 'To stay representative of framework & new example apps.'
    });
    
    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update todo
exports.updateTodo = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Find and update the todo
    let todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    // Update fields if provided
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    todo.updatedAt = Date.now();
    
    await todo.save();
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    await todo.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};