import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"

const DiscoverPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-start justify-center p-8">
      <SEO 
        title="Découvrir l'application | Pedagoia" 
        description="Tutoriels et guides pour découvrir l'application Pedagoia"
      />
      
      <BackButton />
      
      <div className="max-w-2xl mx-auto space-y-6 text-center w-full">
        <h1 className="text-4xl font-bold text-gray-900">
          Découvrez Pedagoia
        </h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-premium">
          <p className="text-xl text-gray-700">
            Nos tutoriels sont en train d'être peaufinés, vous serez les premiers informés dès leur sortie !
          </p>
        </div>
      </div>
    </div>
  )
}

export default DiscoverPage