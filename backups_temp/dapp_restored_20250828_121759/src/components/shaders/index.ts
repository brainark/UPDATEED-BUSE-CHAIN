// src/components/shaders/index.ts
// This file re-exports shader components for easier imports

import { 
  HeroBackground as HeroShaderBackground,
  AirdropBackground as AirdropShaderBackground,
  EPOBackground as EPOShaderBackground,
  ExplorerBackground as ExplorerShaderBackground,
  ShaderButton,
  MeshGradient,
  ShaderSettingsProvider,
  useShaderSettings
} from './ShaderBackground';

import * as CSS from './ProfessionalShaders';

// Export the NavigationShader from the CSS-only implementation
const NavigationShader = CSS.NavigationShader;

export { 
  // Main components
  HeroShaderBackground,
  AirdropShaderBackground,
  EPOShaderBackground,
  ExplorerShaderBackground,
  NavigationShader,
  ShaderButton,
  MeshGradient,
  
  // Context and hooks
  ShaderSettingsProvider,
  useShaderSettings,
  
  // Pure CSS fallbacks 
  CSS
};
