
import React, { useState } from 'react';
import { Camera, MessageSquare, Image, Settings } from 'lucide-react';
import { FeaturesNavigation, Feature } from '../navigation/FeaturesNavigation';

const features: Feature[] = [
  {
    id: 'photos',
    title: 'Photos',
    icon: <Camera className="w-6 h-6" />
  },
  {
    id: 'messages',
    title: 'Messages',
    icon: <MessageSquare className="w-6 h-6" />
  },
  {
    id: 'gallery',
    title: 'Gallery',
    icon: <Image className="w-6 h-6" />
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings className="w-6 h-6" />
  }
];

export function ExampleUsage() {
  const [activeTab, setActiveTab] = useState('photos');

  return (
    <FeaturesNavigation 
      features={features}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}
