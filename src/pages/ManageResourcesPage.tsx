import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Step {
  _id: string;
  title: string;
  section: {
    _id: string;
    title: string;
  };
}

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'course';
  level: 'basic' | 'intermediate' | 'advanced';
  step: Step;
}

function ManageResourcesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    fetchResources();
  }, [isAdmin, navigate]);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/resources');
      if (!response.ok) throw new Error('Erreur lors du chargement des ressources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des ressources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      toast.success('Ressource supprimée avec succès');
      fetchResources();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la ressource');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gérer les Ressources</h1>
        <button
          onClick={() => navigate('/add-step')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ajouter une Étape
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {resources.map((resource) => (
            <li key={resource._id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {resource.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {resource.type}
                      </p>
                      <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {resource.level}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Étape: {resource.step.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Section: {resource.step.section.title}
                    </p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700 truncate block mt-1"
                    >
                      {resource.url}
                    </a>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="ml-2 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ManageResourcesPage;