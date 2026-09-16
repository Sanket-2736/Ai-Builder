import { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { BuilderHeader } from '../components/BuilderHeader';
import { FolderTreeIcon, MessageSquareIcon } from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { FileExplorer } from '../components/FileExplorer';
import PreviewPanel from '../components/PreviewPanel';
import AgentProgressDashboard from '../components/AgentProgressDashboard';
import { PublishModel } from '../components/PublishModel';
import api from '../api/api';
import toast from 'react-hot-toast';
import {exportProjectZip} from '../utils/exportProject'

export const BuilderPage = () => {
  const {
    activeFile,
    loadingActiveProject,
    activeProject,
    showCode,
    setActiveFile,
    setShowCode,
    loadProject,
    logout,
    chatLoading,
    handleChat
  } = useAppContext();

  const { id } = useParams();
  const navigate = useNavigate();

  const [publishUrl, setPublishUrl] = useState(null);
  const [publishing, setPublishing] = useState(false);
  // const [chatLoading, setChatLoading] = useState(false);
  const [leftTab, setLeftTab] = useState('chat');

  useEffect(() => {
    if (!id) return;

    loadProject(id);
  }, [id]);

  if (loadingActiveProject || !activeProject) {
    return <Loading />;
  }

  const handleOpenPreview = () => {
    if (!id) return;

    window.open(`/preview/${id}`, '_blank');
  }

  const handlePublish = async () => {
    if(!id) return;

    setPublishing(true);
    try {
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`

      setPublishUrl(url);

      toast.success('Website published successfully!');
    } catch (error) {
      toast.error('Publish failed, retry again!');
      console.error('Publish failed, retry again: ', error);
    } finally {
      setPublishing(false);
    }
  }

  const handleDownload = async () => {
    if(!activeProject) return;
    exportProjectZip(activeProject);
  }

  return (
    <div className='h-screen flex flex-col bg-white overflow-hidden text-zinc-400 relative'>

      <BuilderHeader
        projectName={activeProject.name}
        version={activeProject.version}
        showCode={showCode}
        publishing={publishing}
        onToggleShowCode={() => setShowCode(!showCode)}
        onOpenPreview={handleOpenPreview}
        onPublish={handlePublish}
        onDownload={handleDownload}
        onBack={() => navigate('/')}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden">

        <div
          className='w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white'
        >

          <div className="flex border-b border-zinc-200">

            <button
              onClick={() => setLeftTab('chat')}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${
                leftTab === 'chat'
                  ? 'text-zinc-900 border-b-2 border-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <MessageSquareIcon size={13} /> Chat
            </button>

            <button
              onClick={() => setLeftTab('files')}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${
                leftTab === 'files'
                  ? 'text-zinc-900 border-b-2 border-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <FolderTreeIcon size={13} /> Files
            </button>

          </div>

          <div className="flex-1 overflow-hidden">
            {
              leftTab === 'chat' ? (
                <ChatPanel
                messages={activeProject.messages}
                onSend={handleChat}
                loading={chatLoading}
                />
              ) : (
                <FileExplorer files={activeProject.files} activeFile={activeFile} onFileSelect={(path) => {
                  setActiveFile(path);
                  setShowCode(true); 
                }} />
              )
            }
          </div>

        </div>

        <div className="flex-1 overflow-hidden">
          {activeProject.status === 'pending' || activeProject.status === 'generating' || activeProject.status === 'failed' ? 
          (
            <AgentProgressDashboard project={activeProject}/>
          ) : (
            <PreviewPanel 
            project={activeProject} activeFile={activeFile}
            showCode={showCode}
            />
          )}
        </div>

      </div>

      {publishUrl && <PublishModel
      publishUrl={publishUrl}
      onClose={() => setPublishUrl(null)}
      />}

    </div>
  )
}