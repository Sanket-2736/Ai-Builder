import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const setSessionCookie = (res, payload) => {
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "30d"
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/"
    });
};

export async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: "All fields required!"
        });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
        email: trimmedEmail
    });

    if (existing) {
        return res.status(400).json({
            error: "An account with this email already exists!"
        });
    }

    const user = await User.create({
        name,
        email: trimmedEmail,
        password
    });

    setSessionCookie(res, {
        userId: user._id.toString(),
        email: user.email
    });

    return res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    });
}

export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "All fields required!"
        });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
        email: trimmedEmail
    });

    if (!existing) {
        return res.status(401).json({
            error: "Invalid email or password!"
        });
    }

    const isValid = await existing.comparePassword(password);

    if (!isValid) {
        return res.status(401).json({
            error: "Invalid email or password!"
        });
    }

    setSessionCookie(res, {
        userId: existing._id.toString(),
        email: existing.email
    });

    return res.status(200).json({
        user: {
            _id: existing._id,
            email: existing.email,
            name: existing.name
        }
    });
}

export async function logout(_req, res) {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/"
    });

    return res.json({
        success: true
    });
}

export async function me(req, res) {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated!"
        });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
        return res.status(404).json({
            error: "User not found!"
        });
    }

    return res.json({
        user
    });
}