import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, Image, FileText, Wrench } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const ActionButtons = () => {
  // État de maintenance du chat
  const isChatUnderMaintenance = true;

  return (
    <div className="w-full space-y-4 mt-8">
      <div className="grid grid-cols-2 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white disabled:opacity-80"
                asChild={!isChatUnderMaintenance}
                disabled={isChatUnderMaintenance}
              >
                {!isChatUnderMaintenance ? (
                  <Link to="/chat" className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>Chat</span>
                  </Link>
                ) : (
                  <>
                    <MessageSquare className="h-6 w-6" />
                    <span>Chat</span>
                  </>
                )}
              </Button>
              {isChatUnderMaintenance && (
                <div className="absolute -top-2 -right-2 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  En maintenance
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isChatUnderMaintenance ? "Le chat est temporairement indisponible pour maintenance" : "Discuter avec PedagoIA"}
          </TooltipContent>
        </Tooltip>

        <Link to="/lesson-plan">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white">
            <BookOpen className="h-6 w-6" />
            <span>Fiche de cours</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/exercises">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white">
            <FileText className="h-6 w-6" />
            <span>Exercices</span>
          </Button>
        </Link>

        <Link to="/image-generation">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white">
            <Image className="h-6 w-6" />
            <span>Images</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};