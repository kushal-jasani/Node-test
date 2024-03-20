import { expect } from "chai";

// const {expect}=require('chai')
import sinon from "sinon";
// const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/is-auth");
// import * as authMiddleware from "../middleware/is-auth";

describe("auth middleware", function () {
  it("should throw error is no authorization header is present", function () {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "not authenticated"
    );
  });

  it("should throw error if no authorization header is only one string", function () {
    const req = {
      get: function (headerName) {
        return "xyz ";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("shoud yield userid after decoding token", function () {
    const req = {
      get: function (headerName) {
        return "Bearer vfgbgbhrt";
      },
    };
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId ");
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });

  it("shoud throw error if token is cannot verified ", function () {
    const req = {
      get: function (headerName) {
        return "Bearer xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
