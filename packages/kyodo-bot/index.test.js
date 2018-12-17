import "babel-polyfill";
import { handleBalance } from "./";
import * as matrixHelpers from "./helpers/matrix";
import * as fromUser from "@kyodo/backend/user";
import * as fromTip from "@kyodo/backend/tip";

describe("command handleBalance", () => {
  it("works properly", async () => {
    const event = {
      getSender: jest.fn(() => "@sender:matrix.org"),
    };

    // mock get or create private room
    const roomId = "r00m1d";
    matrixHelpers.getOrCreatePrivateRoom = jest.fn(() => roomId);

    // mock getUserBalance
    const balance = {
      balance: 10,
      initialBalance: 100,
    };
    fromUser.getUserBalance = jest.fn(() => balance);

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

    // mock client sendTextMessage
    const sendTextMessage = jest.fn();
    const client = {
      sendTextMessage,
    };

    await handleBalance(
      event,
      {}, // passing empty room as we are mocking
      client,
    );

    expect(matrixHelpers.getOrCreatePrivateRoom.mock.calls.length).toBe(1);
    expect(sendTextMessage.mock.calls.length).toBe(1);
    expect(sendTextMessage.mock.calls[0][0]).toMatchSnapshot();
  });
});
