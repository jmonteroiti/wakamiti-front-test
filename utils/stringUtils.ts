import * as allure from "allure-js-commons";
import { expect, Page } from "playwright/test";
import i18n from "../i18n.config";

const timeToWait = 15000;

/**
 * Acepta una palabra o frase y elimina mayúsculas, acentos
 * y espacios y la devuelve
 * @param text string Palabra a normalizar
 * @returns string
 */
export default function NormalizeString(text: string): string {
  i18n.setLocale("es-ES");
  // Obtiene la url esperada del diccionario y elimina mayúsculas y acentos
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

  return normalized;
}

function SetAllureMetadata(
  epic: string,
  feature: string,
  story: string,
  severity?: allure.Severity
) {
  allure.epic(epic);
  allure.feature(feature);
  allure.story(story);
  allure.owner("jmontero");
  allure.severity(severity ? severity : allure.Severity.NORMAL);
}

/**
 * Comprueba que se ha redireccionado correctamente a una url
 * @param page Page Objeto Page de playwright para las pruebas
 * @param link url que hay que comprobar
 * @returns Promise
 */
async function ComprobarUrl(page: Page, link: string) {
  return new Promise((resolve, reject) => {
    const urlNormalized = NormalizeString(link);

    resolve(expect(page).toHaveURL(`/${urlNormalized}/`));
  });
}

export { ComprobarUrl, SetAllureMetadata, timeToWait };
