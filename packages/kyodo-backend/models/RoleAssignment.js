import mongoose, { Schema } from 'mongoose';

const roleAssignmentSchema = new Schema({
  role: {
    type: String,
    enum: ['WORKER'],
  },
  operationJSON: String,
  address: String,
  accepted: Boolean,
  taskId: Number,
});

roleAssignmentSchema.statics.get = async ({ role, taskId }) => {
  const assignment = await RoleAssignment.findOne({
    taskId,
    role,
  });
  return assignment;
};

roleAssignmentSchema.statics.accept = async ({ role, taskId }) => {
  const assignment = await RoleAssignment.findOne({
    taskId,
    role,
  });
  assignment.accepted = true;
  await assignment.save();
  return assignment;
};

const RoleAssignment = mongoose.model('RoleAssignment', roleAssignmentSchema);

export default RoleAssignment;
