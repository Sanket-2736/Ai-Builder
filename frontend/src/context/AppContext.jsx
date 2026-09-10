import { createContext, use, useCallback, useContext, useEffect, useState } from "react";
import toast from 'react-hot-toast'
import api from '../api/api'
const AppContext = createContext(undefined);
import {useNavigate} from 'react-router-dom'

export function AppContextProvider({children}){
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState([]);
    const [loadingActiveProject, setLoadingActiveProject] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [generatingProject, setGeneratingProject] = useState(false);
    const [activeFile, setActiveFile] = useState('/App.js');
    const [showCode, setShowCode] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const navigate = useNavigate();

    const checkSession = async () => {
        try {
            const {data} = await api.get('/api/auth/me');

            setUser(data.user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUser(false);
        }
    }

    const login = async (email, password) => {
        try {
            const {data} = await api.post('/api/auth/login', {email, password});
            setUser(data.user);
            toast.success("Login successful!");
            navigate('/');
        } catch (error) {
            console.error("Login failed: ", error);
            const errMsg = error?.response?.data?.error || "Invalid email or password!";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }

    const register = async (name, email, password) => {
        try {
            const {data} = await api.post('/api/auth/register', {name, email, password});
            setUser(data.user);
            toast.success("Account created successfully!");
            navigate('/');
        } catch (error) {
            console.error("Registration failed: ", error);
            const errMsg = error?.response?.data?.error || "Registration failed!";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
            setUser(null);
            setProjects([]);
            setActiveProject(null);
            toast.success('Logged out successfully!');
            navigate('/login')
        } catch (error) {
            console.error('Logout failed: ', error);
            toast.error('Logout failed!');
        }
    }

    const loadProjects = async () => {
        if(!user) return;
        try {
            const {data} = await api.get('/api/projects');
            setProjects(data);
        } catch (error) {
            toast.error("Failed to load projects!")
            console.error("Failed to load projects: ", error)
        } finally {
            setLoadingProjects(false);
        }
    }

    const loadProject = async (IdleDeadline, silent=false) => {
        if(!user) return;
        if(!silent) setLoadingActiveProject(true);
        try {
            const {data} = await api.get(`/api/projects/${id}`);
            setActiveProject(data);
            const files = Object.keys(data.files);
            if(files.length > 0){
                setActiveFile((prev) => {
                    if(files.includes(prev)) return prev;
                    if(files.includes('/App.js')) return '/App.js';
                    return files[0];
                })
            }
        } catch (error) {
            if(!silent){
                toast.error('Error in loading the selected project!');
                navigate('/');
            }
            console.error('Error in loading the selected project: ', error);
        } finally {
            if(!silent) setLoadingActiveProject(false);
        }
    }

    const handleDelete = useCallback(
        async (id) => {
            if(!user) return;

            try {
                const {data} = await api.delete(`/api/projects/$id`);
                toast.success('Project deleted successfully!');
                setProjects((prev) => prev.filter((p) => p._id !== id))
            } catch (error) {
                console.error('Error in deleting project: ', error)
                toast.error('Error in deleting project!')                
            }
        }, [user]
    );
    
    const handleGenerate = useCallback(
        async (prompt) => {
            if(!user) return;
            setGeneratingProject(true);

            try {
                const {data} = await api.post('/api/projects', {prompt});
                toast.success('AI Agent is planning structure...');
                navigate(`/builder/${data._id}`);
            } catch (error) {
                console.error('Error in generating project: ', error)
                toast.error('Error in generating project!')                
            } finally {
                setGeneratingProject(false);
            }
        }, [navigate, user]
    );

    useEffect(() => {
        checkSession()
    }, [
        checkSession
    ]);

    useEffect(() =>{
        if(!activeProject?._id || !user) return;
        const isOngoing = activeProject.status === 'generating' || activeProject.status === 'pending' || activeProject.status === 'revising';

        if(isOngoing){
            setChatLoading(true);
            const interval = setInterval(() => {
                loadProject(activeProject._id, true)
            }, 2000);

            return  () => {
                clearInterval(interval);
            }
        }
    },[activeProject?._id, activeProject?.status, loadProject, user])

    return <AppContext.Provider value={{
        user,
        loadingUser,
        login,
        register,
        projects,
        loadingProjects,
        activeProject,
        loadingActiveProject,
        chatLoading,
        generatingProject,
        activeFile,
        showCode,
        setActiveFile,
        setShowCode,
        loadProjects,
        loadProject,
        handleDelete,
        handleGenerate
    }}>
        {children}
    </AppContext.Provider>
}

export function useAppContext(){
    const context = useContext(AppContext);

    if(context === undefined){
        throw new Error("useAppContext must be used within an AppContextProvider");
    }

    return context;
}