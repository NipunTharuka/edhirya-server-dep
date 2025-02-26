import { Types } from "mongoose";
import {User} from "../models/user.model";
import {Employee} from "../models/employee.model";
import {IRole} from "../models/role.model";
const ObjectId = Types.ObjectId;


export const aggregateUserRepo = (filters: any) => {
    return User.aggregate([
        {
            $match: {
                ...filters,
            },
        },
    ]).exec();
};

export const findOneUserRepo = (filters: any) => {
    return User.findOne(filters).exec();
};

export const findLatestUserRepo = async (filters? : any) => {
    return User.find(filters).sort({ createdAt: -1 }).limit(1).exec();
};
export const createUserRepo = (data: any) => {
    return new User(data).save();
};

export const getLoggedUserRepo = async (id: any) => {
    return User.aggregate([
        {
            $match: {
                _id: new ObjectId(id),
            },
        },
        {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "role",
            },
        },
        {
            $unwind: {
                path: "$role",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                role: {
                  name: 1
                },
                refNo: 1,
                name: {
                    $concat: [
                        { $ifNull: ["$firstname", ""] },
                        " ",
                        { $ifNull: ["$lastname", ""] },
                    ],
                },
                email: 1,
                imageUrl: 1,
                active: 1,
                mobile: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]).exec();
};

