/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

// Initialisation
jest.mock("../app/Store", () => mockStore);
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeTruthy();
    });
  });
})

describe("Given I am connected as an employee", () => {
  //NEWBILLUI.js
  describe("When I am on a NewBill Page", () => {
    test("All Newbill's Page inputs should be empty", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const allInputs = document.getElementsByTagName("input").value;
      const CommentaryArea = document.getElementsByTagName("textarea").value;
      expect(allInputs && CommentaryArea).toBe(undefined);
    })
  })
})

 // test d'intégration POST
 describe("When I am on NewBill Page, I fill the form and submit", () => {
  test("Then the bill is added to API POST", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const bill = {
      email: "employee@test.tld",
      type: "Transports",
      name: "TGV",
      amount: 120,
      date: "2023-08-24",
      vat: "20",
      pct: 20,
      commentary: "Facture test",
      fileUrl: "testFacture.png",
      fileName: "testFacture",
      status: 'pending'
    };

    const typeForm = screen.getByTestId("expense-type");
    fireEvent.change(typeForm, { target: { value: bill.type } });
    expect(typeForm.value).toBe(bill.type);
    const nameForm = screen.getByTestId("expense-name");
    fireEvent.change(nameForm, { target: { value: bill.name } });
    expect(nameForm.value).toBe(bill.name);
    const dateForm = screen.getByTestId("datepicker");
    fireEvent.change(dateForm, { target: { value: bill.date } });
    expect(dateForm.value).toBe(bill.date);
    const quantityForm = screen.getByTestId("amount");
    fireEvent.change(quantityForm, { target: { value: bill.amount } });
    expect(parseInt(quantityForm.value)).toBe(parseInt(bill.amount));
    const tvaForm = screen.getByTestId("vat");
    fireEvent.change(tvaForm, { target: { value: bill.vat } });
    expect(parseInt(tvaForm.value)).toBe(parseInt(bill.vat));
    const pctForm = screen.getByTestId("pct");
    fireEvent.change(pctForm, { target: { value: bill.pct } });
    expect(parseInt(pctForm.value)).toBe(parseInt(bill.pct));
    const commentaryForm = screen.getByTestId("commentary");
    fireEvent.change(commentaryForm, { target: { value: bill.commentary } });
    expect(commentaryForm.value).toBe(bill.commentary);

    const newBillForm = screen.getByTestId("form-new-bill");
    const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

    const handleChangeFile = jest.fn(newBill.handleChangeFile);
    newBillForm.addEventListener("change", handleChangeFile);
    const docForm = screen.getByTestId("file");
    fireEvent.change(docForm, { target: { files: [ new File([bill.fileName], bill.fileUrl, { type: "image/png" }) ] } });
    expect(docForm.files[0].name).toBe(bill.fileUrl);
    expect(docForm.files[0].type).toBe("image/png");
    expect(handleChangeFile).toHaveBeenCalled();

    const handleSubmit = jest.fn(newBill.handleSubmit);
    newBillForm.addEventListener("submit", handleSubmit);
    fireEvent.submit(newBillForm);
    expect(handleSubmit).toHaveBeenCalled();
  });
});

