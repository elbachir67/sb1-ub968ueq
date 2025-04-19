import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import {
  Brain,
  Code,
  Database,
  Bot,
  BookOpen,
  Video,
  Laptop,
  Clock,
  ChevronDown,
  Edit,
  GraduationCap,
  Pencil,
  ChevronRight,
} from "lucide-react";

interface Section {
  _id: string;
  title: string;
  description: string;
  order: number;
  icon: string;
}

interface Step {
  _id: string;
  section: Section;
  title: string;
  description: string;
  duration: string;
  details: string;
  fullDetails: string;
  order: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  learningObjectives: string[];
}

interface Resource {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: "article" | "video" | "course" | "book" | "use_case";
  level: "basic" | "intermediate" | "advanced";
  duration: string;
  language: "fr" | "en";
  isPremium: boolean;
}

const resourceTypeConfig = {
  article: { icon: BookOpen, bg: "bg-blue-100", text: "text-blue-600" },
  video: { icon: Video, bg: "bg-red-100", text: "text-red-600" },
  course: { icon: GraduationCap, bg: "bg-green-100", text: "text-green-600" },
  book: { icon: BookOpen, bg: "bg-purple-100", text: "text-purple-600" },
  use_case: { icon: Laptop, bg: "bg-orange-100", text: "text-orange-600" },
};

const levelConfig = {
  basic: {
    label: "Débutant",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  intermediate: {
    label: "Intermédiaire",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  advanced: {
    label: "Avancé",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
};

function StepCard({
  step,
  index,
  isAdmin,
}: {
  step: Step;
  index: number;
  isAdmin: boolean;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${api.resources}/step/${step._id}`);
        if (!response.ok)
          throw new Error("Erreur lors du chargement des ressources");
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des ressources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [step._id]);

  const handleEdit = () => {
    navigate(`/edit-step/${step._id}`);
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md transition-all duration-500 relative group ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ animationDelay: `${index * 200}ms` }}
    >
      {isAdmin && (
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 p-2 bg-blue-100 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Modifier l'étape"
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-4 pr-12">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            {step.title}
          </h3>
        </div>

        <p className="text-lg text-gray-600 mb-4 leading-relaxed">
          {step.description}
        </p>

        <div className="flex items-center text-gray-500 mb-6">
          <Clock className="w-5 h-5 mr-2" />
          <span className="text-base font-medium">{step.duration}</span>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Aperçu</h4>
          <p className="text-gray-600 leading-relaxed">{step.details}</p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center mb-6"
        >
          {isExpanded ? "Voir moins" : "En savoir plus"}
          <ChevronDown
            className={`w-4 h-4 ml-1 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isExpanded && (
          <div className="mb-6 animate-fadeIn">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Description détaillée
            </h4>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {step.fullDetails}
            </p>

            {step.prerequisites && step.prerequisites.length > 0 && (
              <div className="mt-4">
                <h5 className="text-md font-semibold text-gray-800 mb-2">
                  Prérequis
                </h5>
                <ul className="list-disc list-inside text-gray-600">
                  {step.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {step.learningObjectives && step.learningObjectives.length > 0 && (
              <div className="mt-4">
                <h5 className="text-md font-semibold text-gray-800 mb-2">
                  Objectifs d'apprentissage
                </h5>
                <ul className="list-disc list-inside text-gray-600">
                  {step.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">Ressources</h4>
          {loading ? (
            <div className="text-sm text-gray-500">
              Chargement des ressources...
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-2">
              {resources.map(resource => {
                const typeConfig = resourceTypeConfig[resource.type];
                const levelStyle = levelConfig[resource.level];
                const Icon = typeConfig.icon;

                return (
                  <div
                    key={resource._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center flex-1 group"
                    >
                      <span
                        className={`p-2 rounded-md ${typeConfig.bg} mr-3 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className={`w-4 h-4 ${typeConfig.text}`} />
                      </span>
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors block">
                          {resource.title}
                        </span>
                        <span className="text-sm text-gray-500 block">
                          {resource.description}
                        </span>
                      </div>
                    </a>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}
                      >
                        {levelStyle.label}
                      </span>
                      {resource.isPremium && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Aucune ressource disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoadmapPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sections
        const sectionsResponse = await fetch(api.sections);
        if (!sectionsResponse.ok)
          throw new Error("Erreur lors du chargement des sections");
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData);

        // Initialize expanded state for all sections
        const initialExpandedState = sectionsData.reduce(
          (acc: any, section: Section) => {
            acc[section._id] = true; // Start with all sections expanded
            return acc;
          },
          {}
        );
        setExpandedSections(initialExpandedState);

        // Fetch steps
        const stepsResponse = await fetch(api.steps);
        if (!stepsResponse.ok)
          throw new Error("Erreur lors du chargement des étapes");
        const stepsData = await stepsResponse.json();
        setSteps(stepsData);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "foundations":
        return <Brain className="w-6 h-6 text-blue-600" />;
      case "data science":
        return <Database className="w-6 h-6 text-green-600" />;
      case "machine learning":
        return <Code className="w-6 h-6 text-purple-600" />;
      case "deep learning":
        return <Bot className="w-6 h-6 text-red-600" />;
      default:
        return <Brain className="w-6 h-6 text-blue-600" />;
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
      <h1 className="text-4xl font-bold text-gray-900 mb-12">
        Parcours d'Apprentissage
      </h1>

      <div className="space-y-16">
        {sections.map(section => {
          const sectionSteps = steps.filter(
            step => step.section._id === section._id
          );
          const isExpanded = expandedSections[section._id];

          return (
            <div
              key={section._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  {getSectionIcon(section.title)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                    <p className="text-gray-500">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {sectionSteps.length} étape
                    {sectionSteps.length > 1 ? "s" : ""}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6">
                  <div className="grid gap-8 md:grid-cols-2">
                    {sectionSteps
                      .sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                        <StepCard
                          key={step._id}
                          step={step}
                          index={index}
                          isAdmin={isAdmin}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoadmapPage;
