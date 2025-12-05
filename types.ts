import React from 'react';

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  condition: string;
  originalText: string;
}

export interface GeneratedContent {
  educationFact: string;
  motivation: string;
  birthdays: string;
}

export interface PostItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  isLoading?: boolean;
  isSending?: boolean;
  isSent?: boolean;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}
