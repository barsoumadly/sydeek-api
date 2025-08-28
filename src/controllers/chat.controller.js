import { generateStreamToken } from "../lib/stream.js";

const getStreamToken = async function (request, response) {
  try {
    const token = await generateStreamToken(request.user.id);

    response.status(200).json({ success: true, token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    response.status(500).json({ message: "Internal Server Error" });
  }
};

export { getStreamToken };
