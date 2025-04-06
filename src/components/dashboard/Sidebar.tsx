import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Bot,
  Image, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Leaf,
  MessageCircle,
  Plus,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SidebarNavItem from './SidebarNavItem';
import SidebarNavigationSection from './SidebarNavigationSection';
import SidebarUserProfile from './SidebarUserProfile';
import { Database } from '@/types/supabase';

type Thread = Database['public']['Tables']['chat_threads']['Row'];

type ThreadRow = Thread & {
  created_at: string;
  updated_at: string;
  last_message_at: string;
};

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  firstName: string;
  onThreadSelect?: (threadId: string) => void;
}

export const Sidebar = ({ isOpen, toggleSidebar, firstName, onThreadSelect }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { threadId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isChatRoute = location.pathname.startsWith('/chat');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const threadsPerPage = 12; // Load 12 threads per page
  const threadsToShow = 7; // Show only 7 threads initially
  const loadingRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    // Refresh threads when entering a chat route
    if (isChatRoute && user?.id) {
      loadThreads(0);
    }
  }, [location.pathname, isChatRoute, user?.id]);

  useEffect(() => {
    if (isChatRoute && user?.id) {
      // Reset state when route changes
      setThreads([]);
      setPage(0);
      setHasMore(true);
      loadThreads(0);
    }
  }, [isChatRoute, user?.id]);

  useEffect(() => {
    const currentLoadingRef = loadingRef.current;
    if (!currentLoadingRef || !isChatRoute || page === 0) return; // Don't observe while loading first page

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingThreads && page > 0) {
        loadThreads(page + 1);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });

    observer.observe(currentLoadingRef);

    return () => observer.disconnect();
  }, [isChatRoute, page]); // Include page to re-setup observer after first load

  const loadThreads = async (pageToLoad: number) => {
    if (loadingThreads || (!hasMore && pageToLoad > 0)) return;

    try {
      setLoadingThreads(true);
      setError(null);

      const from = pageToLoad * threadsPerPage;
      const to = from + threadsPerPage - 1;

      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      if (data) {
        setThreads(prev => {
          // If first load, only show 7 threads
          if (pageToLoad === 0) {
            return data.slice(0, threadsToShow);
          }
          // For subsequent loads, add all new threads
          const newThreads = data.filter(newThread => 
            !prev.some(existingThread => existingThread.id === newThread.id)
          );
          return [...prev, ...newThreads];
        });
        setHasMore(data.length === threadsPerPage);
        setPage(pageToLoad);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load threads');
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Une erreur est survenue lors du chargement des threads. Veuillez réessayer.",
      });
    } finally {
      setLoadingThreads(false);
    }
  };

  const handleThreadClick = (threadId: string) => {
    if (onThreadSelect) {
      onThreadSelect(threadId);
    }
    navigate(`/chat/${threadId}`, { replace: true });
  };

  const handleLogout = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la session:", sessionError);
        localStorage.clear();
        navigate('/bienvenue');
        return;
      }

      if (!session) {
        console.log("Aucune session trouvée, redirection vers bienvenue");
        navigate('/bienvenue');
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        toast({
          variant: "destructive",
          title: "Erreur de déconnexion",
          description: "Une erreur est survenue lors de la déconnexion. Veuillez réessayer.",
        });
      } else {
        localStorage.clear();
        navigate('/bienvenue');
      }
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      localStorage.clear();
      navigate('/bienvenue');
    }
  };

  return (
    <div className="flex flex-col h-full mt-16">
      {isChatRoute ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 space-y-4">
            <Button 
              variant="ghost"
              onClick={() => navigate("/tableaudebord")}
              className="w-full flex items-center justify-start gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au tableau de bord
            </Button>
            <Button 
              onClick={() => {
                navigate('/chat');
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Chat
            </Button>
          </div>
          {/* <Separator className="my-4" /> */}
          
          {/* Chat threads list container */}
          <div className="flex-1 overflow-hidden"> {/* Parent container */}
            <div className="h-64 overflow-y-auto"> {/* Fixed height scrollable container */}
              <div className="space-y-1 p-2">
                {loadingThreads && threads.length === 0 ? (
                  <div className="animate-pulse space-y-4 p-4">
                    {/* Show loading states */}
                    {Array.from({ length: threadsToShow }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded w-48 mb-2" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 text-red-500">
                    {error}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {threads.map((thread) => (
                      <Button
                        key={thread.id}
                        variant="ghost"
                        onClick={() => handleThreadClick(thread.id)}
                        className={cn(
                          "w-full flex flex-col items-start gap-1 p-3 h-auto",
                          threadId === thread.id && "bg-blue-50 text-blue-600 hover:bg-blue-50"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium truncate">{thread.title}</span>
                        </div>
                      </Button>
                    ))}
                    {/* Loading indicator and intersection observer target */}
                    {hasMore && (
                      <div 
                        ref={loadingRef}
                        className="py-4 flex items-center justify-center"
                      >
                        {loadingThreads && (
                          <div className="space-y-4 w-full">
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Other routes content
        <>
          {/* Outils pédagogiques */}
          <SidebarNavigationSection title="Outils pédagogiques" className="mb-auto">
            <SidebarNavItem 
              icon={<Bot className="h-5 w-5" />} 
              label="Chat AI" 
              path="/chat"
              onClick={() => navigate("/chat")}
            />
            <SidebarNavItem 
              icon={<Sparkles className="h-5 w-5" />} 
              label="Générateur de séquences" 
              path="/lesson-plan"
              onClick={() => navigate("/lesson-plan")}
            />
            <SidebarNavItem 
              icon={<Leaf className="h-5 w-5" />} 
              label="Générateur d'exercices" 
              path="/exercise"
              onClick={() => navigate("/exercise")}
            />
            <SidebarNavItem 
              icon={<FileText className="h-5 w-5" />} 
              label="Assistant administratif" 
              path="/correspondence"
              onClick={() => navigate("/correspondence")}
            />
            <SidebarNavItem 
              icon={<Image className="h-5 w-5" />} 
              label="Générateur d'images" 
              path="/image-generation"
              onClick={() => navigate("/image-generation")}
            />
          </SidebarNavigationSection>
          
          {/* Resources section */}
          <div className="mt-auto pt-6">
            <Separator className="mb-6" />
            
            <SidebarNavigationSection hasSeparator={true}>
              <SidebarNavItem 
                icon={<BookOpen className="h-5 w-5" />} 
                label="Mes ressources" 
                path="/saved-content"
                onClick={() => navigate("/saved-content")}
              />
            </SidebarNavigationSection>
            
            {/* Feature request section */}
            <SidebarNavigationSection>
              <SidebarNavItem 
                icon={<MessageCircle className="h-5 w-5 text-purple-600" />} 
                label="Demander des fonctionnalités" 
                path="/suggestions"
                onClick={() => navigate("/suggestions")}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100"
              />
            </SidebarNavigationSection>
          </div>
        </>
      )}
      
      {/* User profile dropdown - always visible */}
      <SidebarUserProfile 
        firstName={firstName}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Sidebar;
