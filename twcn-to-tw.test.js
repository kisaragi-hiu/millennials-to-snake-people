let t = require("./twcn-to-tw.js");

test("-> Taiwan", () => {
    expect(t.replaceText("Taiwan")).toBe("Taiwan");
    expect(t.replaceText("Taiwan, China")).toBe("Taiwan");
    expect(t.replaceText("Taiwan, province of China")).toBe("Taiwan");
});

test("-> ROC", () => {
    expect(t.replaceText("China Taiwan")).toBe("ROC (Taiwan)");
    expect(t.replaceText("China, Taiwan")).toBe("ROC (Taiwan)");
    expect(t.replaceText("China, Republic of")).toBe("Taiwan (ROC)");
});
