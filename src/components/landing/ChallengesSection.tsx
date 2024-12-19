import { Card, CardContent } from "@/components/ui/card"

export const ChallengesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Les défis quotidiens</h2>
            <div className="space-y-6">
              {/* Cards will go here */}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Nos solutions</h2>
            <div className="space-y-6">
              {/* Solution cards will go here */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}