import { Project } from "../models/Project.js";
import { reviseProject } from "../services/ai.js";
import { applyOperations } from "../services/diff.js";

export function buildManifest(files){
    const manifest = [];

    for(const [path, entry] of Object.entries(files)){
        manifest.push({path, hash: entry.hash, size: entry.content.length})
    }

    return manifest;
}

export async function chat(req, res){
    const {prompt} = req.body;

    if(!prompt || typeof prompt !== 'string'){
        return res.status(400).json({error: 'Prompt is required!'});
    }

    if(!req.user){
        return res.status(401).json({error: 'Unauthorized!'});
    }

    const project = await Project.findOne({
        _id : req.params.id,
        owner : req.user.userID
    });

    if(!project){
        return res.status(404).json({error: 'Project not found!'});
    }

    project.status = 'revising';
    project.messages.push({role: 'user', content: prompt, timestamp : new Date()});
    await project.save();

    try {
        const manifest = buildManifest(project.files);
        const relevantFiles = {};

        for(const [path, entry] of Object.entries(project.files)){
            relevantFiles[path] = entry.content;
        }

        const recentMessages = project.messages.slice(-4).map((m) => ({
            role : m.role,
            content: m.content,
        }))

        const result = await reviseProject(prompt, manifest, relevantFiles, recentMessages);

        const {files: updatedFiles, applied, errors} = applyOperations(project.files, result.operations);

        if(errors.length > 0){
            console.warn(`[Diff] Errors applying operations: `, errors)
        }

        project.files = updatedFiles;
        project.markModified('files');
        project.version += 1;
        project.status = 'completed';
        project.messages.push({
            role: 'assistant',
            content: result.description + (errors.length > 0 ? `\n\n Some operations faile: ${errors.join(', ')}` : '')
        });

        await project.save();

        const filesObj = {};

        for(const [path, entry] of Object.entries(project.files)){
            filesObj[path] = entry.content;
        }

        return res.json({
            _id: project._id,
            name: project.name,
            description: project.desccription,
            files: filesObj,
            messages: project.messages,
            version: project.version,
            status: project.status,
            applied, 
            errors,
            aiDescription : result.description
        })
    } catch (error) {
        console.error(`[AI Revision Error] ${error.message}`);

        project.status = 'completed';
        await project.save();
        return res.json({error: error.message || 'Failed to process revision request'});
    }
}