module.exports = mongoose => {
  let schema = mongoose.Schema(
    {
      userName: String,
      accountNumber: {
        type: Number,
        required: true,
        index: true
      },
      emailAddress: String,
      identityNumber: Number
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("user", schema);
  return User;
};
