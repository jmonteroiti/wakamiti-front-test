import { Locator, Page } from "@playwright/test";

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  //#region Inputs

  //#endregion

  /**
   * Obtiene el primer elemento que contenga el texto indicado
   * @param {string} text
   * @returns Locator
   * @example GetButtonByText({ text: "Modificar" })
   */
  GetLocatorByText({ text }: { text: string }): Locator {
    return this.page.getByText(text, { exact: true }).first();
  }

  /**
   * Obtiene el primer botón que contenga el rol y el nombre indicado
   * @param {string} role
   * @param {string} name
   * @param {boolean} exactOpt
   * @returns Locator
   * @example GetButtonByRole({ role: "button", name: "far fa-ellipsis-v" })
   */
  GetLocatorByRole({
    role,
    name,
    exactOpt = true,
  }: {
    role: any;
    name?: string;
    exactOpt?: boolean;
  }): Locator {
    return this.page.getByRole(role, { name: name, exact: exactOpt }).first();
  }

  /**
   * Obtiene el primer elemento que contenga el texto indicado
   * @param {string} text
   * @returns Locator
   * @example GetLocator("csm-alert-container")
   */
  GetLocator({ text }: { text: string }): Locator {
    return this.page.locator(text).first();
  }

  /**
   * @function GetInputAndFillByText
   * @description Busca un input por texto y lo rellena con un texto
   * @param {string} text texto por el que buscar el input
   * @param {string} inputText texto para rellenar el input
   * @returns Promise<void>
   * @example GetInputAndFillByText({ text: "Nombre", fillText: "Juan" })
   */
  async GetInputAndFillByText({
    text,
    fillText,
  }: {
    text: string;
    fillText: string;
  }): Promise<void> {
    return await this.GetLocatorByText({ text }).fill(fillText);
  }

  /**
   * @function GetInputAndFillByRole
   * @description Busca un input por role y lo rellena con un texto
   * @param {string} role role por el que buscar el input
   * @param {string} inputText texto para rellenar el input
   * @returns Promise<void>
   * @example GetInputAndFillByRole({ role: "textbox", fillText: "Juan" })
   */
  async GetInputAndFillByRole({
    role,
    fillText,
  }: {
    role: string;
    fillText: string;
  }): Promise<void> {
    return await this.GetLocatorByRole({ role }).fill(fillText);
  }

  /**
   * @function GetButtonAndClickByText
   * @description Busca un botón por texto y hace clic en él
   * @param {string} text texto por el que buscar el botón
   * @returns Promise<void>
   * @example GetButtonAndClickByText({ text: "Modificar" })
   */
  async GetButtonAndClickByText({ text }: { text: string }): Promise<void> {
    return await this.GetLocatorByText({ text }).click();
  }

  /**
   * @function GetButtonAndClickByRole
   * @description Busca un botón por role y hace clic en él
   * @param {string} role role por el que buscar el botón
   * @returns Promise<void>
   * @example GetButtonAndClickByText({ text: "Modificar" })
   */
  async GetButtonAndClickByRole({ role }: { role: string }): Promise<void> {
    return await this.GetLocatorByRole({ role }).click();
  }

  /**
   * @function GetButtonAndClickByName
   * @description Busca un botón por nombre y hace clic en él
   * @param {string} name nombre por el que buscar el botón
   * @returns Promise<void>
   * @example GetButtonAndClickByName({ name: "Aceptar" })
   */
  async GetButtonAndClickByName({ name }: { name: string }): Promise<void> {
    return await this.page.locator(`button[name=${name}]`).click();
  }

  /**
   *
   * @param {Locator} locator
   * @returns
   */
  async isCheckboxChecked(locator: Locator) {
    const checkbox = await locator.first(); //  Playwright recomienda usar locators en lugar de $
    if (!checkbox) return false; // Si no encuentra el elemento, retorna false
    const ariaChecked = await checkbox.getAttribute("aria-checked");
    return ariaChecked === "true";
  }

  /**
   * Verifica si una columna existe en la tabla.
   * @param {string} columnLabel - Nombre de la columna a verificar.
   * @returns {Promise<boolean>} - `true` si la columna existe, `false` si no.
   */
  async columnExists(columnLabel: string) {
    const column = this.page.locator('td[role="columnheader"]', {
      hasText: columnLabel,
    });
    return (await column.count()) > 0;
  }

  async toggleColumn(columnLabel: string, shouldSelect: boolean) {
    await this.page.getByRole("button", { name: "Columnas" }).click();

    // Localizar el checkbox
    const checkbox = this.page
      .locator(".dx-treeview-node", { hasText: columnLabel })
      .locator(".dx-checkbox");

    // Comprobar si está marcado
    const isChecked = await this.isCheckboxChecked(checkbox);
    console.log(`Está marcado: ${isChecked}`);

    // Hacer clic dependiendo del valor de shouldSelect
    if (shouldSelect && !isChecked) {
      await checkbox.click();
      console.log(`✅ Checkbox "${columnLabel}" ha sido seleccionado.`);
    } else if (!shouldSelect && isChecked) {
      await checkbox.click();
      console.log(`✅ Checkbox "${columnLabel}" ha sido deseleccionado.`);

      //#TODO METODO DE ESPERA HASTA QUE DESAPAREZCA LA COMNA
      // Esperar a que la UI se actualice
      await this.page.waitForTimeout(500);

      // Verificar que la columna ya no se muestra en la tabla
      const columnStillExists = await this.columnExists(columnLabel);
      if (!columnStillExists) {
        console.log(
          `✅ La columna "${columnLabel}" ya no está visible en la tabla.`
        );
      } else {
        console.log(
          `⚠️ La columna "${columnLabel}" aún se muestra en la tabla. Puede haber un problema con la actualización de la UI.`
        );
      }
    } else {
      console.log(
        `⚠️ Checkbox "${columnLabel}" ya estaba en el estado deseado.`
      );
    }
  }

  //TODO EXTRAER LA VERIFICACIÓN DE LAS COLUMNAS A METODO EXTERNO

  async randomColumn() {
    // Obtener todas las columnas visibles
    await this.waitForNoActiveRequests();
    const columns = await this.page
      .locator('td[role="columnheader"]')
      .allTextContents();

    // Verificar si la última columna está vacía
    const lastColumn = columns[columns.length - 1]; // Última columna

    // Si la última columna está vacía, la eliminamos
    if (!lastColumn || lastColumn.trim() === "") {
      console.log("⚠️ La última columna está vacía, se eliminará.");
      columns.pop(); // Eliminar la última columna
    } else {
      console.log("✅ La última columna no está vacía.");
    }

    console.log(`📋 Columnas disponibles sin la última: ${columns}`);
    //TODO CAMBIAR .LOG A ERROR
    if (columns.length === 0) {
      console.log("⚠️ No hay columnas disponibles para seleccionar.");
      return null;
    }

    // Seleccionar una columna al azar
    const randomIndex = Math.floor(Math.random() * columns.length);
    const randomColumn = columns[randomIndex];

    console.log(
      `🔹 Columna seleccionada al azar: "${randomColumn}" (posición: ${
        randomIndex + 1
      })`
    );

    return { columnName: randomColumn, position: randomIndex + 1 };
  }

  async selectRandomColumn() {
    //#TODO MEJORAR ESPERA
    //await this.page.waitForTimeout(2000);
    await this.waitForSpinner();
    const selectColumn = await this.randomColumn();
    await this.toggleColumn(selectColumn!.columnName, false);
    await this.toggleColumn(selectColumn!.columnName, true);

    return true;
  }

  async exportXLSGrid() {
    await this.waitForElementAndClick("Exportar como"); // Espera y hace clic en "Exportar como"
    await this.verifyDownloadFromBrowser(); // Verifica la descarga
  }

  async verifyDownloadFromBrowser() {
    let responseHandler: any;

    return new Promise(async (resolve, reject) => {
      try {
        // Asegurarse de que no se añaden múltiples listeners
        responseHandler = (response: any) => {
          if (
            response
              .url()
              .includes("/proveedores-api/export-as?excelGeneratorType=DOM") &&
            response.status() === 200
          ) {
            console.log("✅ La descarga se completó correctamente.");
            resolve(true); // Resolver la promesa cuando la descarga se haya completado
          }
        };

        // Limpiar cualquier manejador de eventos previo
        this.page.off("response", responseHandler);

        // Registrar el manejador de eventos de respuesta
        this.page.on("response", responseHandler);

        // Asegúrate de que el botón Excel está visible antes de hacer clic
        await this.waitForElementAndClick("Excel"); // Espera el botón y hace clic

        // Esperar un máximo de 10 segundos para la descarga
        const timeout = 10000; // Tiempo máximo en milisegundos
        const downloadTimeout = new Promise((_, reject) =>
          setTimeout(() => {
            console.log("⚠️ Timeout: La descarga no fue detectada.");
            reject("⚠️ Timeout: La descarga no fue detectada."); // Descripción más detallada del timeout
          }, timeout)
        );

        // Usar Promise.race para esperar la respuesta de la red o el tiempo de espera máximo
        await Promise.race([downloadTimeout]);
      } catch (error: any) {
        console.log(
          `❌ Error al verificar la descarga: ${error.message || error}`
        ); // Mejorar el manejo del error
        reject(`❌ Error al verificar la descarga: ${error.message || error}`);
      } finally {
        // Asegurarse de eliminar el listener después de que haya terminado
        this.page.off("response", responseHandler);
      }
    });
  }

  // Función auxiliar para esperar y hacer clic en un elemento
  async waitForElementAndClick(text: string, timeout = 5000) {
    try {
      const element = await this.page.waitForSelector(`text=${text}`, {
        timeout,
      });
      await this.page.waitForTimeout(1000);
      await element.click();
      console.log(`✅ Se hizo clic en el elemento con texto: "${text}"`);
    } catch (error) {
      console.log(
        `⚠️ No se encontró el elemento con texto: "${text}" después de ${timeout} ms.`
      );
    }
  }

  async searchTextInGrid() {
    await this.page.waitForTimeout(1000);
    await this.waitForNoActiveRequests();

    // Seleccionar todas las filas de la tabla
    const rows = await this.page
      .locator('tbody[role="presentation"] tr.dx-data-row')
      .all();

    if (rows.length === 0) {
      console.log("⚠️ No hay filas disponibles en la tabla.");
      return null;
    }

    // Seleccionar una fila al azar
    const randomRowIndex = Math.floor(Math.random() * rows.length);
    const randomRow = rows[randomRowIndex];

    // Obtener todas las celdas de la fila seleccionada
    const cells = await randomRow
      .locator('td[role="gridcell"]')
      .allTextContents();

    if (cells.length === 0) {
      console.log("⚠️ La fila seleccionada no tiene valores.");
      return null;
    }

    // Seleccionar una celda aleatoria
    const randomCellIndex = Math.floor(Math.random() * (cells.length - 1)); // Evitamos la última columna de acciones
    const randomValue = cells[randomCellIndex];

    console.log(
      `🔹 Valor seleccionado: "${randomValue}" de la fila ${
        randomRowIndex + 1
      }, columna ${randomCellIndex + 1}`
    );
    return {
      value: randomValue,
      row: randomRowIndex + 1,
      column: randomCellIndex + 1,
    };
  }

  async verifyAndSelect(text: string) {
    try {
      const componentSelector = this.page.locator(
        '(//div[@data-bind="dxControlsDescendantBindings: true"])'
      );
      const optionOTSelector = this.page.locator(
        `.dx-item.dx-list-item[title="${text}"]`
      );
      await this.page.waitForTimeout(2000);

      // Verificar si el componente está visible
      if (await componentSelector.isVisible()) {
        console.log("✅ Componente encontrado.");

        // Verificar si la opción existe
        if ((await optionOTSelector.count()) > 0) {
          console.log(`🎯 Opción "${text}" encontrada. Haciendo clic...`);
          await optionOTSelector.click();
        } else {
          console.log(`⚠️ Opción "${text}" no encontrada.`);
        }
      } else {
        console.log("❌ El componente no está visible.");
      }
    } catch (error) {
      console.error("🚨 Error en verifyAndSelect:", error);
    }
  }

  async verifySelectorFilter(opcionTexto: string) {
    const componenteSelector =
      "(//div[@data-bind='dxControlsDescendantBindings: true'])";
    const opcionOTSelector = `.dx-item.dx-list-item[title="${opcionTexto}"]`; // Use the dynamic input for the selector

    try {
      // Verificar si el componente está visible
      const componenteVisible = await this.page
        .locator(componenteSelector)
        .isVisible();

      if (componenteVisible) {
        const opcionOT = this.page.locator(opcionOTSelector);

        // Verificar si la opción existe
        const opcionOTCount = await opcionOT.count();

        if (opcionOTCount > 0) {
          console.log(
            `✅ Opción "${opcionTexto}" encontrada. Haciendo clic...`
          );
          await opcionOT.click();
        } else {
          console.log(`❌ Opción "${opcionTexto}" no encontrada.`);
        }
      } else {
        console.log("❌ No se muestra el componente desplegable.");
      }

      return componenteVisible;
    } catch (error) {
      console.error("🚨 Error en verificarYSeleccionarOT:", error);
      throw error; // Re-throw the error after logging it
    }
  }

  async searchGrid(text: string, column: number) {
    try {
      // Espera a que no haya solicitudes activas
      await this.waitForNoActiveRequests();

      // Construye el XPath dinámico usando la variable 'column'
      const inputElement = await this.page.$(
        `(//input[@aria-label="Celda de filtro"])[${column}]`
      );

      // Verifica si el elemento existe antes de intentar interactuar con él
      if (!inputElement) {
        throw new Error(`No se encontró el elemento para la columna ${column}`);
      }

      // Rellena el campo con el valor pasado en 'text'
      await inputElement.fill(text);

      // Verifica si en el filtro se muestra un desplegable
      await this.verifyAndSelect(text);

      // Simula presionar 'Enter' para aplicar el filtro
      await inputElement.press("Enter");

      // Verifica si los valores de la tabla se actualizaron correctamente
      // await this.verifyTableColumnValues(text, column);
    } catch (error) {
      // Captura cualquier error y muestra un mensaje detallado
      console.error(
        `Error al buscar en la columna ${column} con texto "${text}":`,
        error
      );
      // Opcional: Puedes lanzar el error nuevamente si quieres que el test falle
      throw error;
    }
  }

  async searchGridRandom(columns: any) {
    try {
      // Espera a que no haya solicitudes activas
      await this.waitForNoActiveRequests();
      // Selecciona una columna al azar
      const randomColumn = await this.selectRandomColumn();
      if (!randomColumn) {
        console.log("⚠️ No se pudo seleccionar una columna al azar.");
        return;
      }
      // Genera un texto aleatorio de búsqueda
      const randomText = Math.random().toString(36).substring(2, 15);
      // Busca el texto aleatorio en la columna seleccionada
      await this.searchGrid(randomText, columns.indexOf(randomColumn) + 1);
    } catch (error) {
      // Captura cualquier error y muestra un mensaje detallado
      console.error(`Error al buscar aleatoriamente en la tabla:`, error);
      // Opcional: Puedes lanzar el error nuevamente si quieres que el test falle
      throw error;
    }
  }

  async verifyTableColumnValues(text: string, column: number) {
    try {
      // Get the value of the hidden input (expected value)
      await this.page.waitForTimeout(1000);
      //const expectedDate = await this.page.locator(`(//input[@aria-label="Celda de filtro"])[${column}]`).inputValue();
      console.log(`🔍 Checking column ${column} with expected value: ${text}`);

      // Select all rows in the table
      const rows = await this.page.locator(
        ".dx-datagrid-rowsview .dx-row.dx-data-row"
      );
      const rowCount = await rows.count();

      console.log(`📊 Found ${rowCount} rows to verify`);

      let hasErrors = false;

      // Loop through each row
      for (let i = 0; i < rowCount; i++) {
        // Get the value of the date column
        const dateCell = await rows.nth(i).locator(`td:nth-child(${column})`);

        // Esperar que el elemento tenga texto antes de leerlo (máx 5 segundos)
        await dateCell.waitFor({ state: "visible", timeout: 5000 });

        // Obtener el texto de la celda de manera segura
        const dateText = await dateCell.textContent();
        const trimmedDateText = dateText ? dateText.trim() : ""; // Manejo de null/undefined

        console.log(
          `✅ Row ${i + 1}: Expected ${text}, Found ${trimmedDateText}`
        );

        // Check if the value matches the expected value
        if (trimmedDateText !== text) {
          console.error(
            `❌ Mismatch at row ${
              i + 1
            }: Expected ${text}, but found ${trimmedDateText}`
          );
          hasErrors = true;
        }
      }

      // If any error is found, throw an exception to stop the test
      if (hasErrors) {
        throw new Error(
          "❌ Data validation failed: Some values do not match the expected value."
        );
      }

      console.log("✅ All table values match the expected value.");
    } catch (error: any) {
      console.error(`🚨 Error in verifyTableColumnValues: ${error.message}`);
      throw error; // Re-throw the error to stop the test execution
    }
  }

  async testSearchGrid() {
    await this.page.pause();
    const randomValue = await this.searchTextInGrid();
    if (!randomValue) {
      console.log("⚠️ No se pudo seleccionar un valor aleatorio de la tabla.");
      return;
    }
    await this.searchGrid(randomValue.value, randomValue.column);
    //await this.searchGrid('OT - OficinaTest', 1);
    await this.verifyTableColumnValues(randomValue.value, randomValue.column);
  }

  // METODO DE ESPERA

  /**
   * Espera hasta que no haya peticiones de red activas en la página.
   * @param {number} timeout - Tiempo máximo de espera en milisegundos (por defecto 5000 ms).
   */
  async waitForNoActiveRequests(timeout = 5000) {
    try {
      await this.page.waitForLoadState("networkidle", { timeout });
      console.log("✅ No hay peticiones de red activas.");
    } catch (error) {
      console.log(
        "⚠️ Se alcanzó el tiempo máximo de espera, pero aún hay peticiones activas."
      );
    }
  }

  //#TODO CREAR METODO DE ESPERA CUANDO ESTA EL SPINNER.
  async waitForSpinner() {
    try {
      await this.page.waitForSelector(".dx-loadpanel-content", {
        state: "hidden",
      });
      console.log("✅ Spinner is hidden.");
    } catch (error) {
      console.log("❌ Spinner is still visible.");
    }
  }
}
