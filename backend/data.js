import { User } from "./schema.js";

const users = [
  {
    email: "enezog@unvucrow.io",
    password: "3c435c20-53bb-5955-8999-1a42b1764c14",
    name: "Claudia Hunt",
  },
  {
    email: "wol@dib.me",
    password: "769b780b-39a3-5ea2-bc22-bf2ae76a7f02",
    name: "Jack Christensen",
  },
  {
    email: "okaeda@wi.sn",
    password: "2d030430-8b43-5c75-b3f7-d48e2f0d67a6",
    name: "Marion Bush",
  },
  {
    email: "vennios@la.pw",
    password: "464c92d4-2220-5f73-9c07-216e92f40f77",
    name: "Elizabeth Welch",
  },
  {
    email: "fesbopa@cezfotot.ml",
    password: "ad002903-5054-5c8f-a4a6-38919d8f4724",
    name: "Nelle Stanley",
  },
];

export async function addData() {
  const data = users.map(async (user) => {
    const val = await User.create(user);
    return val;
  });
  console.log("Users created: ", data);
}
