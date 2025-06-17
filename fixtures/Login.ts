import { Button, Common } from "@iti/iti-playwright-core";
import i18n from "i18n";
import { Page, Locator } from "playwright/test";

export class Login {
  /** Localizador para mensajes de validación de campos inválidos. */
  public readonly loginErrorMessage: Locator;

  /**
   * Crea una instancia de la clase `Login`
   * @param page - Instancia de la página actual en Playwright, que se utilizará para interactuar con los elementos.
   * Esta instancia se utiliza para obtener los localizadores de los elementos de login.
   */
  constructor(public readonly page: Page) {
    this.page = page;
    this.loginErrorMessage = this.page.getByTestId("login-page-error-message");
  }

  /**
   * Inicia el proceso de login en la página
   * @param usr string usuario con el que se va a hacer login
   * @param pass string contraseña para hacer login
   * @returns Promise<Page>
   * @example loginProcess("user", "password")
   */
  async loginProcess(usr: string, pass: string): Promise<Page> {
    i18n.setLocale("es-ES");
    const common = new Common(this.page);
    const button = new Button(this.page);

    return new Promise(async (resolve, reject) => {
      // Pulsar el botón de login
      await this.page.locator(".container-user > .btn-ci").click();
      // Pulsar el botón para acceder al menú de login
      await button.clickButtonByName(i18n.__("LOGIN.BTN_ACCESO"));
      // Rellenar los inputs de usuario y contraseña
      await common.inputFill(i18n.__("LOGIN.LOGIN_USER"), usr);
      await common.inputFill(i18n.__("LOGIN.LOGIN_PASSWORD"), pass);
      // Pulsar botón para aceptar login
      await this.page
        .getByRole("button", {
          name: i18n.__("LOGIN.ENTRAR"),
        })
        .click();

      resolve(this.page);
    });
  }
}
