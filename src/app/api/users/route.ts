import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const body = await request.json();

    if (
        typeof body.name !== "string" ||
        typeof body.username !== "string" ||
        typeof body.email !== "string" ||
        typeof body.password !== "string"
    ) {
        return Response.json(
            { message: "入力値が不正です" },
            { status: 400 }
        );
    }

    if (
        body.name.trim() === "" ||
        body.username.trim() === "" ||
        body.email.trim() === "" ||
        body.password.trim() === ""
    ) {
        return Response.json(
            { message: "すべての項目を入力してください" },
            { status: 400 }
        );
    }

    if (body.password.length < 8) {
        return Response.json(
            { message: "パスワードは8文字以上にしてください" },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: body.email },
                { username: body.username },
            ],
        },
    });

    if (existingUser) {
        return Response.json(
            { message: "メールアドレスまたはユーザー名はすでに使われています" },
            { status: 409 },
        );
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
        data: {
            name: body.name,
            username: body.username,
            email: body.email,
            password: hashedPassword,
        },
    });

    return Response.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
    },
        { status: 201 }
    );
}