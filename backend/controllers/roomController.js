exports.validateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`Validating room: ${roomId}`);

    // Try to find by _id first
    let room = null;
    
    try {
      if (mongoose.Types.ObjectId.isValid(roomId)) {
        console.log(`Looking up room by _id: ${roomId}`);
        room = await Room.findById(roomId);
      }
    } catch (err) {
      console.error(`Error looking up room by _id: ${err.message}`);
    }
    
    // If not found, try by meetingId
    if (!room) {
      console.log(`Looking up room by meetingId: ${roomId}`);
      room = await Room.findOne({ meetingId: roomId });
    }

    if (!room) {
      console.log(`Room not found with id: ${roomId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Meeting not found or has expired' 
      });
    }

    // Check if room is active
    if (!room.active) {
      console.log(`Room ${roomId} is inactive`);
      return res.status(403).json({ 
        success: false, 
        message: 'This meeting is no longer active' 
      });
    }

    // Check if room requires passcode
    const requiresPasscode = !!room.passcode;
    
    // Check if organization restriction applies
    const restrictedToOrganization = !!room.organizationDomain;
    
    console.log(`Room validation successful for ${roomId}. Passcode required: ${requiresPasscode}, Organization restricted: ${restrictedToOrganization}`);
    
    // Don't send passcode in response
    return res.json({
      success: true,
      roomId: room._id.toString(),
      meetingId: room.meetingId,
      title: room.title,
      requiresPasscode,
      restrictedToOrganization,
      organizationDomain: restrictedToOrganization ? room.organizationDomain : null,
      hostId: room.hostId?.toString(),
      createdAt: room.createdAt
    });
  } catch (err) {
    console.error(`Room validation error: ${err.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during room validation' 
    });
  }
}; 