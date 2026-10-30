import { render, screen, within } from "@testing-library/react";
import { ContractsTabs } from "./ContractsTab";
import { Contract, EmployeeResponseDetail } from "../../../../../models/response/EmployeeDetailResponse";

jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock("../../../../../hooks/useHistory", () => ({
  useHistory: () => ({ isLoading: false, fetchHistoryFile: jest.fn() }),
}));

describe("FTBO-1123: solicitudes del contrato vigente", () => {
  it.each([
    [1, 1, "Sí", "Sí"],
    [0, 0, "No", "No"],
    [1, 0, "Sí", "No"],
    [0, 1, "No", "Sí"],
    [null, null, "Sin información", "Sin información"],
    [undefined, undefined, "Sin información", "Sin información"],
    [1, null, "Sí", "Sin información"],
    [null, 0, "Sin información", "No"],
  ])("SCTR=%s y EMO=%s", (sctr, emo, expectedSctr, expectedEmo) => {
    const contract = { contractId: 123, status: "ACTIVO", sctr, emo } as Contract;
    const details = { contracts: [contract] } as EmployeeResponseDetail;
    render(<ContractsTabs details={details} />);
    expect(screen.getByRole("columnheader", { name: "Solicitud SCTR" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Solicitud EMO" })).toBeInTheDocument();
    const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
    expect(cells[7]).toHaveTextContent(expectedSctr as string);
    expect(cells[8]).toHaveTextContent(expectedEmo as string);
  });

  it("permite expedientes sin contratos", () => {
    render(<ContractsTabs details={{ contracts: [] } as unknown as EmployeeResponseDetail} />);
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });
});