const isDirectChat = (room, user) => {
  let type = "room";
  // if (type === 'directMessage') {
  // state.sources[roomId].name = room.name.replace(/@(\w+):.+/, '$1');
  // }
  const allMembers = room.currentState.getMembers();
  if (
    type === "room" &&
    allMembers.length <= 2 &&
    allMembers.some(m => m.userId === user)
  ) {
    // if (
    // // allMembers.some(m => m.getDMInviter()) &&
    // ) {
    type = "directMessage";
    // }
  }

  return type === "directMessage";
};

export const getOrCreatePrivateRoom = async (client, event, alias = null) => {
  console.log("getting");
  const party = alias || event.getSender();

  let userRoom = client.getRooms().find(r => isDirectChat(r, party));
  let roomId;
  if (userRoom) roomId = userRoom.roomId;
  if (!userRoom) {
    const newChat = await client.createRoom({
      preset: "trusted_private_chat",
      invite: [party],
      is_direct: true,
    });
    roomId = newChat.room_id;
  }

  return roomId;
};
