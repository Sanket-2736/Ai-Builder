import mongoose, { Schema } from "mongoose";
import { genSalt, hash, compare } from "bcrypt";

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (password) {
    return compare(password, this.password);
};

export const User = mongoose.model('User', UserSchema);