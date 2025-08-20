import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

const getRecommendedUsers = async function (request, response) {
  try {
    const userId = request.user._id;
    const currentUser = request.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    });

    response.status(200).json({ success: true, recommendedUsers });
  } catch (error) {
    console.log(`Error in getRcommendedUsers controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

const getMyFriends = async function (request, response) {
  try {
    const userId = request.user._id;
    const friends = await User.findById(userId)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePicture nativeLanguage learningLanguage"
      );

    response.status(200).json({ success: true, friends });
  } catch (error) {
    console.log(`Error in getRcommendedUsers controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

const sendFriendRequest = async function (request, response) {
  try {
    const currentUserId = request.user._id;
    const { id: recipientId } = request.params;

    if (currentUserId === recipientId) {
      return response
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(currentUserId);
    if (!recipient) {
      return response.status(404).json({ message: "No recipient found" });
    }

    if (recipient.friends.includes(currentUserId)) {
      return response
        .status(400)
        .json({ message: "You are already friend with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: recipientId },
        { sender: recipientId, recipient: currentUserId },
      ],
    });

    if (existingRequest) {
      return response.status(400).json({
        message:
          "A friend request is already exists between you and this user ",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: currentUserId,
      recipient: recipientId,
    });

    response.status(201).json({ success: true, friendRequest });
  } catch (error) {
    console.log(`Error in send friend request controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

const acceptFriendRequest = async function (request, response) {
  try {
    const requestId = request.params.id;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return response.status(404).json({
        message: "Friend request not found",
      });
    }

    if (friendRequest.recipient.toString() !== request.user._id) {
      return response.status(403).json({
        message: "You are not authorized to accept this request",
      });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    response
      .status(200)
      .json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    console.log(`Error in accept friend request controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

const getFriendRequests = async function (request, response) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: request.user._id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    const acceptedRequests = await FriendRequest.find({
      sender: request.user._id,
      status: "accepted",
    }).populate("recipient", "fullName profilePicture");

    response
      .status(200)
      .json({ status: "success", incomingRequests, acceptedRequests });
  } catch (error) {
    console.log(`Error in get requests controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

const getOutgoingFriendRequests = async function (request, response) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: request.user._id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    response.status(200).json({ success: true, outgoingRequests });
  } catch (error) {
    console.log(`Error in get outgoing friend requests controller ${error}`);
    response.status(500).json({ message: "Internal Sever Error" });
  }
};

export {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendRequests,
};
