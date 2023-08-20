import { Router } from 'express'

import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  toggleTodoDoneStatus,
  updateTodo,
} from '../controllers/todo/todo.controller.js'
import {
  createTodoValidator,
  getAllTodosQueryValidators,
  updateTodoValidator,
} from '../validators/todo/todo.validators.js'
import { validate } from '../validators/validate.js'
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js'

const router = Router()

router
  .route('/')
  .post(verifyJWT, createTodoValidator(), validate, createTodo)
  .get(verifyJWT, getAllTodosQueryValidators(), validate, getAllTodos)

router
  .route('/:todoId')
  .get(verifyJWT, mongoIdPathVariableValidator('todoId'), validate, getTodoById)
  .patch(
    verifyJWT,
    mongoIdPathVariableValidator('todoId'),
    updateTodoValidator(),
    validate,
    updateTodo
  )
  .delete(verifyJWT, deleteTodo)

router
  .route('/toggle/status/:todoId')
  .patch(
    verifyJWT,
    mongoIdPathVariableValidator('todoId'),
    validate,
    toggleTodoDoneStatus
  )

export default router
