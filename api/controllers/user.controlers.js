import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.send("Hello of API");
};

//req.user.id получаем из middlewear "verifyUser"

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(403, "Вы можете обновить только свой аккаунт!"));

  try {
    if (req.body.password) {
      req.body.password === (await bcrypt.hashSync(req.body.password, 10));
    }
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updateUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Вы можете удалить только свой аккаунт!"));
  }
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("Аккаунт удален");
  } catch (error) {
    next(error);
  }
};

export const getUserListing = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    console.log(req);
    const listing = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listing);
  } else {
    return next(
      errorHandler(401, "Вы можете посмотреть только свои обьявления!")
    );
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      next(errorHandler(402, "Такой пользователь не сущестует!"));
    }

    const { password, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
