let t = require("./twcn-to-tw.js");

test("replace text", () => {
    expect(t.replaceText("Taiwan")).toBe("Taiwan");
});
