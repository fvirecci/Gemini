
import React from 'react';
import { Topic } from '../types';
import { DEFAULT_TOPICS } from '../constants';

interface TopicSelectorProps {
  currentTopicId: string;
  onSelectTopic: (topic: Topic) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ currentTopicId, onSelectTopic }) => {
  return (
    <div className="w-full md:w-72 bg-white border-r border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seleziona Argomento</h2>
      <div className="space-y-2">
        {DEFAULT_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className={`w-full flex items-start p-3 rounded-xl transition-all duration-200 text-left ${
              currentTopicId === topic.id
                ? 'bg-indigo-50 border-indigo-200 border shadow-sm'
                : 'hover:bg-gray-50 border-transparent border'
            }`}
          >
            <span className="text-2xl mr-3" role="img" aria-label={topic.name}>
              {topic.icon}
            </span>
            <div className="overflow-hidden">
              <p className={`font-semibold text-sm ${currentTopicId === topic.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                {topic.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{topic.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
          <p className="text-xs font-medium opacity-80 mb-1">Versione Pro</p>
          <p className="text-sm font-bold mb-3">Sblocca funzioni avanzate</p>
          <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all">
            Upgrade Ora
          </button>
        </div>
      </div>
    </div>
  );
};
