import { NextApiHandler } from "next";

const userApiHandler: NextApiHandler = async (req, res) => {
  try {
    throw Error("lol");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default userApiHandler;
