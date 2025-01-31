import React from 'react'

interface EmptyStateProps {
  firstName?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({ firstName }) => {
  return (
    <div className="flex h-full items-center justify-center flex-col gap-8">
      <div>
        <p className="text-2xl font-medium bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent mb-2">
          {firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
        </p>
        <p className="text-2xl font-medium premium-text">
          Comment puis-je vous aider ?
        </p>
      </div>
    </div>
  )
}