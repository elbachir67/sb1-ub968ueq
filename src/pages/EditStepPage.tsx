import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, BookOpen, Video, GraduationCap, Laptop } from 'lucide-react';

interface Section {
  _id: string;
  title: string;
  order: number;
}

interface Resource {
  _id?: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'book' | 'use_case';
  level: 'basic' | 'intermediate' | 'advanced';
}

interface FormData {
  sectionId: string;
  title: string;
  description: string;
  duration: string;
  details: string;
  fullDetails: string;
  order: number;
  resources: Resource[];
}

const resourceTypeConfig = {
  article: { icon: BookOpen, label: 'Article', color: 'text-blue-600' },
  video: { icon: Video, label: 'Vidéo', color: 'text-red-600' },
  course: { icon: GraduationCap, label: 'Cours', color: 'text-green-600' },
  book: { icon: BookOpen, label: 'Livre', color: 'text-purple-600' },
  use_case: { icon: Laptop, label: 'Cas Pratique', color: 'text-orange-600' }
};

function EditStepPage() {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    sectionId: '',
    title: '',
    description: '',
    duration: '',
    details: '',
    fullDetails: '',
    order: 1,
    resources: []
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch sections
        const sectionsResponse = await fetch('http://localhost:5000/api/sections');
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData);

        // Fetch step data
        const stepResponse = await fetch(`http://localhost:5000/api/steps/${stepId}`);
        const stepData = await stepResponse.json();

        // Fetch resources for this step
        const resourcesResponse = await fetch(`http://localhost:5000/api/resources/step/${stepId}`);
        const resourcesData = await resourcesResponse.json();

        setFormData({
          sectionId: stepData.section._id,
          title: stepData.title,
          description: stepData.description,
          duration: stepData.duration,
          details: stepData.details,
          fullDetails: stepData.fullDetails,
          order: stepData.order,
          resources: resourcesData
        });
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate, stepId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update step
      const stepResponse = await fetch(`http://localhost:5000/api/steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: formData.sectionId,
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          details: formData.details,
          fullDetails: formData.fullDetails,
          order: formData.order
        })
      });

      if (!stepResponse.ok) throw new Error('Erreur lors de la mise à jour de l\'étape');

      // Handle resources
      for (const resource of formData.resources) {
        if (resource._id) {
          // Update existing resource
          await fetch(`http://localhost:5000/api/resources/${resource._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resource)
          });
        } else {
          // Create new resource
          await fetch('http://localhost:5000/api/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepId,
              ...resource
            })
          });
        }
      }

      toast.success('Étape mise à jour avec succès');
      navigate('/roadmap');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResourceChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newResources = [...prev.resources];
      newResources[index] = { ...newResources[index], [field]: value };
      return { ...prev, resources: newResources };
    });
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: '', url: '', type: 'article', level: 'basic' }]
    }));
  };

  const removeResource = async (index: number) => {
    const resource = formData.resources[index];
    
    if (resource._id) {
      try {
        const response = await fetch(`http://localhost:5000/api/resources/${resource._id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression de la ressource');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression de la ressource');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier l'Étape</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            id="sectionId"
            name="sectionId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.sectionId}
            onChange={handleChange}
          >
            <option value="">Sélectionnez une section</option>
            {sections.map(section => (
              <option key={section._id} value={section._id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Durée
          </label>
          <input
            type="text"
            name="duration"
            id="duration"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.duration}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">
            Détails courts
          </label>
          <textarea
            name="details"
            id="details"
            required
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.details}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="fullDetails" className="block text-sm font-medium text-gray-700">
            Description Détaillée
          </label>
          <textarea
            name="fullDetails"
            id="fullDetails"
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.fullDetails}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">
            Ordre
          </label>
          <input
            type="number"
            name="order"
            id="order"
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.order}
            onChange={handleChange}
          />
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Ressources</h2>
            <button
              type="button"
              onClick={addResource}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter une ressource
            </button>
          </div>
          
          {formData.resources.map((resource, index) => {
            const typeConfig = resourceTypeConfig[resource.type];
            const Icon = typeConfig.icon;
            
            return (
              <div key={index} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-2 ${typeConfig.color}`} />
                    <h3 className="font-medium text-gray-700">Ressource {index + 1}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Titre
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={resource.title}
                      onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="url"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={resource.url}
                      onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={resource.type}
                      onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                    >
                      {Object.entries(resourceTypeConfig).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Niveau
                    </label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={resource.level}
                      onChange={(e) => handleResourceChange(index, 'level', e.target.value)}
                    >
                      <option value="basic">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditStepPage;