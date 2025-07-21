import { expect, test } from "@playwright/test";
import * as allure from "allure-js-commons";
import { Common } from "./common";
const owner = "jmontero";

test.describe(
  "Pruebas pagina front de wakamiti",
  { tag: "@wakamitiFront" },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("Comprobar título de la página @allure.id:1", async ({ page }) => {
      await allure.description(
        "Este test comprueba si el título de la página es el correcto"
      );
      await allure.owner(owner);
      await allure.tag("wakamiti-test");
      await allure.severity(allure.Severity.TRIVIAL);
      await allure.label("pruebaLabel", "primera prueba");

      await expect(page).toHaveTitle(/Wakamiti/);
    });
    test("Prueba 1: Mostrar y ocultar panel lateral @allure.id:2", async ({
      page,
    }) => {
      await allure.owner(owner);
      await allure.severity(allure.Severity.MINOR);
      await allure.label("pruebaLabel", "segunda prueba ");
      let common = new Common(page);

      await common
        .GetButtonAndClickByRole({ role: "alert" })
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          console.log(error);
        });

      await common.GetButtonAndClickByRole({ role: "alert" });
    });
    test("Prueba 2: Abrir y cerrar popup de nueva aplicación @allure.id:3", async ({
      page,
    }) => {
      let common = new Common(page);
      await common.GetButtonAndClickByRole({ role: "application" });
      await allure.owner(owner);
      await allure.severity(allure.Severity.CRITICAL);

      await common
        .GetLocator({ text: ".q-dialog__backdrop" })
        .isVisible()
        .then((result) => {
          console.log("Es visible el popup: ", result);
        });

      await common
        .GetButtonAndClickByName({ name: "popupNewAppClosePopup" })
        .then(() => {
          console.log("Se ha pulsado el botón");
        });

      await common
        .GetLocator({ text: ".q-dialog__backdrsdfop" })
        .isHidden()
        .then(() => {
          console.log("El popup se ha cerrado");
        });
    });
    test("Crear nuevo feature @allure.id:4", async ({ page }) => {
      let common = new Common(page);
      await allure.owner(owner);
      await allure.severity(allure.Severity.CRITICAL);

      await common.GetButtonAndClickByRole({ role: "main" });

      await common
        .GetLocatorByRole({ role: "tab", name: "Sin nombre", exactOpt: false })
        .isVisible()
        .then(() => {
          console.log("Nuevo feature creado");
        });
    });
    test("Prueba git jenkins @allure.id:5", async ({ page }) => {
      let common = new Common(page);
      await allure.owner(owner);
      await allure.severity(allure.Severity.CRITICAL);

      await common.GetButtonAndClickByRole({ role: "main" });

      await common
        .GetLocatorByRole({ role: "tab", name: "Sin nombre", exactOpt: false })
        .isVisible()
        .then(() => {
          console.log("Nuevo feature creado");
        });
    });
  }
);
