import i18n from "i18n";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);
// Configurar i18n
i18n.configure({
  locales: ["es-ES", "en-GB"], // Idiomas soportados

  directory: path.join(__dirname, "i18n"), // path.join(__dirname, "i18n"), // Carpeta de traducciones
  defaultLocale: "en-GB", // Idioma por defecto
  objectNotation: true, // Permite usar notación de objetos en las claves
  updateFiles: false, // Evita que se actualicen los archivos de traducción automáticamente
  autoReload: true, // Recarga las traducciones automáticamente
});

export default i18n;
