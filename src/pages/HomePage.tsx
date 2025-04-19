import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Brain,
  Target,
  ArrowRight,
  Bot,
  Sparkles,
  Code,
  Database,
  BookOpen,
  HelpCircle,
  Rocket,
  Users,
  Award,
  Zap,
  BarChart,
  Lightbulb,
} from "lucide-react";

const CategoryCard = ({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
}) => (
  <div className="glass-card rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
    <div className={`p-2 rounded-lg ${color} w-fit mb-4`}>
      <Icon className="w-6 h-6 text-gray-100" />
    </div>
    <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

const ActionCard = ({
  icon: Icon,
  title,
  description,
  color,
  to,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
  to: string;
}) => (
  <Link
    to={to}
    className="glass-card rounded-xl p-6 transform hover:scale-105 transition-all duration-300 group"
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-gray-100" />
      </div>
      <h3 className="text-xl font-bold text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-400 mb-4">{description}</p>
    <div className="flex items-center text-gray-300 group-hover:text-gray-100">
      <span className="mr-2">En savoir plus</span>
      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
}) => (
  <div className="glass-card rounded-xl p-6 hover:bg-gray-800/30 transition-colors duration-300">
    <div className="flex items-center mb-4">
      <div className="p-2 rounded-lg bg-purple-500/20 mr-3">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-100">{title}</h3>
    </div>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

const TestimonialCard = ({
  name,
  role,
  quote,
  avatar,
}: {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}) => (
  <div className="glass-card rounded-xl p-6">
    <div className="flex items-center mb-4">
      <img
        src={avatar}
        alt={name}
        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-purple-500"
      />
      <div>
        <h4 className="text-lg font-bold text-gray-100">{name}</h4>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
    </div>
    <p className="text-gray-300 italic">"{quote}"</p>
  </div>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0F]/50 to-[#0A0A0F]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-300">
            Votre Parcours en Intelligence Artificielle
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Une formation adaptative et personnalisée pour maîtriser l'IA, de la
            théorie à la pratique
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/assessment"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Commencer l'évaluation
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center"
              >
                <Target className="w-5 h-5 mr-2" />
                Mon tableau de bord
              </Link>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">15+</div>
            <p className="text-gray-300">Parcours d'apprentissage</p>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">200+</div>
            <p className="text-gray-300">Ressources pédagogiques</p>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">1000+</div>
            <p className="text-gray-300">Apprenants actifs</p>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 max-w-4xl mx-auto">
          <ActionCard
            icon={HelpCircle}
            title="Évaluation Personnalisée"
            description="Découvrez votre niveau actuel et obtenez des recommandations sur mesure pour votre parcours d'apprentissage"
            color="bg-purple-500/20"
            to="/assessment"
          />
          {isAuthenticated ? (
            <ActionCard
              icon={Target}
              title="Objectifs d'Apprentissage"
              description="Explorez nos parcours structurés et choisissez celui qui correspond à vos ambitions professionnelles"
              color="bg-blue-500/20"
              to="/goals"
            />
          ) : (
            <ActionCard
              icon={Target}
              title="Commencer votre Parcours"
              description="Passez l'évaluation pour accéder à des objectifs d'apprentissage personnalisés"
              color="bg-blue-500/20"
              to="/assessment"
            />
          )}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-4">
            Pourquoi choisir notre plateforme ?
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-3xl mx-auto">
            Notre approche unique combine évaluation personnalisée, parcours
            adaptatifs et ressources de qualité
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Rocket}
              title="Parcours Personnalisés"
              description="Des recommandations adaptées à votre profil, vos compétences et vos objectifs professionnels"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Apprentissage Adaptatif"
              description="Le contenu s'adapte à votre progression et à votre style d'apprentissage"
            />
            <FeatureCard
              icon={BarChart}
              title="Suivi de Progression"
              description="Visualisez votre évolution et identifiez vos points forts et axes d'amélioration"
            />
            <FeatureCard
              icon={Users}
              title="Communauté Active"
              description="Échangez avec d'autres apprenants et experts du domaine"
            />
            <FeatureCard
              icon={Award}
              title="Certifications Reconnues"
              description="Validez vos compétences avec des certifications valorisées par les employeurs"
            />
            <FeatureCard
              icon={Zap}
              title="Ressources à Jour"
              description="Contenu régulièrement mis à jour pour suivre l'évolution rapide de l'IA"
            />
          </div>
        </div>

        {/* Domains Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-4">
            Domaines d'Expertise
          </h2>
          <p className="text-center text-gray-400 mb-10">
            Explorez les différentes branches de l'IA et trouvez votre voie
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryCard
              icon={Brain}
              title="Fondamentaux"
              description="Mathématiques, statistiques et programmation essentiels pour l'IA"
              color="bg-blue-500/20"
            />
            <CategoryCard
              icon={Database}
              title="Data Science"
              description="Analyse de données, feature engineering et visualisation"
              color="bg-green-500/20"
            />
            <CategoryCard
              icon={Code}
              title="Machine Learning"
              description="Algorithmes classiques et apprentissage statistique"
              color="bg-purple-500/20"
            />
            <CategoryCard
              icon={Bot}
              title="Deep Learning"
              description="Réseaux de neurones et architectures avancées"
              color="bg-pink-500/20"
            />
            <CategoryCard
              icon={BookOpen}
              title="NLP"
              description="Traitement du langage naturel et LLMs"
              color="bg-amber-500/20"
            />
            <CategoryCard
              icon={Sparkles}
              title="Computer Vision"
              description="Vision par ordinateur et traitement d'images"
              color="bg-cyan-500/20"
            />
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-4">
            Ce que disent nos apprenants
          </h2>
          <p className="text-center text-gray-400 mb-10">
            Découvrez les expériences de ceux qui ont suivi nos parcours
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Serigne Modou Guèye"
              role="Data Scientist chez Synapsis"
              quote="Cette plateforme m'a permis de passer de débutante à experte en ML en seulement 6 mois. Les parcours sont parfaitement structurés et les ressources sont de grande qualité."
              avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            />
            <TestimonialCard
              name="Lamine Ba"
              role="ML Engineer chez Forge ESP"
              quote="Les quiz et évaluations m'ont permis d'identifier mes lacunes et de me concentrer sur les compétences essentielles. J'ai pu décrocher mon poste actuel grâce à cette formation."
              avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            />
            <TestimonialCard
              name="Amina Ndiaye"
              role="Chercheuse IA au Curi"
              quote="La qualité pédagogique est exceptionnelle. J'apprécie particulièrement l'approche progressive et la diversité des ressources proposées. Je recommande vivement cette plateforme."
              avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">
            Prêt à Commencer ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Évaluez vos compétences et commencez votre parcours personnalisé dès
            aujourd'hui
          </p>

          <Link
            to="/assessment"
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Commencer l'évaluation
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-8 mt-16 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 IA4Nieup - Centre d'Excellence en Intelligence Artificielle
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
