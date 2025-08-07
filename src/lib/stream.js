import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

const upsertStreamUser = async function (UserData) {
  try {
    await streamClient.upsertUsers([UserData]);
    return UserData;
  } catch (error) {
    console.error("Error upserting stream user", error);
  }
};

const generateStreamToken = async function (userId) {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.log("Error generating stream token", error);
  }
};

export { upsertStreamUser, generateStreamToken };
