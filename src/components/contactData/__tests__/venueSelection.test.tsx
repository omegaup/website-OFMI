import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { VenueSelection } from "../venueSelection";
import useSWR from "swr";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

global.fetch = vi.fn();

const mockVenues = [
  {
    id: "vq1",
    venueId: "v1",
    ofmiId: "o1",
    capacity: 50,
    occupied: 10,
    venue: {
      id: "v1",
      name: "Sede Norte",
      address: "Calle Norte 1",
      state: "Nuevo León",
      googleMapsUrl: "http://maps.google.com",
    },
  },
  {
    id: "vq2",
    venueId: "v2",
    ofmiId: "o1",
    capacity: 20,
    occupied: 0,
    venue: {
      id: "v2",
      name: "Sede Sur",
      address: "Calle Sur 2",
      state: "CDMX",
      googleMapsUrl: null,
    },
  },
];

describe("VenueSelection Component", () => {
  const mockSetSelectedVenueId = vi.fn();

  it("renders loading state", () => {
    (useSWR as Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    render(
      <VenueSelection
        ofmiEdition={1}
        selectedVenueId=""
        setSelectedVenueId={mockSetSelectedVenueId}
      />,
    );
    expect(screen.getByText(/Cargando sedes/i)).toBeDefined();
  });

  it("renders venues sorted alphabetically by state by default", () => {
    (useSWR as Mock).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(
      <VenueSelection
        ofmiEdition={1}
        selectedVenueId=""
        setSelectedVenueId={mockSetSelectedVenueId}
      />,
    );

    expect(screen.getByText("Sede de Participación")).toBeDefined();

    const select = screen.getByLabelText("Sedes Disponibles") as HTMLSelectElement;
    const options = Array.from(select.options);

    expect(options).toHaveLength(3);

    expect(options[1].text).toContain("CDMX - Sede Sur");
    expect(options[2].text).toContain("Nuevo León - Sede Norte");
  });

  it("renders venues sorted alphabetically in updateContactData", () => {
    (useSWR as Mock).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(
      <VenueSelection
        ofmiEdition={1}
        subtitle="Sede Seleccionada"
        selectedVenueId=""
        setSelectedVenueId={mockSetSelectedVenueId}
      />,
    );

    expect(screen.getByText("Sede Seleccionada")).toBeDefined();

    const select = screen.getByLabelText("Sede Seleccionada") as HTMLSelectElement;
    const options = Array.from(select.options);

    expect(options).toHaveLength(3);

    expect(options[1].text).toContain("CDMX - Sede Sur");
    expect(options[2].text).toContain("Nuevo León - Sede Norte");
  });

  it("calls setSelectedVenueId when a venue is selected", () => {
    (useSWR as Mock).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(
      <VenueSelection
        ofmiEdition={1}
        selectedVenueId=""
        setSelectedVenueId={mockSetSelectedVenueId}
      />,
    );

    const select = screen.getByLabelText("Sedes Disponibles");

    fireEvent.change(select, { target: { value: "vq2" } });

    expect(mockSetSelectedVenueId).toHaveBeenCalledWith("vq2");
  });

  it("shows venue details when selectedVenueId matches a venue", () => {
    (useSWR as Mock).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    // Simulamos que el ID ya está seleccionado (estado controlado por el padre)
    render(
      <VenueSelection
        ofmiEdition={1}
        selectedVenueId="vq2"
        setSelectedVenueId={mockSetSelectedVenueId}
      />,
    );

    expect(screen.getByText("Detalles de la Sede")).toBeDefined();
    expect(screen.getByText(/Calle Sur 2/)).toBeDefined();
    expect(screen.queryByText("Ver en Google Maps")).toBeNull();
  });

  it("shows map link if available", () => {
    (useSWR as Mock).mockReturnValue({
      data: { venues: mockVenues },
      error: undefined,
      isLoading: false,
    });

    render(
      <VenueSelection
        ofmiEdition={1}
        selectedVenueId="vq1"
        setSelectedVenueId={mockSetSelectedVenueId}
      />,
    );

    expect(screen.getByText("Ver en Google Maps")).toBeDefined();
  });
});
