import { Router } from "express";
import { createProject, deleteProject, getProject, getPublicProject, listProjects, publishProject, updateProjectFiles } from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { chat } from "../controllers/chatController.js";
const projectRouter = Router();

projectRouter.get('/public/:id', getPublicProject);
projectRouter.use(authMiddleware);
projectRouter.post('/', createProject);
projectRouter.get('/', listProjects);
projectRouter.post('/:id/publish', publishProject);
projectRouter.get('/:id', getProject);
projectRouter.delete('/:id', deleteProject);
projectRouter.put('/:id/files', updateProjectFiles);

// chat
projectRouter.post('/:id/chat', chat);

export default projectRouter;