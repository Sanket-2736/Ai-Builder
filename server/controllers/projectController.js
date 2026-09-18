import { Project } from "../models/Project.js";
import crypto from "crypto";
import { generateProject } from "../services/ai.js";

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
    
    try {
        console.log(`[Background AI] Starting generation for project ${projectId}`);

        const result = await generateProject(prompt, {
            onPlan: async (plan) => {
                console.log(`[Background AI] Plan created for project ${projectId}. Planned ${plan.files.length} files`);
                const fileList = plan.files.map((f) => `- \`${f.path}\` : ${f.description}`).join('\n');

                await Project.findByIdAndUpdate(projectId, {
                    name : plan.projectName || 'Generated Project',
                    status: 'generating',
                    filesPlanned : plan.files,
                    $push : {
                        messages : {
                            role : 'assistant',
                            content: `Planned website structure:\n${fileList}`,
                            timestamp : new Date(),
                        }
                    }
                })
            },
            onFileStart : async (path) => {
                await Project.findByIdAndUpdate(projectId, {
                    currentFile: path,
                })
            },
            onFileComplete : async (path, code) => {
                const project = await Project.findById(projectId);

                if(project){
                    project.files = project.files || {};
                    project.files[path] = {
                        content: code, 
                        hash: hashContent(code)
                    };
                    project.filesGenerated = [...(project.filesGenerated || []), path];
                    project.messages.push({
                        role : 'assistant',
                        content : `Created file "${path}"`,
                        timestamp : new Date()
                    });
                    project.currentFile = null;
                    project.markModified('files');
                    await project.save();
                }
            }
        })

        const project = await Project.findById(projectId);
        if(project){
            project.status = 'completed';
            project.version = 1;

            if(result.description){
                project.name = result.description;
            }

            project.messages.push({
                role : 'assistant',
                content : `Website generation complete! You can view and edit the files.`,
                timestamp : new Date()
            });

            await project.save();
        }
    } catch (error) {
        console.error(`[Background AI] Fatal generation error for project ${projectId}: `, error);
        await Project.findByIdAndUpdate(projectId, {
            status : 'failed',
            error : error.message,
            $push : {
                messages : {
                    role : 'assistant',
                    content : `Generation failed: ${error.message}`,
                    timestamp : new Date()
                }
            }
        })
    }
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