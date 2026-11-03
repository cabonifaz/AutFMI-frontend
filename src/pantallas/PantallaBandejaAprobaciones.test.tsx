import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PantallaBandejaAprobaciones } from "./PantallaBandejaAprobaciones";
import { getApprovalInbox } from "../services/approval.service";
jest.mock("axios", () => ({ isAxiosError: () => false }));
jest.mock(
  "react-router-dom",
  () => ({ useNavigate: () => jest.fn(), useParams: () => ({}) }),
  { virtual: true },
);
jest.mock("notistack", () => ({ enqueueSnackbar: jest.fn() }));
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ logout: jest.fn() }),
}));
jest.mock("../context/MenuContext", () => ({
  useMenu: () => ({ toggleMenu: jest.fn() }),
}));
jest.mock("./PantallaWrapper", () => ({
  PantallaWrapper: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("../components/ui/modals/ModalSolicitudAprobacion", () => ({
  ModalSolicitudAprobacion: () => null,
}));
jest.mock("../services/approval.service", () => ({
  getApprovalInbox: jest.fn(),
}));
const get = getApprovalInbox as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue({
    data: {
      baseResponse: { idTipoMensaje: 2 },
      data: {
        clientes: [],
        solicitudes: { items: [], totalPages: 0, totalElements: 0 },
      },
    },
  });
});
test("encabezados en orden e inicio limitado a pendientes", async () => {
  render(<PantallaBandejaAprobaciones />);
  await waitFor(() => expect(get).toHaveBeenCalled());
  expect(get.mock.calls[0][0]).toEqual({
    idCliente: null,
    tipoSolicitud: null,
    estado: "PENDIENTE",
    busqueda: null,
  });
  expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(
    [
      "N°",
      "Tipo",
      "Talento",
      "Resumen",
      "Solicitado por",
      "Fecha",
      "Tiempo",
      "Acciones",
    ],
  );
  expect(
    screen.getByText(/Busca para consultar el histórico/),
  ).toBeInTheDocument();
});
test("solo la búsqueda permite consultar histórico y limpiar vuelve a pendientes", async () => {
  render(<PantallaBandejaAprobaciones />);
  await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "Solicitud resuelta" } });
  fireEvent.keyDown(input, { key: "Enter" });
  await waitFor(() =>
    expect(get).toHaveBeenLastCalledWith(
      expect.objectContaining({ busqueda: "Solicitud resuelta", estado: null }),
      1,
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  await waitFor(() =>
    expect(get).toHaveBeenLastCalledWith(
      expect.objectContaining({ busqueda: null, estado: "PENDIENTE" }),
      1,
    ),
  );
});

test("no ofrece solicitud independiente de credenciales y expande resumen y fecha", async () => {
  const summary =
    "Resumen extenso de una solicitud de ingreso que contiene toda la información de negocio para revisar sin ensanchar la tabla.";
  get.mockResolvedValue({
    data: {
      baseResponse: { idTipoMensaje: 2 },
      data: {
        clientes: [],
        solicitudes: {
          items: [
            {
              idSolicitud: 12,
              tipoSolicitud: "INGRESO",
              estado: "PENDIENTE",
              nombreTalento: "Talento",
              resumen: summary,
              usuarioSolicitante: "Solicitante",
              fechaSolicitud: "2026-11-02 13:05",
            },
          ],
          totalPages: 1,
          totalElements: 1,
        },
      },
    },
  });
  render(<PantallaBandejaAprobaciones />);
  await screen.findByRole("button", { name: "Ver resumen completo" });
  expect(
    screen.queryByRole("button", { name: /Solicitar credenciales/ }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(summary)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Ver resumen completo" }));
  expect(screen.getByText(summary)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Contraer resumen" }));
  expect(screen.queryByText(summary)).not.toBeInTheDocument();
  expect(screen.queryByText("02-11-2026 01:05 pm")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Ver fecha completa" }));
  expect(screen.getByText("02-11-2026 01:05 pm")).toBeInTheDocument();
});
