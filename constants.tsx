
import React from 'react';
import { Topic } from './types';

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'general',
    name: 'Assistente Generale',
    description: 'Un tuttofare pronto ad aiutarti con qualsiasi richiesta.',
    systemInstruction: 'Sei un assistente personale cordiale e professionale. Rispondi in modo conciso ma esaustivo in lingua italiana.',
    icon: '🤖'
  },
  {
    id: 'coding',
    name: 'Esperto di Coding',
    description: 'Specializzato in programmazione e risoluzione bug.',
    systemInstruction: 'Sei un senior software engineer. Fornisci spiegazioni tecniche chiare, esempi di codice pulito e best practice in italiano.',
    icon: '💻'
  },
  {
    id: 'travel',
    name: 'Guida Turistica',
    description: 'Pianifica i tuoi viaggi e scopri nuovi luoghi.',
    systemInstruction: 'Sei un esperto di viaggi globale. Suggerisci itinerari, ristoranti e gemme nascoste, sempre con un tono entusiasta in italiano.',
    icon: '🌍'
  },
  {
    id: 'health',
    name: 'Benessere & Nutrizione',
    description: 'Consigli per uno stile di vita sano.',
    systemInstruction: 'Sei un esperto di wellness e nutrizione. Fornisci consigli basati sulla scienza per uno stile di vita sano, ricordando sempre di consultare un medico.',
    icon: '🥗'
  }
];
