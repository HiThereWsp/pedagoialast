
import { Link } from "react-router-dom";

export const SavedContentHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Link to="/home" className="flex-shrink-0">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain"
          />
        </Link>
        <h1 className="text-3xl font-bold ml-4">Mes ressources pédagogiques générées</h1>
      </div>
    </div>
  );
};
