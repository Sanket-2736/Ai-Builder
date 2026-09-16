import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api';
import toast from 'react-hot-toast';
import { Loading } from '../components/Loading';
import { AlertCircleIcon } from 'lucide-react';
import { FullPagePreview } from '../components/FullPagePreview';

const PublishPage = () => {
  const {id} = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);

  useEffect(()=>{
    if(!id) return;

    const fetchPublicUrl = async () => {
        try {
          const {data} = await api.get(`/api/projects/public/${id}`);
          setProject(data);
        } catch (error) {
          console.error('Error in fetching url: ', error);
          toast.error('Error in fetching url!');
          setError(error?.response?.data?.error || 'This website is not available yet!');
        } finally {
          setLoading(false);
        }
    }    
    
    fetchPublicUrl();
  }, [id]);

  if(loading) {
    return (
      <Loading />
    );
  }

  if(error || !project){
    return (
      <div className="h-screen w-screen flex items-center flex-col justify-center bg-zinc-50 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 mb-1.5">
          Website Unavailable!
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mb-6">{error}</p>
        <div className="text-10px font-semibold uppercase tracking-widest text-zinc-400">Builder AI</div>
      </div>
    );
  }

  return (
    <FullPagePreview files={project.files} />
  )
}

export default PublishPage