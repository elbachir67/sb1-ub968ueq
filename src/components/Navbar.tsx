import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  LogOut,
  User,
  Plus,
  LayoutDashboard,
  Menu,
  X,
  Brain,
  Code,
  Database,
  Bot,
  Settings,
  Library,
  ChevronDown,
} from "lucide-react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, signOut, user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="glass sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-purple-500 animate-float" />
              <span className="ml-2 text-xl font-bold gradient-text">
                IA4Nieup
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`nav-link ${isActive("/")}`}>
              Accueil
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard")}`}
                >
                  <div className="flex items-center space-x-1">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Tableau de bord</span>
                  </div>
                </Link>
                <Link to="/goals" className={`nav-link ${isActive("/goals")}`}>
                  Objectifs
                </Link>
              </>
            ) : (
              <Link
                to="/assessment"
                className={`nav-link ${isActive("/assessment")}`}
              >
                Évaluation
              </Link>
            )}

            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className="flex items-center px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administration
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${
                      adminMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {adminMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu">
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Tableau de bord
                      </Link>
                      <Link
                        to="/admin/resources"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <Library className="w-4 h-4 mr-2" />
                        Gestion des ressources
                      </Link>
                      <Link
                        to="/admin/system"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configuration système
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Tableau de bord
                </Link>
                <Link
                  to="/goals"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Objectifs
                </Link>
              </>
            ) : (
              <Link
                to="/assessment"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Évaluation
              </Link>
            )}

            {isAdmin && (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="px-2 space-y-1">
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 inline mr-2" />
                    Tableau de bord admin
                  </Link>
                  <Link
                    to="/admin/resources"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Library className="w-4 h-4 inline mr-2" />
                    Gestion des ressources
                  </Link>
                  <Link
                    to="/admin/system"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Configuration système
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-300" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-300">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2">
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
