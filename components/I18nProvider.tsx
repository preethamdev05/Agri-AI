import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'hi';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    "app.title": "AgriScan AI",
    "app.subtitle": "Production Engine",
    "status.online": "System Online",
    "status.offline": "Offline",
    "hero.title": "Crop Disease Analysis",
    "hero.desc": "Upload a clear image of a crop leaf to detect potential diseases using our multi-task deep learning model.",
    "btn.upload": "Run Diagnostics",
    "btn.analyzing": "Analyzing...",
    "btn.optimizing": "Optimizing image...",
    "btn.uploading": "Uploading...",
    "btn.processing": "Processing results...",
    "upload.drag": "Drop your image here",
    "upload.click": "or click to browse",
    "result.healthy": "Healthy",
    "result.confidence": "Confidence",
    "result.crop": "Crop Type",
    "result.pathology": "Pathology",
    "footer.supported": "Supported Models & Semantics",
    "history.title": "Recent Scans",
    "history.empty": "No recent scans found.",
    "theme.toggle": "Toggle theme",
    "lang.en": "English",
    "lang.es": "Español",
    "lang.hi": "हिंदी"
  },
  es: {
    "app.title": "AgriScan AI",
    "app.subtitle": "Motor de Producción",
    "status.online": "Sistema en Línea",
    "status.offline": "Desconectado",
    "hero.title": "Análisis de Enfermedades",
    "hero.desc": "Sube una imagen clara de una hoja para detectar enfermedades usando nuestro modelo de aprendizaje profundo.",
    "btn.upload": "Ejecutar Diagnóstico",
    "btn.analyzing": "Analizando...",
    "btn.optimizing": "Optimizando imagen...",
    "btn.uploading": "Subiendo...",
    "btn.processing": "Procesando resultados...",
    "upload.drag": "Arrastra tu imagen aquí",
    "upload.click": "o haz clic para buscar",
    "result.healthy": "Saludable",
    "result.confidence": "Confianza",
    "result.crop": "Tipo de Cultivo",
    "result.pathology": "Patología",
    "footer.supported": "Modelos Soportados",
    "history.title": "Escaneos Recientes",
    "history.empty": "No hay escaneos recientes.",
    "theme.toggle": "Cambiar tema",
    "lang.en": "English",
    "lang.es": "Español",
    "lang.hi": "हिंदी"
  },
  hi: {
    "app.title": "एग्रीस्कैन एआई",
    "app.subtitle": "उत्पादन इंजन",
    "status.online": "सिस्टम ऑनलाइन",
    "status.offline": "ऑफ़लाइन",
    "hero.title": "फसल रोग विश्लेषण",
    "hero.desc": "संभावित बीमारियों का पता लगाने के लिए फसल की पत्ती की स्पष्ट छवि अपलोड करें।",
    "btn.upload": "निदान चलाएं",
    "btn.analyzing": "विश्लेषण कर रहा है...",
    "btn.optimizing": "छवि अनुकूलन...",
    "btn.uploading": "अपलोड किया जा रहा है...",
    "btn.processing": "परिणाम संसाधित हो रहे हैं...",
    "upload.drag": "अपनी छवि यहाँ छोड़ें",
    "upload.click": "या ब्राउज़ करने के लिए क्लिक करें",
    "result.healthy": "स्वस्थ",
    "result.confidence": "आत्मविश्वास",
    "result.crop": "फसल का प्रकार",
    "result.pathology": "विकृति विज्ञान",
    "footer.supported": "समर्थित मॉडल",
    "history.title": "हाल ही के स्कैन",
    "history.empty": "कोई हालिया स्कैन नहीं मिला।",
    "theme.toggle": "थीम बदलें",
    "lang.en": "English",
    "lang.es": "Español",
    "lang.hi": "हिंदी"
  }
};

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('agri-scan-lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agri-scan-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
