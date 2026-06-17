/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ParticipationRole } from "@prisma/client";

const mockFilesList = vi.fn();
const mockFilesCreate = vi.fn();
const mockSpreadsheetsGet = vi.fn();
const mockSpreadsheetsBatchUpdate = vi.fn();

vi.mock("googleapis", () => {
  const Drive = vi.fn(() => ({
    files: {
      list: mockFilesList,
      create: mockFilesCreate,
    },
  }));

  const Sheets = vi.fn(() => ({
    spreadsheets: {
      get: mockSpreadsheetsGet,
      batchUpdate: mockSpreadsheetsBatchUpdate,
    },
  }));

  return {
    Auth: {
      OAuth2Client: vi.fn(() => ({})),
    },
    drive_v3: { Drive },
    sheets_v4: { Sheets },
  };
});

vi.mock("@/lib/oauth", () => ({
  getAccessToken: vi.fn().mockResolvedValue("fake-token"),
}));

vi.mock("@/lib/ofmi", () => ({
  findParticipants: vi.fn().mockResolvedValue([]),
  friendlyOfmiName: vi.fn((edition: number) => `OFMI-${edition}`),
}));

vi.mock("@/lib/venue", () => ({
  findAllVenueQuotas: vi.fn().mockResolvedValue([]),
  findAllParticipantsInVenueQuotas: vi.fn().mockResolvedValue([]),
  findParticipantsWithoutVenue: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/config/default", () => ({
  default: { GDRIVE_OFMI_ROOT_FOLDER: "root-folder-id" },
}));

vi.mock("@/lib/cache", () => {
  return {
    TTLCache: vi.fn(() => ({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    })),
  };
});

function setupDriveMocks(spreadsheetId: string): void {
  mockFilesList.mockResolvedValue({
    data: { files: [{ id: spreadsheetId }] },
  });
}

describe("spreadsheetURL", () => {
  it("returns the correct Google Sheets URL", async () => {
    const { spreadsheetURL } = await import("@/lib/gcloud");
    expect(spreadsheetURL("abc123")).toBe(
      "https://docs.google.com/spreadsheets/d/abc123",
    );
  });
});

describe("getGoogleAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an OAuth2Client with the access token", async () => {
    const { getGoogleAuth } = await import("@/lib/gcloud");
    const { getAccessToken } = await import("@/lib/oauth");

    vi.mocked(getAccessToken).mockResolvedValue("my-token");

    const auth = await getGoogleAuth("user-123");
    expect(getAccessToken).toHaveBeenCalledWith("user-123", "GCLOUD");
    expect(auth).toBeDefined();
  });
});

describe("getOrCreateDriveFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a Drive folder URL when folder exists", async () => {
    const { getOrCreateDriveFolder } = await import("@/lib/gcloud");

    mockFilesList.mockResolvedValue({
      data: { files: [{ id: "folder-abc" }] },
    });

    const url = await getOrCreateDriveFolder({
      userAuthId: "user-1",
      dir: "myFolder",
      rootFolderId: "root-123",
    });

    expect(url).toBe("https://drive.google.com/drive/folders/folder-abc");
  });

  it("creates nested folders recursively", async () => {
    const { getOrCreateDriveFolder } = await import("@/lib/gcloud");

    mockFilesList
      .mockResolvedValueOnce({ data: { files: [{ id: "level1-id" }] } })
      .mockResolvedValueOnce({ data: { files: [{ id: "level2-id" }] } })
      .mockResolvedValueOnce({ data: { files: [{ id: "level3-id" }] } });

    const url = await getOrCreateDriveFolder({
      userAuthId: "user-1",
      dir: "a/b/c",
      rootFolderId: "root-123",
    });

    expect(url).toBe("https://drive.google.com/drive/folders/level3-id");
    expect(mockFilesList).toHaveBeenCalledTimes(3);
  });

  it("creates a folder when it does not exist", async () => {
    const { getOrCreateDriveFolder } = await import("@/lib/gcloud");

    mockFilesList.mockResolvedValue({ data: { files: [] } });
    mockFilesCreate.mockResolvedValue({ data: { id: "new-folder-id" } });

    const url = await getOrCreateDriveFolder({
      userAuthId: "user-1",
      dir: "newFolder",
      rootFolderId: "root-123",
    });

    expect(url).toBe("https://drive.google.com/drive/folders/new-folder-id");
    expect(mockFilesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          name: "newFolder",
          parents: ["root-123"],
        }),
      }),
    );
  });

  it("returns root folder URL when dir is empty", async () => {
    const { getOrCreateDriveFolder } = await import("@/lib/gcloud");

    const url = await getOrCreateDriveFolder({
      userAuthId: "user-1",
      dir: "",
      rootFolderId: "root-123",
    });

    expect(url).toBe("https://drive.google.com/drive/folders/root-123");
    expect(mockFilesList).not.toHaveBeenCalled();
  });

  it("throws when files.list returns no files property", async () => {
    const { getOrCreateDriveFolder } = await import("@/lib/gcloud");

    mockFilesList.mockResolvedValue({ data: {} });

    await expect(
      getOrCreateDriveFolder({
        userAuthId: "user-1",
        dir: "folder",
        rootFolderId: "root-123",
      }),
    ).rejects.toThrow("findOrCreateResource -> not files");
  });

  it("throws when created file has no id", async () => {
    const { getOrCreateDriveFolder } = await import("@/lib/gcloud");

    mockFilesList.mockResolvedValue({ data: { files: [] } });
    mockFilesCreate.mockResolvedValue({ data: { id: null } });

    await expect(
      getOrCreateDriveFolder({
        userAuthId: "user-1",
        dir: "folder",
        rootFolderId: "root-123",
      }),
    ).rejects.toThrow("findOrCreateResource -> not folderId");
  });
});

describe("getOrCreateSheets (via exportParticipants)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reuses existing sheets by name without calling addSheet", async () => {
    const { exportParticipants } = await import("@/lib/gcloud");

    setupDriveMocks("spreadsheet-123");

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 10, title: ParticipationRole.CONTESTANT } },
          { properties: { sheetId: 20, title: ParticipationRole.VOLUNTEER } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValue({ data: {} });

    await exportParticipants({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "test/spreadsheet",
    });

    const batchUpdateCalls = mockSpreadsheetsBatchUpdate.mock.calls;
    const getOrCreateCall = batchUpdateCalls.find(
      (call) => call[0]?.requestBody?.requests?.[0]?.addSheet,
    );
    expect(getOrCreateCall).toBeUndefined();
  });

  it("adds only missing sheets when some already exist", async () => {
    const { exportParticipants } = await import("@/lib/gcloud");

    setupDriveMocks("spreadsheet-456");

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 10, title: ParticipationRole.CONTESTANT } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValueOnce({
      data: {
        replies: [{ addSheet: { properties: { sheetId: 30 } } }],
      },
    });
    mockSpreadsheetsBatchUpdate.mockResolvedValueOnce({ data: {} });

    await exportParticipants({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "test/spreadsheet",
    });

    const firstBatchCall = mockSpreadsheetsBatchUpdate.mock.calls[0];
    const requests = firstBatchCall[0]?.requestBody?.requests;
    expect(requests).toHaveLength(1);
    expect(requests[0].addSheet.properties.title).toBe(
      ParticipationRole.VOLUNTEER,
    );
  });

  it("creates all sheets when none exist", async () => {
    const { exportParticipants } = await import("@/lib/gcloud");

    setupDriveMocks("spreadsheet-789");

    mockSpreadsheetsGet.mockResolvedValue({
      data: { sheets: [] },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValueOnce({
      data: {
        replies: [
          { addSheet: { properties: { sheetId: 40 } } },
          { addSheet: { properties: { sheetId: 50 } } },
        ],
      },
    });
    mockSpreadsheetsBatchUpdate.mockResolvedValueOnce({ data: {} });

    await exportParticipants({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "test/spreadsheet",
    });

    const firstBatchCall = mockSpreadsheetsBatchUpdate.mock.calls[0];
    const requests = firstBatchCall[0]?.requestBody?.requests;
    expect(requests).toHaveLength(2);
    expect(requests[0].addSheet.properties.title).toBe(
      ParticipationRole.CONTESTANT,
    );
    expect(requests[1].addSheet.properties.title).toBe(
      ParticipationRole.VOLUNTEER,
    );
  });

  it("does not fail when sheets exist in different order", async () => {
    const { exportParticipants } = await import("@/lib/gcloud");

    setupDriveMocks("spreadsheet-order");

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 20, title: ParticipationRole.VOLUNTEER } },
          { properties: { sheetId: 10, title: ParticipationRole.CONTESTANT } },
          { properties: { sheetId: 99, title: "SomeOtherSheet" } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValue({ data: {} });

    await expect(
      exportParticipants({
        userAuthId: "user-1",
        ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
        spreadsheetName: "test/spreadsheet",
      }),
    ).resolves.toBe("spreadsheet-order");
  });
});

describe("exportParticipants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pastes contestant and volunteer data to the correct sheets", async () => {
    const { exportParticipants } = await import("@/lib/gcloud");
    const { findParticipants } = await import("@/lib/ofmi");

    setupDriveMocks("spreadsheet-data");

    vi.mocked(findParticipants).mockResolvedValue([
      {
        user: {
          firstName: "Ana",
          lastName: "Lopez",
          email: "ana@test.com",
          mailingAddress: { phone: "555" },
          pronouns: "SHE",
          birthDate: "2005-01-15T00:00:00Z",
          shirtSize: "M",
          shirtStyle: "Fitted",
        },
        userParticipation: {
          role: "CONTESTANT",
          schoolGrade: 3,
          schoolState: "CDMX",
          schoolName: "Escuela Test",
        },
        registeredAt: "2024-01-01T00:00:00Z",
        deletedAt: null,
      },
      {
        user: {
          firstName: "Carlos",
          lastName: "Garcia",
          email: "carlos@test.com",
          mailingAddress: { phone: "666" },
          pronouns: "HE",
          birthDate: "1990-05-20T00:00:00Z",
          shirtSize: "L",
          shirtStyle: "Regular",
        },
        userParticipation: {
          role: "VOLUNTEER",
          communityOptIn: true,
          educationalLinkageOptIn: false,
          fundraisingOptIn: true,
          trainerOptIn: false,
          problemSetterOptIn: true,
          mentorOptIn: true,
        },
        registeredAt: "2024-01-02T00:00:00Z",
        deletedAt: null,
      },
    ] as any);

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 1, title: ParticipationRole.CONTESTANT } },
          { properties: { sheetId: 2, title: ParticipationRole.VOLUNTEER } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValue({ data: {} });

    const result = await exportParticipants({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "test/spreadsheet",
    });

    expect(result).toBe("spreadsheet-data");

    const pasteCall = mockSpreadsheetsBatchUpdate.mock.calls.find(
      (call) => call[0]?.requestBody?.requests?.[0]?.pasteData,
    );
    expect(pasteCall).toBeDefined();
    const requests = pasteCall![0].requestBody.requests;
    expect(requests).toHaveLength(2);
    expect(requests[0].pasteData.coordinate.sheetId).toBe(1);
    expect(requests[1].pasteData.coordinate.sheetId).toBe(2);
    expect(requests[0].pasteData.data).toContain("Ana");
    expect(requests[1].pasteData.data).toContain("Carlos");
  });

  it("handles the spreadsheet file being nested in directories", async () => {
    const { exportParticipants } = await import("@/lib/gcloud");

    // getOrCreateFile: dir1 -> dir2 -> mySheet file
    // listFolderChildren: OFMI-1 -> Assets -> Participants -> list children
    mockFilesList.mockResolvedValue({
      data: { files: [{ id: "resolved-id" }] },
    });

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 1, title: ParticipationRole.CONTESTANT } },
          { properties: { sheetId: 2, title: ParticipationRole.VOLUNTEER } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValue({ data: {} });

    const result = await exportParticipants({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "dir1/dir2/mySheet",
    });

    expect(result).toBe("resolved-id");
    // dir1, dir2, mySheet file, then OFMI-1, Assets, Participants, list children
    expect(mockFilesList.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});

describe("exportVenueInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reuses existing venue sheets by name", async () => {
    const { exportVenueInfo } = await import("@/lib/gcloud");

    setupDriveMocks("venue-spreadsheet");

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 1, title: "SedesParticipantes" } },
          { properties: { sheetId: 2, title: "Sin sede" } },
          { properties: { sheetId: 3, title: "SedesCupos" } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValue({ data: {} });

    await exportVenueInfo({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "test/venue-spreadsheet",
    });

    const addSheetCall = mockSpreadsheetsBatchUpdate.mock.calls.find(
      (call) => call[0]?.requestBody?.requests?.[0]?.addSheet,
    );
    expect(addSheetCall).toBeUndefined();
  });

  it("pastes venue data to the correct sheets", async () => {
    const { exportVenueInfo } = await import("@/lib/gcloud");
    const {
      findAllVenueQuotas,
      findAllParticipantsInVenueQuotas,
      findParticipantsWithoutVenue,
    } = await import("@/lib/venue");

    setupDriveMocks("venue-data-sheet");

    vi.mocked(findAllVenueQuotas).mockResolvedValue([
      { id: "vq-1", venue: { name: "Sede CDMX" }, capacity: 50, occupied: 10 },
    ] as any);

    vi.mocked(findAllParticipantsInVenueQuotas).mockResolvedValue([
      {
        firstName: "Maria",
        lastName: "Ruiz",
        email: "maria@test.com",
        venueQuotaId: "vq-1",
      },
    ] as any);

    vi.mocked(findParticipantsWithoutVenue).mockResolvedValue([
      {
        firstName: "Pedro",
        lastName: "Sanchez",
        email: "pedro@test.com",
        deletedAt: null,
      },
    ] as any);

    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          { properties: { sheetId: 10, title: "SedesParticipantes" } },
          { properties: { sheetId: 11, title: "Sin sede" } },
          { properties: { sheetId: 12, title: "SedesCupos" } },
        ],
      },
    });

    mockSpreadsheetsBatchUpdate.mockResolvedValue({ data: {} });

    const result = await exportVenueInfo({
      userAuthId: "user-1",
      ofmi: { id: "ofmi-1", edition: 1, year: 2024 } as any,
      spreadsheetName: "test/venue",
    });

    expect(result).toBe("venue-data-sheet");

    const pasteCall = mockSpreadsheetsBatchUpdate.mock.calls.find(
      (call) => call[0]?.requestBody?.requests?.[0]?.pasteData,
    );
    expect(pasteCall).toBeDefined();
    const requests = pasteCall![0].requestBody.requests;
    expect(requests).toHaveLength(3);
    expect(requests[0].pasteData.coordinate.sheetId).toBe(10);
    expect(requests[0].pasteData.data).toContain("Maria");
    expect(requests[1].pasteData.coordinate.sheetId).toBe(11);
    expect(requests[1].pasteData.data).toContain("Pedro");
    expect(requests[2].pasteData.coordinate.sheetId).toBe(12);
    expect(requests[2].pasteData.data).toContain("Sede CDMX");
  });
});
