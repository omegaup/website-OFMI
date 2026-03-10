import { expect, describe, it } from "vitest";
import { jsonToCsv } from "@/utils";

describe("jsonToCsv", () => {
  it("simple json object", () => {
    const json = [
      { name: "Juan", email: "juanito@omegaup.com" },
      { name: "Jose", email: "josito@omegaup.com" },
    ];
    const csv = jsonToCsv(json);
    expect(csv.split("\n").map((line) => line.trim().split(","))).toMatchObject(
      [
        ["name", "email"],
        ["Juan", "juanito@omegaup.com"],
        ["Jose", "josito@omegaup.com"],
      ],
    );
  });

  it("complex json object", () => {
    const json = [{ key: 'This has a "2006-06-07" date' }];
    const csv = jsonToCsv(json);
    expect(csv.split("\n").map((line) => line.trim().split(","))).toMatchObject(
      [["key"], ['"This has a ""2006-06-07"" date"']],
    );
  });

  it("another complex json object 1", () => {
    const json = [{ key: 'This has a "2006-06-07" date and a , here' }];
    const csv = jsonToCsv(json);
    expect(csv.split("\n").map((line) => line.trim())).toMatchObject([
      "key",
      '"This has a ""2006-06-07"" date and a , here"',
    ]);
  });

  it("another complex json object 2", () => {
    const json = [{ key: "This has a , here" }];
    const csv = jsonToCsv(json);
    expect(csv.split("\n").map((line) => line.trim())).toMatchObject([
      "key",
      '"This has a , here"',
    ]);
  });

  it("empty", () => {
    const csv = jsonToCsv([]);
    expect(csv.split("\n").map((line) => line.trim().split(","))).toMatchObject(
      [[""]],
    );
  });
});
