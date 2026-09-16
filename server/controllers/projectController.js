import { Project } from "../models/Project.js";
import crypto from "crypto";

function hashContent(content) {
    return crypto
        .createHash("md5")
        .update(content)
        .digest("hex")
        .slice(0, 12);
}

export async function createProject(req, res) {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({
            error: "Prompt is required!"
        });
    }

    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorised!"
        });
    }

    const project = await Project.create({
        name: "Planning project...",
        description: prompt,
        files: {},
        messages: [
            {
                role: "user",
                content: prompt
            },
            {
                role: "assistant",
                content: "Planning project structure..."
            }
        ],
        version: 0,
        owner: req.user.userId,
        status: "pending",
        filesGenerated: [],
        filesPlanned: [],
        currentFile: null,
        error: null
    });

    runBackgroundGeneration(project._id.toString(), prompt).catch((err) => {
        console.log(
            `[Background AI] Fatal generation error for project ${project._id}:`,
            err
        );
    });

    return res.status(201).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: {},
        messages: project.messages,
        version: project.version,
        status: project.status,
        filesGenerated: project.filesGenerated,
        filesPlanned: project.filesPlanned,
        currentFile: project.currentFile,
        error: project.error,
        createdAt: project.createdAt
    });
}

export async function runBackgroundGeneration(projectId, prompt) {
    // AI generation logic will be added here
}

export async function listProjects(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorised!"
        });
    }

    const projects = await Project.find(
        {
            owner: req.user.userId
        },
        {
            name: 1,
            description: 1,
            version: 1,
            createdAt: 1,
            updatedAt: 1
        }
    ).sort({
        updatedAt: -1
    });

    return res.json(projects);
}

export async function getProject(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorised!"
        });
    }

    const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user.userId
    });

    if (!project) {
        return res.status(404).json({
            error: "Project not found!"
        });
    }

    const filesObj = {};

    for (const [path, entry] of Object.entries(project.files)) {
        if (entry && typeof entry.content === "string") {
            filesObj[path] = entry.content;
        }
    }

    return res.status(200).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        status: project.status,
        filesGenerated: project.filesGenerated,
        filesPlanned: project.filesPlanned,
        currentFile: project.currentFile,
        error: project.error,
        createdAt: project.createdAt
    });
}

export async function deleteProject(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorised!"
        });
    }

    const project = await Project.findOneAndDelete({
        _id: req.params.id,
        owner: req.user.userId
    });

    if (!project) {
        return res.status(404).json({
            error: "Project not found!"
        });
    }

    return res.json({
        success: true
    });
}

export async function updateProjectFiles(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorised!"
        });
    }

    const { files } = req.body;

    if (!files || typeof files !== "object" || Array.isArray(files)) {
        return res.status(400).json({
            error: "files object is required!"
        });
    }

    const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user.userId
    });

    if (!project) {
        return res.status(404).json({
            error: "Project not found!"
        });
    }

    const newFiles = {};

    for (const [path, content] of Object.entries(files)) {
        if (typeof content === "string") {
            newFiles[path] = {
                content,
                hash: hashContent(content)
            };
        }
    }

    project.files = newFiles;
    project.version += 1;

    await project.save();

    const filesObj = {};

    for (const [path, entry] of Object.entries(project.files)) {
        if (entry && typeof entry.content === "string") {
            filesObj[path] = entry.content;
        }
    }

    return res.status(200).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version,
        status: project.status,
        filesGenerated: project.filesGenerated,
        filesPlanned: project.filesPlanned,
        currentFile: project.currentFile,
        error: project.error,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    });
}

export async function publishProject(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Unauthorised!"
        });
    }

    const project = await Project.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.user.userId
        },
        {
            published: true
        },
        {
            new: true
        }
    );

    if (!project) {
        return res.status(404).json({
            error: "Project not found!"
        });
    }

    return res.json({
        success: true,
        published: project.published
    });
}

export async function getPublicProject(req, res) {
    const project = await Project.findOne({
        _id: req.params.id,
        published: true
    });

    if (!project) {
        return res.status(404).json({
            error: "Project not found!"
        });
    }

    const filesObj = {};

    for (const [path, entry] of Object.entries(project.files)) {
        if (entry && typeof entry.content === "string") {
            filesObj[path] = entry.content;
        }
    }

    return res.status(200).json({
        _id: project._id,
        name: project.name,
        description: project.description,
        files: filesObj,
        messages: project.messages,
        version: project.version
    });
}