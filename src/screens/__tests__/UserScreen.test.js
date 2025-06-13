import { render, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import AuthService from '../../services/AuthService';
import { Alert } from 'react-native';

jest.mock("../services/AuthService");


import { sortUsers } from "../path/to/UsersScreen"; 

describe("sortUsers", () => {
  test("sorts users in a way that followed users show first", () => {
    const users = [
      { id: 1, username: "aaa" },
      { id: 2, username: "bbb" },
      { id: 3, username: "ccc" },
    ];
    const followStatus = {
      2: true,
      3: true,
    };

    const sorted = sortUsers(users, followStatus);

    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(3);
    expect(sorted[2].id).toBe(1);
  });

  it("sorts alphabetically if there are no follows", () => {
    const users = [
      { id: 1, username: "bbb" },
      { id: 2, username: "aaa" },
    ];
    const followStatus = {};

    const sorted = sortUsers(users, followStatus);

    expect(sorted[0].username).toBe("aaa");
    expect(sorted[1].username).toBe("bbb");
  });
});



describe("UsersScreen loading and data fetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads the screen and shows users", async () => {
   
    AuthService.authenticatedFetch.mockImplementation((url) => {
      if (url.endsWith("/users")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, username: "user1" },
              { id: 2, username: "user2" },
            ]),
        });
      }
      if (url.endsWith("/users/friends/following")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1 }]),
        });
      }
      return Promise.resolve({ ok: false });
    });

    AuthService.getUserData.mockResolvedValue({ id: 99, username: "me" });

    const { getByTestId, queryByTestId, getByText } = render(
      <UsersScreen navigation={{ navigate: jest.fn() }} />
    );

    expect(getByTestId("loading-indicator")).toBeTruthy();

    await waitFor(() => {
      expect(queryByTestId("loading-indicator")).toBeNull();
      expect(getByText("user1")).toBeTruthy();
      expect(getByText("user2")).toBeTruthy();
    });
  });
});

