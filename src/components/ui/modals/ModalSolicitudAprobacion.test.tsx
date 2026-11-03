import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { ModalSolicitudAprobacion } from "./ModalSolicitudAprobacion";
import * as api from "../../../services/approval.service";
jest.mock("axios", () => ({
  isAxiosError: (error: any) => !!error?.isAxiosError,
}));
jest.mock("../../../services/approval.service", () => ({
  getApprovalDetail: jest.fn(),
  getApprovalFlow: jest.fn(),
  getApprovalAreas: jest.fn(),
  reviewApprovalArea: jest.fn(),
  updateApprovalArea: jest.fn(),
  decideApprovalAreas: jest.fn(),
}));
jest.mock("notistack", () => ({ enqueueSnackbar: jest.fn() }));
const service = api as jest.Mocked<typeof api>;
const ok = (data: any) =>
  ({
    data: { baseResponse: { idTipoMensaje: 2, mensaje: "Correcto" }, data },
  }) as any;
let version = 1;
let requestType = "INGRESO";
let states: Record<string, string>;
const names = ["FMI", "EQUIPO", "CREDENCIALES"];
const load = () => {
  service.getApprovalDetail.mockImplementation(async (id) =>
    ok({
      idSolicitud: id,
      tipoSolicitud: requestType,
      estado: "PENDIENTE",
      cliente: "Cliente de prueba",
      nombreTalento: "Talento de prueba",
      usuarioSolicitante: "solicitante",
      fechaSolicitud: "2026-11-02 10:00",
      datosFormulario: "{}",
    }),
  );
  service.getApprovalFlow.mockResolvedValue(ok({ historial: [] }));
  service.getApprovalAreas.mockImplementation(async () =>
    ok({
      version,
      puedeGestionar: true,
      revisadas: [],
      areas: names.map((area) => ({
        area,
        estado: states[area],
        fechaResolucion: null,
        usuario: null,
        datos: area === "FMI" ? { cargo: "Analista" } : {},
        camposEditables:
          area === "FMI"
            ? [{ campo: "cargo", etiqueta: "Cargo", tipo: "TEXTO" }]
            : [],
      })),
    }),
  );
  service.reviewApprovalArea.mockResolvedValue(ok(null));
  service.decideApprovalAreas.mockResolvedValue(ok({ estado: "PENDIENTE" }));
  service.updateApprovalArea.mockResolvedValue(ok({ estado: "PENDIENTE" }));
};
const props = {
  idSolicitud: 101,
  onClose: jest.fn(),
  onSessionExpired: jest.fn(),
  onChanged: jest.fn(),
};
beforeEach(() => {
  jest.clearAllMocks();
  version = 1;
  requestType = "INGRESO";
  states = { FMI: "PENDIENTE", EQUIPO: "PENDIENTE", CREDENCIALES: "PENDIENTE" };
  load();
});
const visit = async (label: string) => {
  fireEvent.click(screen.getByRole("tab", { name: new RegExp(label) }));
  await waitFor(() =>
    expect(service.reviewApprovalArea).toHaveBeenLastCalledWith(
      101,
      label === "Equipo"
        ? "EQUIPO"
        : label === "Credenciales"
          ? "CREDENCIALES"
          : "FMI",
      version,
    ),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Aprobar esta área" }),
    ).not.toBeDisabled(),
  );
};
test("confirmar todo exige visitar las tres pestañas y envía solo las áreas pendientes", async () => {
  render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  expect(screen.getByRole("button", { name: "Confirmar todo" })).toBeDisabled();
  await visit("Equipo");
  expect(screen.getByRole("button", { name: "Confirmar todo" })).toBeDisabled();
  await visit("Credenciales");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Confirmar todo" }),
    ).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Confirmar todo" }));
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Confirmar",
    }),
  );
  await waitFor(() =>
    expect(service.decideApprovalAreas).toHaveBeenCalledWith(
      101,
      1,
      names,
      "APROBAR",
      "",
      true,
    ),
  );
});
test("selección de dos áreas no aprueba la tercera", async () => {
  render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeDisabled());
  fireEvent.click(screen.getByRole("checkbox"));
  await visit("Equipo");
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmar selección (2)" }),
  );
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Confirmar",
    }),
  );
  await waitFor(() =>
    expect(service.decideApprovalAreas).toHaveBeenCalledWith(
      101,
      1,
      ["FMI", "EQUIPO"],
      "APROBAR",
      "",
      false,
    ),
  );
});
test("desaprobar exige motivo y confirma solo el área actual", async () => {
  render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Desaprobar" }),
    ).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Desaprobar" }));
  const alert = within(screen.getByRole("alertdialog"));
  expect(alert.getByRole("button", { name: "Desaprobar" })).toBeDisabled();
  fireEvent.change(alert.getByRole("textbox", { name: "Motivo" }), {
    target: { value: "Corregir información" },
  });
  fireEvent.click(alert.getByRole("button", { name: "Desaprobar" }));
  await waitFor(() =>
    expect(service.decideApprovalAreas).toHaveBeenCalledWith(
      101,
      1,
      ["FMI"],
      "RECHAZAR",
      "Corregir información",
      false,
    ),
  );
});
test("corregir bloquea la aprobación hasta guardar", async () => {
  render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  fireEvent.change(screen.getByRole("textbox", { name: "Cargo" }), {
    target: { value: "Analista senior" },
  });
  expect(screen.getByRole("button", { name: "Confirmar todo" })).toBeDisabled();
  expect(screen.getByRole("tab", { name: /Equipo/ })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Guardar corrección" }));
  await waitFor(() =>
    expect(service.updateApprovalArea).toHaveBeenCalledWith(101, "FMI", 1, {
      cargo: "Analista senior",
    }),
  );
  expect(service.decideApprovalAreas).not.toHaveBeenCalled();
});
test("cambio de solicitud reinicia pestañas revisadas y selección", async () => {
  const view = render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  await visit("Equipo");
  await visit("Credenciales");
  view.rerender(<ModalSolicitudAprobacion {...props} idSolicitud={102} />);
  await waitFor(() =>
    expect(service.getApprovalAreas).toHaveBeenLastCalledWith(102),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Confirmar todo" }),
    ).toBeDisabled(),
  );
});

test("movimiento muestra solo FMI y permite confirmar tras revisarlo", async () => {
  requestType = "MOVIMIENTO";
  states = { FMI: "PENDIENTE", EQUIPO: "NO_APLICA", CREDENCIALES: "NO_APLICA" };
  render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  expect(screen.getAllByRole("tab")).toHaveLength(1);
  expect(screen.queryByRole("tab", { name: /Equipo/ })).not.toBeInTheDocument();
  expect(
    screen.queryByRole("tab", { name: /Credenciales/ }),
  ).not.toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Confirmar todo" }),
    ).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Confirmar todo" }));
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Confirmar",
    }),
  );
  await waitFor(() =>
    expect(service.decideApprovalAreas).toHaveBeenCalledWith(
      101,
      1,
      ["FMI"],
      "APROBAR",
      "",
      true,
    ),
  );
});
test("una solicitud solo de equipo abre directamente Equipo", async () => {
  requestType = "ASIGNACION_EQUIPO";
  states = { FMI: "NO_APLICA", EQUIPO: "PENDIENTE", CREDENCIALES: "NO_APLICA" };
  render(<ModalSolicitudAprobacion {...props} />);
  await screen.findByText("Talento de prueba");
  expect(screen.getByRole("tab", { name: /Equipo/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getAllByRole("tab")).toHaveLength(1);
});
