import "babel-polyfill";
import moment from "moment";
import { handleBalance } from "./";
import * as matrixHelpers from "./helpers/matrix";
import * as fromUser from "@kyodo/backend/user";
import * as fromTip from "@kyodo/backend/tip";
import * as fromPeriod from "@kyodo/backend/period";
import * as fromWeb3Periods from "@kyodo/backend/web3/periods";
import { ModelError } from "@kyodo/backend/errors";

const event = {
  getSender: jest.fn(() => "@sender:matrix.org"),
};

const roomId = "r00m1d";

const originalDbGetUserByAlias = fromUser.dbGetUserByAlias;

describe("command handleBalance works properly", () => {
  // mock dbGetUserByAlias
  const user = {};
  fromUser.dbGetUserByAlias = jest.fn(() => user);

  // mock getUserTips
  const tips = [
    {
      domain: "GOV",
      amount: 10,
    },
    {
      domain: "SOCIAL",
      amount: 30,
    },
  ];
  fromTip.getUserTips = jest.fn(() => tips);

  // mock periods getStartTime
  fromWeb3Periods.getStartTime = jest.fn(() =>
    moment()
      .subtract(1, "days")
      .format("X"),
  );

  // mock periods getPeriodDaysLength
  fromWeb3Periods.getPeriodDaysLength = jest.fn(() => 45);

  // mock periods getCurrentPeriodSummary
  fromPeriod.getCurrentPeriodSummary = jest.fn(() => ({
    periodTitle: "Age",
  }));

  let client;

  beforeEach(() => {
    // mock client sendTextMessage
    const sendTextMessage = jest.fn();
    client = {
      sendTextMessage,
    };

    // mock get or create private room
    matrixHelpers.getOrCreatePrivateRoom = jest.fn(() => roomId);
  });

  it("for existing user with positive balance", async () => {
    // mock getUserBalance
    const balance = {
      balance: 10,
      initialBalance: 100,
    };
    fromUser.getUserBalance = jest.fn(() => balance);

    await handleBalance(
      event,
      {}, // passing empty room as we are mocking
      client,
    );

    expect(matrixHelpers.getOrCreatePrivateRoom.mock.calls.length).toBe(1);
    expect(client.sendTextMessage.mock.calls.length).toBe(1);
    expect(client.sendTextMessage.mock.calls[0]).toMatchSnapshot();
  });
  it("for existing user with zero balance", async () => {
    // mock getUserBalance
    const balance = {
      balance: 0,
      initialBalance: 100,
    };
    fromUser.getUserBalance = jest.fn(() => balance);

    await handleBalance(
      event,
      {}, // passing empty room as we are mocking
      client,
    );

    expect(matrixHelpers.getOrCreatePrivateRoom.mock.calls.length).toBe(1);
    expect(client.sendTextMessage.mock.calls.length).toBe(1);
    expect(client.sendTextMessage.mock.calls[0]).toMatchSnapshot();
  });
  it("for new user", async () => {
    // mock getUserBalance
    const balance = {
      balance: 0,
      initialBalance: 0,
    };
    fromUser.getUserBalance = jest.fn(() => balance);

    await handleBalance(
      event,
      {}, // passing empty room as we are mocking
      client,
    );

    expect(matrixHelpers.getOrCreatePrivateRoom.mock.calls.length).toBe(1);
    expect(client.sendTextMessage.mock.calls.length).toBe(1);
    expect(client.sendTextMessage.mock.calls[0]).toMatchSnapshot();
  });
});

describe("command handleBalance works properly for non existing user", () => {
  // mock client sendTextMessage
  const sendTextMessage = jest.fn();
  const client = {
    sendTextMessage,
  };

  beforeAll(() => {
    fromUser.dbGetUserByAlias = jest.fn(alias => {
      throw new ModelError("Not found", "user", alias);
    });
    matrixHelpers.getOrCreatePrivateRoom = jest.fn(() => roomId);
  });
  afterAll(() => {
    fromUser.dbGetUserByAlias = originalDbGetUserByAlias;
  });

  it("with positive balance", async () => {
    // mock getUserBalance
    const balance = {
      balance: 10,
      initialBalance: 100,
    };
    fromUser.getUserBalance = jest.fn(() => balance);

    await handleBalance(
      event,
      {}, // passing empty room as we are mocking
      client,
    );

    expect(matrixHelpers.getOrCreatePrivateRoom.mock.calls.length).toBe(1);
    expect(sendTextMessage.mock.calls.length).toBe(1);
    expect(sendTextMessage.mock.calls[0]).toMatchSnapshot();
  });
});
