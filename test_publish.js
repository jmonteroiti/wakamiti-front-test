import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const resultsDir = "allure-results";
const historyDir = path.join(resultsDir, "history");
const previousHistory = "allure-history/history";

await main();

/**
 * Función prinicipal del script
 * @param {boolean} clean Si es true, se eliminan todas las carpetas de test anteriores y desaparece el historial. Por defecto es false
 */
async function main(clean = false) {
  try {
    if (clean) {
      await CleanProject();
    }

    await ExecuteTest();
    await CopyHistory();
    await GenerateReport();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Elimina las carpetas de la ejecución de test
 * y la generación de reportes para limpiar historial
 * OJO!!! si se eliminan el historial de test desaparece
 */
async function CleanProject() {
  console.log(`🗑️  Eliminando carpetas de test anteriores`);
  fs.rmSync("allure-history", { recursive: true, force: true });
  fs.rmSync("allure-report", { recursive: true, force: true });
  fs.rmSync("allure-results", { recursive: true, force: true });
  fs.rmSync("test-results", { recursive: true, force: true });
}

/**
 * Ejecuta los test con playwright
 */
async function ExecuteTest() {
  console.log("▶ Ejecutando pruebas con Playwright...");

  try {
    execSync("npx playwright test", {
      stdio: "inherit",
    });
  } catch (error) {
    console.log("Algunos test han fallado");
  }
}

/**
 * Copia el historial de la carpeta allure-report a allure-results
 */
async function CopyHistory() {
  console.log("📁 Copiando historial de allure-report a allure-results");
  if (fs.existsSync(previousHistory)) {
    console.log("▶ Copiando historial anterior...");
    fs.mkdirSync(historyDir, { recursive: true });
    fs.cpSync(previousHistory, historyDir, { recursive: true });
  } else {
    console.log("ℹ No se encontró historial anterior.");
  }
}

/**
 * Genera un reporte con allure en la carpeta allure-history y con el historial copiado previamente
 * Una vez generado, vuelve a generarlo con la opción --single-file para tener un único fichero con el historial incluido
 */
async function GenerateReport() {
  console.log("🆕 Generando reporte con allure");
  await execSync(`allure generate ${resultsDir} --clean -o allure-history`, {
    stdio: "inherit",
  });

  // Cambia el nombre del reporte
  CambiarNombreReporteAllure();

  console.log("✅ Reporte generado exitosamente en http://localhost:51100/");
}

/**
 * Cambia el nombre del reporte Allure a "Prueba Julio"
 * en el archivo summary.json generado por Allure.
 */
function CambiarNombreReporteAllure() {
  //   const summaryPath = path.join(__dirname, 'allure-report', 'widgets', 'summary.json');
  if (!fs.existsSync("allure-history/widgets/summary.json")) {
    console.error("No se encontró summary.json en allure-report/widgets");
    return;
  }
  try {
    const summary = JSON.parse(
      fs.readFileSync("allure-history/widgets/summary.json", "utf8")
    );
    summary.reportName = "Test Web Wakamiti";
    fs.writeFileSync(
      "allure-history/widgets/summary.json",
      JSON.stringify(summary, null, 2),
      "utf8"
    );

    CambiarIcono();
    console.log(`Nombre del reporte cambiado a ${summary.reportName}`);
  } catch (err) {
    console.error("Error modificando summary.json:", err);
  }
}

/**
 * Copia favicon.ico desde /assets a /allure-report/history y lo reemplaza si ya existe.
 */
function CambiarIcono() {
  const source = path.resolve("assets", "favicon.ico");
  const targetDir = path.resolve("allure-history");
  const target = path.join(targetDir, "favicon.ico");

  if (!fs.existsSync(source)) {
    console.error(`[ERROR] No se encontró favicon.ico en: ${source}`);
    return;
  }

  if (!fs.existsSync(targetDir)) {
    console.warn(`[WARN] No existe la carpeta: ${targetDir}, creando...`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    fs.copyFileSync(source, target);
    console.log(`[INFO] favicon.ico copiado a: ${target}`);
  } catch (err) {
    console.error(`[ERROR] Falló la copia del icono: ${err}`);
  }
}
