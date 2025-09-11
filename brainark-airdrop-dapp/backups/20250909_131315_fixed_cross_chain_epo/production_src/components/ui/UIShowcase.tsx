import React from 'react';
import { ElegantButton } from './ElegantButton';
import { GlowButton } from './GlowButton';
import { AnimatedTabs } from './AnimatedTabs';
import { motion } from 'framer-motion';

export default function UIShowcase() {
  const tabs = [
    {
      id: 'buttons',
      label: '🎛️ Buttons',
      content: <ButtonShowcase />,
    },
    {
      id: 'tabs',
      label: '📑 Tabs',
      content: <TabsShowcase />,
    },
    {
      id: 'cards',
      label: '🃏 Cards',
      content: <AnimatedCards />,
    },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-brainark-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
          BrainArk UI Components
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Elegant UI components powered by Framer Motion and Tailwind CSS
        </p>
      </motion.div>

      <AnimatedTabs tabs={tabs} variant="blocks" />
    </div>
  );
}

function ButtonShowcase() {
  return (
    <div className="space-y-12">
      {/* Elegant Buttons */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Elegant Buttons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ElegantButton text="Primary Button" variant="primary" />
          <ElegantButton text="Secondary Button" variant="secondary" />
          <ElegantButton text="Outline Button" variant="outline" />
          <ElegantButton text="Gradient Button" variant="gradient" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <ElegantButton text="Small Button" size="sm" />
          <ElegantButton text="Medium Button" size="md" />
          <ElegantButton text="Large Button" size="lg" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <ElegantButton text="Loading Button" isLoading={true} />
          <ElegantButton text="Disabled Button" disabled={true} />
        </div>
      </div>
      
      {/* Glow Buttons */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Glow Buttons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlowButton text="Blue Glow" glow="blue" />
          <GlowButton text="Purple Glow" glow="purple" />
          <GlowButton text="Green Glow" glow="green" />
          <GlowButton text="Multi Glow" glow="multi" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <GlowButton text="Small Glow" size="sm" glow="purple" />
          <GlowButton text="Medium Glow" size="md" glow="purple" />
          <GlowButton text="Large Glow" size="lg" glow="purple" />
        </div>
      </div>
    </div>
  );
}

function TabsShowcase() {
  // Tab content for showcasing different tab variants
  const tabContent = (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="font-medium mb-2">Tab Content</h3>
      <p className="text-gray-600 dark:text-gray-300">
        This is an example of content within a tab panel. Each tab can contain any content,
        from text to complex UI components.
      </p>
    </div>
  );

  // Define tabs for each showcase
  const underlineTabs = [
    { id: 'tab1', label: 'Profile', content: tabContent },
    { id: 'tab2', label: 'Settings', content: tabContent },
    { id: 'tab3', label: 'Notifications', content: tabContent },
  ];
  
  const pillTabs = [
    { id: 'pill1', label: '📈 Statistics', content: tabContent },
    { id: 'pill2', label: '💰 Earnings', content: tabContent },
    { id: 'pill3', label: '📊 Reports', content: tabContent },
  ];
  
  const gradientTabs = [
    { id: 'grad1', label: 'Dashboard', content: tabContent },
    { id: 'grad2', label: 'Analytics', content: tabContent },
    { id: 'grad3', label: 'Projects', content: tabContent },
  ];
  
  const blockTabs = [
    { id: 'block1', label: 'Overview', content: tabContent },
    { id: 'block2', label: 'Features', content: tabContent },
    { id: 'block3', label: 'Pricing', content: tabContent },
    { id: 'block4', label: 'FAQ', content: tabContent },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Underline Tabs</h2>
        <AnimatedTabs tabs={underlineTabs} variant="underline" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Pill Tabs</h2>
        <AnimatedTabs tabs={pillTabs} variant="pills" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Gradient Tabs</h2>
        <AnimatedTabs tabs={gradientTabs} variant="gradient" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Block Tabs</h2>
        <AnimatedTabs tabs={blockTabs} variant="blocks" />
      </div>
    </div>
  );
}

function AnimatedCards() {
  const cards = [
    {
      title: "Framer Motion",
      description: "Animation library for React that makes creating complex animations simple.",
      icon: "🎭",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Tailwind CSS",
      description: "Utility-first CSS framework for rapidly building custom user interfaces.",
      icon: "🎨",
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "React",
      description: "A JavaScript library for building user interfaces with components.",
      icon: "⚛️",
      color: "from-teal-500 to-emerald-600"
    },
    {
      title: "TypeScript",
      description: "Strongly typed programming language that builds on JavaScript.",
      icon: "📘",
      color: "from-indigo-500 to-purple-600"
    }
  ];

  // Staggered animation for cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={item}
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          className={`bg-gradient-to-br ${card.color} text-white rounded-xl p-6 shadow-lg`}
        >
          <div className="text-4xl mb-4">{card.icon}</div>
          <h3 className="text-xl font-bold mb-2">{card.title}</h3>
          <p className="opacity-90">{card.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
